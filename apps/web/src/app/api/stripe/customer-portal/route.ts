import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@saas/db";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "You must be signed in to access the billing portal.",
            statusCode: 401,
          },
        },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NO_STRIPE_CUSTOMER",
            message: "No active Stripe customer found for this account. Please subscribe or purchase credits first.",
            statusCode: 400,
          },
        },
        { status: 400 },
      );
    }

    const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${origin}/dashboard/settings`,
    });

    return NextResponse.json({
      success: true,
      data: { url: portalSession.url },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PORTAL_ERROR",
          message,
          statusCode: 500,
        },
      },
      { status: 500 },
    );
  }
}
