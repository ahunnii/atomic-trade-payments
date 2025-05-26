import type {
  CheckoutData,
  CreateCustomerData,
  FormattedCheckoutSessionData,
  PaymentIntentData,
} from "./types";

export interface PaymentProcessor {
  createCheckoutSession(
    props: CheckoutData,
  ): Promise<{ sessionId: string; sessionUrl: string }>;

  getPaymentIntent(props: {
    paymentIntentId: string;
  }): Promise<PaymentIntentData>;

  getCheckoutSession(props: {
    sessionId: string;
  }): Promise<FormattedCheckoutSessionData>;

  formatCheckoutSessionData(props: {
    session: unknown;
  }): Promise<FormattedCheckoutSessionData>;

  createCustomer(props: CreateCustomerData): Promise<Record<string, string>>;

  getLineItems(props: { sessionId: string }): Promise<unknown[]>;

  // createPaymentLink(
  //   props: PaymentLinkData,
  // ): Promise<{ sessionId: string; sessionUrl: string }>;

  // createInvoice(
  //   props: InvoiceData,
  // ): Promise<{ invoiceId: string; invoiceUrl: string }>;
}
