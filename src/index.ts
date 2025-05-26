import type Stripe from "stripe";
import { PaymentProcessorFactory } from "./factory";

export const paymentService =
  PaymentProcessorFactory.createPaymentService("stripe");

export const paymentServiceType = PaymentProcessorFactory.paymentProcessorType;

export * from "./components";

export * from "./types";

export * from "./lib";

export * from "./clients";

export type { Stripe };

export { PaymentProcessorFactory };
