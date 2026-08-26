import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@saas/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required to fetch generation history.",
            statusCode: 401,
          },
        },
        { status: 401 },
      );
    }

    const generations = await prisma.voiceGeneration.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 25,
    });

    return NextResponse.json({
      success: true,
      data: generations.map((gen) => ({
        id: gen.id,
        status: gen.status,
        text: gen.text,
        voiceId: gen.voiceId,
        audioUrl: gen.audioUrl,
        duration: gen.duration,
        cost: gen.cost,
        creditsUsed: gen.creditsUsed,
        format: gen.format,
        errorMessage: gen.errorMessage,
        createdAt: gen.createdAt.toISOString(),
        updatedAt: gen.updatedAt.toISOString(),
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error fetching generations";
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_GENERATIONS_ERROR",
          message,
          statusCode: 500,
        },
      },
      { status: 500 },
    );
  }
}
