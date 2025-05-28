import type { Stripe } from "stripe";
import { InvoiceData } from "~/types";

import { InvoiceProcessor } from "../../payment-processor";

export class StripeInvoiceProcessor implements InvoiceProcessor {
  private stripeClient: Stripe;

  constructor(stripe: Stripe) {
    this.stripeClient = stripe;
  }

  async createInvoice(props: InvoiceData) {
    const customer = props.customer;

    const metadata = customer.metadata as Record<string, string> | null;
    let stripeCustomerId = metadata?.stripeCustomerId;

    if (!stripeCustomerId) {
      const stripeCustomer = await this.stripeClient.customers.create({
        email: props.email,
        description: "Customer to invoice",
      });

      stripeCustomerId = stripeCustomer.id;
    }

    const invoice = await this.stripeClient.invoices.create({
      customer: stripeCustomerId,
      collection_method: "send_invoice",
      days_until_due: 30,
      ...(props.hasTaxCollection && {
        automatic_tax: { enabled: true },
      }),
    });

    await Promise.all(
      props.items.map(async (item) => {
        const product = await this.stripeClient!.products.create({
          name: item.name,
          description: item.description,
          metadata: {
            variantId: item.variantId ?? "",
            productRequestId: item.productRequestId ?? "",
            stripeInvoiceId: invoice.id ?? "",
          },
        });

        const invoiceItem = await this.stripeClient!.invoiceItems.create({
          customer: stripeCustomerId,
          invoice: invoice.id ?? "",
          price_data: {
            currency: "usd",
            product: product.id,
            unit_amount: item.amountInCents,
          },
          quantity: item.quantity,
          metadata: {
            variantId: item.variantId ?? "",
            productRequestId: item.productRequestId ?? "",
          },
        });

        return invoiceItem;
      }),
    );

    const finalizedInvoice = await this.stripeClient.invoices.finalizeInvoice(
      invoice.id ?? "",
    );

    await this.stripeClient.invoices.sendInvoice(invoice.id ?? "");

    return {
      invoiceId: finalizedInvoice.id ?? "",
      invoiceUrl: finalizedInvoice?.hosted_invoice_url ?? "",
      customerMetadata: { stripeCustomerId },
    };
  }
}
