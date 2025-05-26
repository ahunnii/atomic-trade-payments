import type Stripe from "stripe";
import { stripeClient } from "../../clients/stripe";

type StripeLineItemMeta = {
  productId: string;
  variantId: string;
  orderItemId: string;
  cartItemId: string;
  cartId: string;
};

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

export const lineToOrderItems = async ({
  sessionId,
  handleStockUpdate,
}: {
  sessionId: string;
  handleStockUpdate?: (
    variantId: string,
    quantity: number,
  ) => Promise<{
    priceInCents: number;
  } | null>;
}) => {
  if (!stripeClient) {
    throw new Error("Stripe client not found");
  }

  const sessionLineItems = await stripeClient.checkout.sessions.listLineItems(
    sessionId,
    { expand: ["data.price.product"] },
  );

  const orderItems = await Promise.all(
    sessionLineItems.data?.map(async (item: Stripe.LineItem) => {
      const product = item?.price?.product as Stripe.Product;
      const metadata = product?.metadata as unknown as StripeLineItemMeta;

      const variant = await handleStockUpdate?.(
        metadata?.variantId,
        item?.quantity ?? 1,
      );

      // const variant = metadata?.variantId
      //   ? await db.variation.findUnique({
      //       where: { id: metadata?.variantId },
      //     })
      //   : null;

      // if (variant?.manageStock) {
      //   const currentStock = variant.stock;
      //   if (currentStock < (item.quantity ?? 1) || currentStock === 0) {
      //     throw new Error("Insufficient stock");
      //   }

      //   await db.variation.update({
      //     where: { id: variant.id },
      //     data: { stock: currentStock - (item.quantity ?? 1) },
      //   });
      // }

      return {
        name: product?.name ?? "Unknown Item",
        description: product?.description ?? "Default",
        variantId: metadata?.variantId ?? null,
        quantity: item.quantity ?? 1,
        unitPriceInCents:
          variant?.priceInCents ?? Number(item.price?.unit_amount) ?? 0,
        discountInCents: 0,
        totalPriceInCents: Number(item.price?.unit_amount) ?? 0,
        isPhysical: true,
        isTaxable: true,
        metadata: {
          discountReason: "",
          discountType: "",
        },
      };
    }) ?? [],
  );

  return {
    orderItems,
    discountInCents: 0,
    subtotalInCents: orderItems.reduce(
      (acc, item) => acc + item.totalPriceInCents * item.quantity,
      0,
    ),
    totalInCents:
      orderItems.reduce(
        (acc, item) => acc + item.totalPriceInCents * item.quantity,
        0,
      ) - 0,
  };
};
