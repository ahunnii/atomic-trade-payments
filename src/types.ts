export type CheckoutData = {
  cartId?: string;
  orderId?: string;
  customerId?: string;
  couponCode?: string;
  returnUrl?: string;
  successUrl?: string;
  storeId?: string;

  order?: Order;
  cart?: Cart;

  storeFlatRateAmount?: number;
};

export type PaymentIntentData = {
  paymentIntent: unknown;
  paymentReceipt: string;
  processorFee: number;
  amountPaid: number;
  intentId: string;
};

export type FormattedCheckoutSessionData = {
  totals: {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  };
  customer: {
    id?: string;
    email: string;
    name: string;
    phone?: string;
    metadata?: Record<string, string> | null;
  };
  shippingAddress: Address;
  billingAddress: Address;
  storeId?: string;
  sessionId?: string;
  orderMetadata?: Record<string, string> | null;
};

export type PaymentLinkData = {
  items: {
    name: string;
    description?: string;
    amountInCents: number;
    quantity: number;
    variantId?: string;
    variant?: {
      id: string;
      name: string;
      priceInCents: number;
      compareAtPriceInCents?: number;
      product: {
        featuredImage: string;
        id: string;
        name: string;
      };
    };
  }[];
  customerId?: string;
  couponCode?: string;
  returnUrl?: string;
  successUrl?: string;
  storeId?: string;
};

export type CreateCustomerData = {
  email: string;
  name: string;
  address?: {
    street: string;
    additional?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } | null;
};

export type InvoiceData = {
  email: string;
  items: {
    name: string;
    description?: string;
    amountInCents: number;
    quantity: number;
    variantId?: string;
    productRequestId?: string;
  }[];
  orderId: string;
  storeId: string;
  customer: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    metadata: Record<string, string> | null;
  };
};

export type OrderItem = {
  id: string;
  name: string;
  description?: string | null;
  variant?: {
    id: string;
    product: { featuredImage: string; id: string };
  } | null;
  totalPriceInCents: number;
  quantity: number;
};

export type Order = {
  id: string;
  orderItems: OrderItem[];
  discountInCents?: number;
};

export type Cart = {
  id: string;
  cartItems: CartItem[];
};

export type CartItem = {
  id: string;
  variantId: string;
  variant: {
    id: string;
    name: string;
    priceInCents: number;
    product: {
      featuredImage: string;
      id: string;
      name: string;
    };
  };
  quantity: number;
};

export type Address = {
  id?: string;
  name: string;
  firstName: string;
  lastName: string;
  street: string;
  additional?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type StoreOrder = {
  id: string;
  orderNumber: string;
  createdAt: Date;
  fulfillment: {
    status: string;
  };
  shippingAddress: Address;
  billingAddress: Address;
  customer: {
    email: string;
  };
  orderItems: {
    id: string;
    description: string;
    quantity: number;
    totalPriceInCents: number;
  }[];
  subtotalInCents: number;
  shippingInCents: number;
  totalInCents: number;
};

export type LineItemData = {
  id: string;
  name: string;
  quantity: number;
  priceInCents: number;
};
