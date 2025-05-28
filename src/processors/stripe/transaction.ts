import { type Stripe } from "stripe";

import { TransactionProcessor } from "../../payment-processor";

export class StripeTransactionProcessor implements TransactionProcessor {
  private stripeClient: Stripe;

  constructor(stripe: Stripe) {
    this.stripeClient = stripe;
  }

  async getPaymentIntent(props: { paymentIntentId: string }) {
    const paymentIntent = await this.stripeClient.paymentIntents.retrieve(
      props.paymentIntentId,
      { expand: ["latest_charge", "latest_charge.balance_transaction"] },
    );

    const latestCharge = paymentIntent.latest_charge as Stripe.Charge;
    const balanceTransaction =
      latestCharge?.balance_transaction as Stripe.BalanceTransaction;

    const processorFee = balanceTransaction?.fee ?? 0;
    const paymentReceipt = latestCharge?.receipt_url ?? "";

    return {
      paymentIntent,
      paymentReceipt,
      processorFee,
      amountPaid: paymentIntent.amount ?? 0,
      intentId: paymentIntent.id ?? "",
    };
  }

  async createPaymentIntent(props: { amount: number; currency?: string }) {
    const paymentIntent = await this.stripeClient.paymentIntents.create({
      amount: props.amount,
      currency: props.currency ?? "usd",
    });

    return {
      paymentIntent,
      intentId: paymentIntent.id ?? "",
    };
  }
}
