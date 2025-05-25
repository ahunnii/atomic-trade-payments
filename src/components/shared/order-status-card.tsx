import { CheckCircleIcon } from "@heroicons/react/24/solid";

export const OrderStatusCard = () => {
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-white p-5">
      <span className="text-xs font-semibold text-gray-500">Order Status</span>
      <div className="flex items-center gap-2">
        <CheckCircleIcon className="h-5 w-5 text-green-500" />
        <span className="font-medium text-green-700">Confirmed</span>
      </div>
      <span className="text-xs text-gray-400">
        Your order was placed successfully.
      </span>
    </div>
  );
};
