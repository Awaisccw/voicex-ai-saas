import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import {
  prisma,
  SubscriptionStatus,
  SubscriptionTier,
  TransactionType,
} from "@saas/db";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = headers();
  const signature = headersList.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing stripe-signature header or STRIPE_WEBHOOK_SECRET" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Invalid signature";
    // eslint-disable-next-line no-console
    console.error(`⚠️ Stripe Webhook signature verification failed: ${errorMsg}`);
    return NextResponse.json({ error: `Webhook Error: ${errorMsg}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata ?? {};
        const userId = metadata.userId;

        if (!userId) {
          // eslint-disable-next-line no-console
          console.warn("⚠️ checkout.session.completed received without userId in metadata");
          break;
        }

        const customerId = typeof session.customer === "string" ? session.customer : null;

        // Handle one-time credit pack purchase
        if (metadata.checkoutType === "credit_pack") {
          const creditAmount = parseInt(metadata.creditAmount ?? "0", 10);
          const packId = metadata.packId ?? "credit_pack";

          if (creditAmount > 0) {
            await prisma.$transaction([
              prisma.user.update({
                where: { id: userId },
                data: {
                  credits: { increment: creditAmount },
                  ...(customerId ? { stripeCustomerId: customerId } : {}),
                },
              }),
              prisma.creditTransaction.create({
                data: {
                  userId,
                  amount: creditAmount,
                  type: TransactionType.PURCHASE,
                  description: `Purchased ${creditAmount.toLocaleString()} credits (${packId})`,
                  stripeSessionId: session.id,
                },
              }),
            ]);
          }
        }

        // Handle recurring subscription start
        if (metadata.checkoutType === "subscription" && session.subscription) {
          const planTier = (metadata.planTier as SubscriptionTier) ?? SubscriptionTier.CREATOR;
          const monthlyCredits = parseInt(metadata.monthlyCredits ?? "25000", 10);
          const stripeSubscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;

          // Retrieve full subscription details from Stripe
          const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);

          await prisma.$transaction([
            prisma.user.update({
              where: { id: userId },
              data: {
                tier: planTier,
                credits: { increment: monthlyCredits },
                ...(customerId ? { stripeCustomerId: customerId } : {}),
              },
            }),
            prisma.subscription.upsert({
              where: { stripeSubscriptionId },
              create: {
                userId,
                stripeSubscriptionId,
                stripePriceId: stripeSub.items.data[0]?.price.id ?? "",
                stripeCurrentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
                status: SubscriptionStatus.ACTIVE,
                planTier,
              },
              update: {
                status: SubscriptionStatus.ACTIVE,
                planTier,
                stripeCurrentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
              },
            }),
            prisma.creditTransaction.create({
              data: {
                userId,
                amount: monthlyCredits,
                type: TransactionType.BONUS,
                description: `Monthly credit allocation for ${planTier} plan`,
                stripeSessionId: session.id,
              },
            }),
          ]);
        }

        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const statusMap: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
          active: SubscriptionStatus.ACTIVE,
          past_due: SubscriptionStatus.PAST_DUE,
          unpaid: SubscriptionStatus.UNPAID,
          canceled: SubscriptionStatus.CANCELED,
          incomplete: SubscriptionStatus.INCOMPLETE,
          incomplete_expired: SubscriptionStatus.INCOMPLETE_EXPIRED,
          trialing: SubscriptionStatus.TRIALING,
          paused: SubscriptionStatus.ACTIVE,
        };

        const dbStatus = statusMap[sub.status] ?? SubscriptionStatus.ACTIVE;

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: dbStatus,
            stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        const existingSub = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: sub.id },
        });

        if (existingSub) {
          await prisma.$transaction([
            prisma.subscription.update({
              where: { id: existingSub.id },
              data: { status: SubscriptionStatus.CANCELED },
            }),
            prisma.user.update({
              where: { id: existingSub.userId },
              data: { tier: SubscriptionTier.FREE },
            }),
          ]);
        }
        break;
      }

      default:
        // Ignore unhandled event types
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Webhook handling failed";
    // eslint-disable-next-line no-console
    console.error(`❌ Error processing webhook event ${event.type}:`, errorMsg);
    return NextResponse.json(
      { error: "Webhook event processing failed" },
      { status: 500 },
    );
  }
}
