import Link from "next/link";

type Props = {
  backToAccount?: boolean;
  orderNumber: string;
  createdAt: Date;
};

export const OrderHeader = ({
  backToAccount,
  orderNumber,
  createdAt,
}: Props) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        {backToAccount && (
          <Link
            href="/account/orders"
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
          </Link>
        )}
        <div>
          <h1 className="text-2xl font-bold">Order {orderNumber}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Confirmed {new Date(createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      {!backToAccount && (
        <div className="mt-4 md:mt-0">
          <Link
            href="/"
            className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Back to home
          </Link>
        </div>
      )}
    </div>
  );
};
