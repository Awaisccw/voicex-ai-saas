import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type Stripe from "stripe";
import { authOptions } from "@/lib/auth";
import { prisma } from "@saas/db";
import { stripe, SUBSCRIPTION_PLANS, CREDIT_PACKS } from "@/lib/stripe";
import { z } from "zod";

const checkoutSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("subscription"),
    planId: z.enum(["CREATOR", "PRO"]),
  }),
  z.object({
    type: z.literal("credit_pack"),
    packId: z.enum(["credits_1k", "credits_5k", "credits_20k"]),
  }),
]);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "You must be signed in to initiate a checkout session.",
            statusCode: 401,
          },
        },
        { status: 401 },
      );
    }

    const body = await req.json();
    const parseResult = checkoutSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parseResult.error.errors[0]?.message ?? "Invalid checkout request payload",
            statusCode: 400,
          },
        },
        { status: 400 },
      );
    }

    const payload = parseResult.data;
    const userId = session.user.id;

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User account not found.",
            statusCode: 404,
          },
        },
        { status: 404 },
      );
    }

    // Ensure Stripe Customer exists for this user
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customerParams: Stripe.CustomerCreateParams = {
        email: user.email,
        metadata: {
          userId: user.id,
        },
      };

      if (user.name) {
        customerParams.name = user.name;
      }

      const customer = await stripe.customers.create(customerParams);
      customerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    if (payload.type === "subscription") {
      const plan = SUBSCRIPTION_PLANS[payload.planId];

      const checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: plan.priceId,
            quantity: 1,
          },
        ],
        success_url: `${origin}/dashboard/settings?checkout=success&type=subscription&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/dashboard/settings?checkout=cancelled`,
        metadata: {
          userId: user.id,
          checkoutType: "subscription",
          planTier: plan.id,
          monthlyCredits: String(plan.monthlyCredits),
        },
        subscription_data: {
          metadata: {
            userId: user.id,
            planTier: plan.id,
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: { url: checkoutSession.url },
      });
    } else {
      const pack = CREDIT_PACKS.find((p) => p.id === payload.packId);

      if (!pack) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "PACK_NOT_FOUND",
              message: "Credit pack configuration not found",
              statusCode: 404,
            },
          },
          { status: 404 },
        );
      }

      const checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${pack.name} (${pack.credits.toLocaleString()} AI Voiceover Credits)`,
                description: `One-time top-up of ${pack.credits.toLocaleString()} characters for VOICEX AI Studio.`,
              },
              unit_amount: pack.priceUsd * 100, // in cents
            },
            quantity: 1,
          },
        ],
        success_url: `${origin}/dashboard/settings?checkout=success&type=credits&amount=${pack.credits}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/dashboard/settings?checkout=cancelled`,
        metadata: {
          userId: user.id,
          checkoutType: "credit_pack",
          packId: pack.id,
          creditAmount: String(pack.credits),
        },
      });

      return NextResponse.json({
        success: true,
        data: { url: checkoutSession.url },
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "STRIPE_CHECKOUT_ERROR",
          message,
          statusCode: 500,
        },
      },
      { status: 500 },
    );
  }
}
