type Address = {
  name: string;
  street: string;
  additional?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};
export const ShippingBillingInfoCard = ({
  shippingAddress,
  billingAddress,
  email,
}: {
  shippingAddress?: Address | null;
  billingAddress?: Address | null;
  email: string;
}) => {
  return (
    <div className="grid grid-cols-1 gap-6 rounded-lg border bg-white p-5 md:grid-cols-2">
      {/* Contact Info & Shipping Address */}
      <div>
        <h3 className="mb-2 text-sm font-semibold">Contact information</h3>
        <div className="mb-4 text-sm text-gray-700">{email}</div>
        <h3 className="mb-2 text-sm font-semibold">Shipping address</h3>
        {shippingAddress && (
          <div className="space-y-1 text-sm text-gray-700">
            <div>{shippingAddress.name}</div>
            <div>{shippingAddress.street}</div>
            {shippingAddress.additional && (
              <div>{shippingAddress.additional}</div>
            )}
            <div>
              {shippingAddress.city}, {shippingAddress.state}{" "}
              {shippingAddress.postalCode}
            </div>
            <div>{shippingAddress.country}</div>
          </div>
        )}
        <h3 className="mb-2 mt-4 text-sm font-semibold">Shipping method</h3>
        <div className="text-sm text-gray-700">Standard Shipping</div>
      </div>
      {/* Billing Address */}
      <div>
        <h3 className="mb-2 text-sm font-semibold">Billing address</h3>
        {billingAddress && (
          <div className="space-y-1 text-sm text-gray-700">
            <div>{billingAddress.name}</div>
            <div>{billingAddress.street}</div>
            {billingAddress.additional && (
              <div>{billingAddress.additional}</div>
            )}
            <div>
              {billingAddress.city}, {billingAddress.state}{" "}
              {billingAddress.postalCode}
            </div>
            <div>{billingAddress.country}</div>
          </div>
        )}
      </div>
    </div>
  );
};
