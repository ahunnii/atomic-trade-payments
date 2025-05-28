import { type PaymentProcessor } from "./payment-processor";
import { StripePaymentProcessor } from "./processors/stripe";

export class PaymentProcessorFactory {
  static paymentProcessorType = process.env.PAYMENT_PROCESSOR_TYPE ?? "stripe";

  static setPaymentProcessorType(type: string) {
    PaymentProcessorFactory.paymentProcessorType = type;
  }

  static createPaymentService(processorType: string): PaymentProcessor {
    this.setPaymentProcessorType(processorType);

    switch (processorType) {
      case "stripe":
        if (
          process.env.STRIPE_SECRET_KEY === undefined ||
          process.env.STRIPE_SECRET_KEY === ""
        ) {
          throw new Error("STRIPE_SECRET_KEY is not set");
        }
        return new StripePaymentProcessor(process.env.STRIPE_SECRET_KEY);

      default:
        throw new Error("Unsupported payment processor type");
    }
  }
}
