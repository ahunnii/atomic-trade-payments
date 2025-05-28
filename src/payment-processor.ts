import type {
  CheckoutData,
  CreateCustomerData,
  CreatePaymentIntentData,
  CreatePaymentIntentProps,
  FormattedCheckoutSessionData,
  InvoiceData,
  PaymentIntentData,
  PaymentLinkData,
} from "./types";

export interface PaymentProcessor {
  createCustomer(props: CreateCustomerData): Promise<Record<string, string>>;

  createPaymentLink(
    props: PaymentLinkData,
  ): Promise<{ sessionId: string; sessionUrl: string }>;

  invoice: InvoiceProcessor;
  transaction: TransactionProcessor;
  checkout: CheckoutProcessor;
}

export interface InvoiceProcessor {
  createInvoice(props: InvoiceData): Promise<{
    invoiceId: string;
    invoiceUrl: string;
    customerMetadata?: Record<string, string>;
  }>;
}

export interface TransactionProcessor {
  getPaymentIntent(props: {
    paymentIntentId: string;
  }): Promise<PaymentIntentData>;

  createPaymentIntent(
    props: CreatePaymentIntentProps,
  ): Promise<CreatePaymentIntentData>;
}

export interface CheckoutProcessor {
  createCheckoutSession(
    props: CheckoutData,
  ): Promise<{ sessionId: string; sessionUrl: string }>;
  getCheckoutSession(props: {
    sessionId: string;
  }): Promise<FormattedCheckoutSessionData>;

  formatCheckoutSessionData(props: {
    session: unknown;
  }): Promise<FormattedCheckoutSessionData>;

  getLineItems(props: { sessionId: string }): Promise<unknown[]>;
}

export interface CustomerProcessor {
  createCustomer(props: CreateCustomerData): Promise<Record<string, string>>;
}
