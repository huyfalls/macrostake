import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string | null
): Promise<string> {
  const existing = await stripe.customers.search({
    query: `metadata['userId']:'${userId}'`,
    limit: 1,
  });
  if (existing.data.length > 0) return existing.data[0].id;

  const customer = await stripe.customers.create({
    email,
    name: name ?? undefined,
    metadata: { userId },
  });
  return customer.id;
}

export async function chargePenalty(
  stripeCustomerId: string,
  paymentMethodId: string,
  amountUsd: number,
  description: string
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.create({
    amount:               Math.round(amountUsd * 100), // cents
    currency:             "usd",
    customer:             stripeCustomerId,
    payment_method:       paymentMethodId,
    confirm:              true,
    off_session:          true,
    description,
    metadata: { type: "penalty" },
  });
}

export async function refundPenalty(
  chargeId: string,
  amountUsd: number,
  reason: string
): Promise<Stripe.Refund> {
  return stripe.refunds.create({
    charge:   chargeId,
    amount:   Math.round(amountUsd * 100),
    metadata: { reason },
  });
}

export function constructWebhookEvent(body: string, sig: string): Stripe.Event {
  return stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
