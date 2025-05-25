import type Stripe from "stripe";

import { StoreOrder } from "~/types";
import { stripeClient } from "../../clients/stripe";
import { OrderHeader } from "../shared/order-header";
import { OrderStatusCard } from "../shared/order-status-card";
import { OrderSummaryCard } from "../shared/order-summary-card";
import { ShipmentStatusCard } from "../shared/shipment-status-card";
import { ShippingBillingInfoCard } from "../shared/shipping-billing-info-card";

type Props = {
  session_id: string;
  backToAccount?: boolean;
  order?: StoreOrder | null;
};
export const StripeCompletedOrder = async ({
  session_id,
  order,
  backToAccount = false,
}: Props) => {
  let isSuccess = false;
  let errorMessage = "";
  let session = null;
  // let order = null;
  let paymentIntent = null;
  let latestCharge = null;

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

    if (isSuccess) {
      // Delete the cart after successful payment
      // const cartId = await getCartId();
      // if (cartId) {
      //   await api.cart.delete(cartId);
      //   await clearCartId();
      // }
      // order = await db.order.findFirst({
      //   where: {
      //     metadata: {
      //       equals: {
      //         stripeCheckoutSessionId: session.id,
      //       },
      //     },
      //   },
      //   include: { fulfillment: true },
      // });
    } else {
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

  return (
    <div className="mx-auto mt-10 max-w-5xl px-2 md:px-0">
      <OrderHeader
        backToAccount={backToAccount}
        orderNumber={order?.orderNumber ?? session.id}
        createdAt={new Date(session.created * 1000)}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <OrderStatusCard />
        <ShipmentStatusCard status={order?.fulfillment?.status ?? "PENDING"} />
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
