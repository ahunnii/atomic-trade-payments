export const ShipmentStatusCard = ({ status }: { status: string }) => {
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-white p-5">
      <span className="text-xs font-semibold text-gray-500">Shipment</span>
      <div className="flex items-center gap-2">
        {/* <span className="material-icons text-base text-gray-500">
      local_shipping
    </span> */}
        <span className="font-medium text-gray-700">
          {status === "PENDING"
            ? "Preparing for shipment"
            : status === "FULFILLED"
              ? "Shipped"
              : status === "RESTOCKED"
                ? "Restocked"
                : status === "CANCELLED"
                  ? "Cancelled"
                  : "Unfulfilled"}
        </span>
      </div>
      <span className="text-xs text-gray-400">
        We will notify you when your order ships.
      </span>
    </div>
  );
};
