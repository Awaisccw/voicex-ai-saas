import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@saas/db";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required to query generation status.",
            statusCode: 401,
          },
        },
        { status: 401 },
      );
    }

    const generationId = params.id;

    const generation = await prisma.voiceGeneration.findUnique({
      where: { id: generationId },
    });

    if (!generation) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Voice generation record not found.",
            statusCode: 404,
          },
        },
        { status: 404 },
      );
    }

    // Ensure the requester owns this generation job
    if (generation.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You do not have permission to view this generation.",
            statusCode: 403,
          },
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: generation.id,
        status: generation.status,
        text: generation.text,
        voiceId: generation.voiceId,
        audioUrl: generation.audioUrl,
        duration: generation.duration,
        cost: generation.cost,
        creditsUsed: generation.creditsUsed,
        format: generation.format,
        errorMessage: generation.errorMessage,
        createdAt: generation.createdAt.toISOString(),
        updatedAt: generation.updatedAt.toISOString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal status lookup failure";
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "STATUS_LOOKUP_ERROR",
          message,
          statusCode: 500,
        },
      },
      { status: 500 },
    );
  }
}
