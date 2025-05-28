import type Stripe from "stripe";

import { PaymentProcessorFactory } from "./factory";

export const paymentService = PaymentProcessorFactory.createPaymentService(
  process.env.PAYMENT_PROCESSOR_TYPE ?? "stripe",
);

export const paymentServiceType = PaymentProcessorFactory.paymentProcessorType;

export * from "./components";

export * from "./types";

export * from "./lib";

export * from "./clients";

export type { Stripe };

export { PaymentProcessorFactory };
