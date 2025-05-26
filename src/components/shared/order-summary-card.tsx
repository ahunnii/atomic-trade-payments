import { formatCurrency } from "../../lib/currency";

type Item = {
  id: string;
  name: string;
  quantity: number;
  priceInCents: number;
};

type Props = {
  items: Item[];
  subtotalInCents: number;
  shippingInCents: number;
  totalInCents: number;
};
export const OrderSummaryCard = ({
  items,
  subtotalInCents,
  shippingInCents,
  totalInCents,
}: Props) => {
  return (
    <div className="h-fit space-y-4 rounded-lg border bg-white p-5">
      <h3 className="mb-3 text-lg font-semibold">Order Summary</h3>
      <div className="divide-y divide-gray-200">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-200 text-xs font-bold text-gray-400">
              {item.name?.charAt(0) ?? "?"}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 font-medium text-gray-900">
                {item.name}
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  x{item.quantity}
                </span>
              </div>
            </div>
            <div className="text-base font-semibold text-gray-800">
              {formatCurrency(item.priceInCents)}
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2 border-t pt-4">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotalInCents ?? 0)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span>{formatCurrency(shippingInCents ?? 0)}</span>
        </div>
        <div className="flex justify-between text-base font-bold">
          <span>Total</span>
          <span>{formatCurrency(totalInCents ?? 0)}</span>
        </div>
      </div>
    </div>
  );
};
