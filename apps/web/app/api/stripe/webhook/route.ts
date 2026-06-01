import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent, refundPenalty } from "@/lib/stripe";
import { prisma } from "@macrostake/db";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature") ?? "";

  let event;
  try {
    event = constructWebhookEvent(body, sig);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object as any;
      await prisma.transaction.updateMany({
        where: { stripeIntentId: pi.id },
        data:  { status: "COMPLETED" },
      });
      break;
    }

    case "payment_intent.payment_failed": {
      const pi = event.data.object as any;
      // Mark penalty as failed — admin can retry
      await prisma.penalty.updateMany({
        where: { stripeChargeId: pi.id },
        data:  { status: "PENDING" },
      });
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as any;
      await prisma.transaction.create({
        data: {
          userId:        charge.metadata?.userId ?? "",
          type:          "EARN_BACK_REFUND",
          amount:        -(charge.amount_refunded / 100),
          description:   "Earn-back refund",
          status:        "COMPLETED",
          stripeIntentId: charge.payment_intent,
        },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}

export const dynamic = "force-dynamic";
