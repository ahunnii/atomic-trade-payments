import type { Stripe as StripeType } from "stripe";
import Stripe from "stripe";

import type { PaymentProcessor } from "../../payment-processor";
import type { CreateCustomerData, PaymentLinkData } from "../../types";

import { StripeCheckoutProcessor } from "./checkout";
import { StripeInvoiceProcessor } from "./invoice";
import { StripeTransactionProcessor } from "./transaction";

const origin =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : process.env.NEXT_PUBLIC_HOSTNAME;

export class StripePaymentProcessor implements PaymentProcessor {
  private stripeClient: StripeType;
  public invoice: StripeInvoiceProcessor;
  public transaction: StripeTransactionProcessor;
  public checkout: StripeCheckoutProcessor;

  constructor(apiKey: string) {
    this.stripeClient = new Stripe(apiKey, { apiVersion: "2025-04-30.basil" });

    this.invoice = new StripeInvoiceProcessor(this.stripeClient);
    this.transaction = new StripeTransactionProcessor(this.stripeClient);
    this.checkout = new StripeCheckoutProcessor(this.stripeClient);
  }

  async createCustomer(props: CreateCustomerData) {
    const stripeCustomer = await this.stripeClient.customers.create({
      email: props.email,
      name: props.name,
      ...(props?.address && {
        address: {
          line1: props.address.street ?? "",
          line2: props.address.additional ?? "",
          city: props.address.city ?? "",
          state: props.address.state ?? "",
          postal_code: props.address.postalCode ?? "",
          country: props.address.country ?? "",
        },
      }),
    });

    return { stripeCustomerId: stripeCustomer.id };
  }

  async createPaymentLink(props: PaymentLinkData) {
    let line_items: StripeType.PaymentLinkCreateParams.LineItem[] = [];

    if (props.items) {
      line_items = await Promise.all(
        props.items.map(async (item) => {
          let variant = item?.variant ?? null;

          const price = await this.stripeClient.prices.create({
            unit_amount: item.amountInCents,
            currency: "usd",
            product_data: {
              name: item.name ?? variant?.product?.name ?? "Product",
              metadata: {
                productId: variant?.product?.id ?? "",
                variantId: variant?.id ?? "",
                compareAtPrice: variant?.compareAtPriceInCents ?? "",
                price: variant?.priceInCents ?? "",
              },
            },
          });

          return {
            price: price.id,
            quantity: item.quantity,
          };
        }),
      );
    }

    const session = await this.stripeClient.paymentLinks.create({
      line_items,
      // automatic_tax: { enabled: true },
      payment_method_types: ["card"],
      currency: "usd",
      after_completion: {
        type: "redirect",
        redirect: {
          url:
            props.successUrl ??
            `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        },
      },
      metadata: {
        storeId: props?.storeId ?? "",
      },
    });

    return { sessionId: session.id, sessionUrl: session?.url ?? "" };
  }
}
