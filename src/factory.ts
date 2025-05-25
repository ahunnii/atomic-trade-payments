import { type PaymentProcessor } from "./payment-processor";
import { StripePaymentProcessor } from "./processors/stripe";

export class PaymentProcessorFactory {
  static paymentProcessorType = "manual";

  static setPaymentProcessorType(type: string) {
    PaymentProcessorFactory.paymentProcessorType = type;
  }

  static createPaymentService(processorType: string): PaymentProcessor {
    this.setPaymentProcessorType(processorType);

    switch (processorType) {
      case "stripe":
        return new StripePaymentProcessor();

      default:
        throw new Error("Unsupported payment processor type");
    }
  }
}
