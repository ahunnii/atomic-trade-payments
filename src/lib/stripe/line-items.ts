import type Stripe from "stripe";

type CartToLineItemsProps = {
  cartId: string;
  cartItems: {
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
  }[];
};

type OrderToLineItemsProps = {
  orderId: string;
  orderItems: {
    id: string;
    name: string;
    description?: string | null;
    variant?: {
      id: string;
      product: { featuredImage: string; id: string };
    } | null;
    totalPriceInCents: number;
    quantity: number;
  }[];
};

export function cartToLineItems({ cartId, cartItems }: CartToLineItemsProps) {
  return cartItems.map((item) => {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item?.variant?.product?.name ?? "Custom Product",
          description: item?.variant?.name ?? "Default",
          images: [
            item?.variant?.product?.featuredImage
              ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/products/${item?.variant?.product?.featuredImage}`
              : `${process.env.NEXT_PUBLIC_STORAGE_URL}/misc/placeholder-image.webp`,
          ],
          metadata: {
            productId: item?.variant?.product?.id ?? "",
            variantId: item?.variant?.id ?? "",
            orderItemId: item?.id ?? "",
            cartItemId: item?.id ?? "",
            cartId: cartId ?? "",
          },
        },

        unit_amount: item?.variant?.priceInCents,
      },

      quantity: item.quantity,
    } as Stripe.Checkout.SessionCreateParams.LineItem;
  });
}

export const orderToLineItems = ({
  orderId,
  orderItems,
}: OrderToLineItemsProps) => {
  return orderItems.map((item) => {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item?.name ?? "Custom Product",
          description: item?.description ?? "",
          images: [
            item?.variant?.product?.featuredImage
              ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/products/${item?.variant?.product?.featuredImage}`
              : `${process.env.NEXT_PUBLIC_STORAGE_URL}/misc/placeholder-image.webp`,
          ],
          metadata: {
            productId: item?.variant?.product?.id ?? "",
            variantId: item?.variant?.id ?? "",
            orderItemId: item?.id ?? "",
            orderId: orderId ?? "",
          },
        },
        unit_amount: item?.totalPriceInCents,
      },

      quantity: item.quantity,
    };
  });
};
