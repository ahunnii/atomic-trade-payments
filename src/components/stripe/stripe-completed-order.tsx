import type Stripe from "stripe";
import { formatEmailDomain } from "../../lib/email";

import type { StoreOrder } from "../../types";

import { stripeClient } from "../../clients/stripe";
import { OrderHeader } from "../shared/order-header";
import { OrderStatusCard } from "../shared/order-status-card";
import { OrderSummaryCard } from "../shared/order-summary-card";
import { CopyableSessionId } from "../shared/session-id-copy-to";
import { ShipmentStatusCard } from "../shared/shipment-status-card";
import { ShippingBillingInfoCard } from "../shared/shipping-billing-info-card";

type Props = {
  session_id: string;
  backToAccount?: boolean;
  order?: StoreOrder | null;
  handleCartCleanup?: () => void;
};

export const StripeCompletedOrder = async ({
  session_id,
  order,
  backToAccount = false,
  handleCartCleanup,
}: Props) => {
  let isSuccess = false;
  let errorMessage = "";
  let session = null;
  let paymentIntent = null;
  let latestCharge = null;

  const supportEmail = `support@${formatEmailDomain()}`;
  try {
    if (!stripeClient) {
      throw new Error("Stripe client not initialized");
    }

    session = (await stripeClient.checkout.sessions.retrieve(session_id, {
      expand: ["line_items", "customer", "payment_intent.latest_charge"],
    })) as Stripe.Checkout.Session;
    isSuccess = session.payment_status === "paid";
    paymentIntent = session.payment_intent as Stripe.PaymentIntent;
    latestCharge = paymentIntent.latest_charge as Stripe.Charge;

    if (isSuccess && handleCartCleanup) {
      handleCartCleanup();
    }

    if (!isSuccess) {
      errorMessage = "Your payment was not successful. Please try again.";
    }
  } catch (error) {
    console.error(error);
    errorMessage =
      "There was an error processing your payment. Please try again.";
  }

  if (!isSuccess || !session || paymentIntent?.status !== "succeeded") {
    const failureReason =
      paymentIntent?.last_payment_error?.message ??
      latestCharge?.failure_message ??
      errorMessage ??
      "Your payment was not successful. Please try again.";
    return (
      <div className="mx-auto mt-10 max-w-2xl rounded-xl border bg-red-50 p-8 shadow-lg">
        <h2 className="mb-4 text-2xl font-semibold text-red-700">
          Payment Failed
        </h2>
        <p className="text-red-600">{failureReason}</p>
      </div>
    );
  }

  // If payment succeeded but order is null, show support message
  if (!order) {
    return (
      <div className="mx-auto mt-10 max-w-2xl rounded-xl border bg-yellow-50 p-8 shadow-lg">
        <h2 className="mb-4 text-2xl font-semibold text-yellow-700">
          Payment Successful - Order Processing Issue
        </h2>
        <p className="mb-4 text-yellow-600">
          Your payment was successful, but we encountered an issue processing
          your order. Please contact our support team with the following session
          ID:
        </p>
        <CopyableSessionId sessionId={session_id} />
        <p className="mt-4 text-sm text-yellow-600">
          Our team will help resolve this issue and ensure your order is
          properly processed. You can reach us at{" "}
          <a
            href={`mailto:${supportEmail}`}
            className="font-medium text-yellow-700 underline hover:text-yellow-800"
          >
            {supportEmail}
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 max-w-5xl px-2 md:px-0">
      <OrderHeader
        backToAccount={backToAccount}
        orderNumber={order.orderNumber}
        createdAt={new Date(session.created * 1000)}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <OrderStatusCard />
        <ShipmentStatusCard status={order.fulfillment?.status ?? "PENDING"} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          <ShippingBillingInfoCard
            shippingAddress={
              session.collected_information?.shipping_details
                ? {
                    name: `${session.collected_information.shipping_details.name}`,
                    street:
                      session.collected_information.shipping_details.address
                        ?.line1 ?? "",
                    additional:
                      session.collected_information.shipping_details.address
                        ?.line2 ?? "",
                    city:
                      session.collected_information.shipping_details.address
                        ?.city ?? "",
                    state:
                      session.collected_information.shipping_details.address
                        ?.state ?? "",
                    postalCode:
                      session.collected_information.shipping_details.address
                        ?.postal_code ?? "",
                    country:
                      session.collected_information.shipping_details.address
                        ?.country ?? "",
                  }
                : null
            }
            billingAddress={
              session.customer_details?.address
                ? {
                    name: `${session.customer_details.name}`,
                    street: session.customer_details.address.line1 ?? "",
                    additional: session.customer_details.address.line2 ?? "",
                    city: session.customer_details.address.city ?? "",
                    state: session.customer_details.address.state ?? "",
                    postalCode:
                      session.customer_details.address.postal_code ?? "",
                    country: session.customer_details.address.country ?? "",
                  }
                : null
            }
            email={session.customer_details?.email ?? ""}
          />
        </div>

        <OrderSummaryCard
          items={
            session.line_items?.data.map((item) => ({
              id: item.id,
              name: item.description ?? "",
              quantity: item.quantity ?? 0,
              priceInCents: item.amount_total ?? 0,
            })) ?? []
          }
          subtotalInCents={session.amount_subtotal ?? 0}
          shippingInCents={session.total_details?.amount_shipping ?? 0}
          totalInCents={session.amount_total ?? 0}
        />
      </div>
    </div>
  );
};
