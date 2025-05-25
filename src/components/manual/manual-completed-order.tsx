import { StoreOrder } from "~/types";
import { OrderHeader } from "../shared/order-header";
import { OrderStatusCard } from "../shared/order-status-card";
import { OrderSummaryCard } from "../shared/order-summary-card";
import { ShipmentStatusCard } from "../shared/shipment-status-card";
import { ShippingBillingInfoCard } from "../shared/shipping-billing-info-card";

type Props = {
  backToAccount?: boolean;
  order?: StoreOrder | null;
};
export const ManualCompletedOrder = async ({
  backToAccount = false,
  order,
}: Props) => {
  if (!order) {
    return (
      <div className="mx-auto mt-10 max-w-2xl rounded-xl border bg-red-50 p-8 shadow-lg">
        <h2 className="mb-4 text-2xl font-semibold text-red-700">
          Order Not Found
        </h2>
        <p className="text-red-600">
          The order you are looking for does not exist.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 max-w-5xl px-2 md:px-0">
      <OrderHeader
        backToAccount={backToAccount}
        orderNumber={order?.orderNumber ?? ""}
        createdAt={new Date(order?.createdAt ?? new Date())}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <OrderStatusCard />
        <ShipmentStatusCard status={order?.fulfillment?.status ?? "PENDING"} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          <ShippingBillingInfoCard
            shippingAddress={
              order?.shippingAddress
                ? {
                    name: `${order?.shippingAddress.firstName} ${order?.shippingAddress.lastName}`,
                    street: order?.shippingAddress.street ?? "",
                    additional: order?.shippingAddress.additional ?? "",
                    city: order?.shippingAddress.city ?? "",
                    state: order?.shippingAddress.state ?? "",
                    postalCode: order?.shippingAddress.postalCode ?? "",
                    country: order?.shippingAddress.country ?? "",
                  }
                : null
            }
            billingAddress={
              order?.billingAddress
                ? {
                    name: `${order?.billingAddress.firstName} ${order?.billingAddress.lastName}`,
                    street: order?.billingAddress.street ?? "",
                    additional: order?.billingAddress.additional ?? "",
                    city: order?.billingAddress.city ?? "",
                    state: order?.billingAddress.state ?? "",
                    postalCode: order?.billingAddress.postalCode ?? "",
                    country: order?.billingAddress.country ?? "",
                  }
                : null
            }
            email={order?.customer?.email ?? ""}
          />
        </div>

        <OrderSummaryCard
          items={
            order?.orderItems.map((item) => ({
              id: item.id,
              name: item.description ?? "",
              quantity: item.quantity,
              priceInCents: item.totalPriceInCents,
            })) ?? []
          }
          subtotalInCents={order?.subtotalInCents ?? 0}
          shippingInCents={order?.shippingInCents ?? 0}
          totalInCents={order?.totalInCents ?? 0}
        />
      </div>
    </div>
  );
};
