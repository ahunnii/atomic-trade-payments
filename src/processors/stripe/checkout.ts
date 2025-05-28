import type { Stripe } from "stripe";

import type { CheckoutProcessor } from "../../payment-processor";
import type { CheckoutData } from "../../types";

import { cartToCoupon, orderToCoupon } from "../../lib/stripe/coupons";
import { cartToLineItems, orderToLineItems } from "../../lib/stripe/line-items";

const origin =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : process.env.NEXT_PUBLIC_HOSTNAME;

export class StripeCheckoutProcessor implements CheckoutProcessor {
  private stripeClient: Stripe;

  constructor(stripe: Stripe) {
    this.stripeClient = stripe;
  }

  async createCheckoutSession(props: CheckoutData) {
    let line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let orderDiscount: Stripe.Checkout.SessionCreateParams.Discount | undefined;
    let shippingCost = 0;

    if (props.order) {
      line_items = orderToLineItems({
        orderId: props.order.id,
        orderItems: props.order.orderItems,
      });

      const couponData = orderToCoupon({
        id: props.order.id,
        discountInCents: props.order.discountInCents ?? 0,
      });

      const coupon = couponData
        ? await this.stripeClient.coupons.create(couponData)
        : null;

      orderDiscount = coupon ? { coupon: coupon.id } : undefined;

      shippingCost = props?.storeFlatRateAmount ?? 0;
    }

    if (props.cart) {
      line_items = cartToLineItems({
        cartId: props.cart.id,
        cartItems: props.cart.cartItems,
      });

      const couponData = cartToCoupon({
        id: props.cart.id,
        discountInCents: 0,
      });

      const coupon = couponData
        ? await this.stripeClient.coupons.create(couponData)
        : null;

      orderDiscount = coupon ? { coupon: coupon.id } : undefined;

      shippingCost = props?.storeFlatRateAmount ?? 0;
    }

    const session = await this.stripeClient.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      billing_address_collection: "required",
      success_url:
        props.successUrl ??
        `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: props.returnUrl ?? `${origin}/cart?cancel=true`,
      discounts: orderDiscount ? [orderDiscount] : undefined,
      shipping_address_collection: {
        allowed_countries: ["US", "CA"],
      },

      automatic_tax: { enabled: true },
      metadata: {
        orderId: props?.orderId ?? "",
        storeId: props?.storeId ?? "",
        cartId: props?.cartId ?? "",
      },
      payment_intent_data: {
        metadata: {
          orderId: props?.orderId ?? "",
          storeId: props?.storeId ?? "",
          cartId: props?.cartId ?? "",
        },
      },

      shipping_options: [
        {
          shipping_rate_data: {
            display_name: "Standard shipping",
            type: "fixed_amount",
            fixed_amount: {
              amount: shippingCost,
              currency: "usd",
            },
          },
        },
      ],
    });

    return { sessionId: session.id, sessionUrl: session?.url ?? "" };
  }

  async getCheckoutSession(props: { sessionId: string }) {
    const session = await this.stripeClient.checkout.sessions.retrieve(
      props.sessionId,
      {
        expand: ["line_items", "customer", "payment_intent.latest_charge"],
      },
    );
    return this.formatCheckoutSessionData({ session });
  }

  async formatCheckoutSessionData(props: { session: unknown }) {
    const session = props.session as Stripe.Checkout.Session;

    const customer = {
      name:
        session?.customer_details?.name ??
        session?.collected_information?.shipping_details?.name ??
        "",
      email: session?.customer_details?.email ?? "",
      phone: session?.customer_details?.phone ?? "",
    };

    const shippingAddress = {
      name: session?.collected_information?.shipping_details?.name ?? "",
      firstName:
        session?.collected_information?.shipping_details?.name?.split(" ")[0] ??
        "",
      lastName:
        session?.collected_information?.shipping_details?.name?.split(" ")[1] ??
        "",
      street:
        session?.collected_information?.shipping_details?.address?.line1 ?? "",
      additional:
        session?.collected_information?.shipping_details?.address?.line2 ??
        null,
      city:
        session?.collected_information?.shipping_details?.address?.city ?? "",
      state:
        session?.collected_information?.shipping_details?.address?.state ?? "",
      postalCode:
        session?.collected_information?.shipping_details?.address
          ?.postal_code ?? "",
      country:
        session?.collected_information?.shipping_details?.address?.country ??
        "",
    };

    const billingAddress = {
      name: session?.customer_details?.name ?? "",
      firstName: session?.customer_details?.name?.split(" ")[0] ?? "",
      lastName: session?.customer_details?.name?.split(" ")[1] ?? "",
      street: session?.customer_details?.address?.line1 ?? "",
      additional: session?.customer_details?.address?.line2 ?? null,
      city: session?.customer_details?.address?.city ?? "",
      state: session?.customer_details?.address?.state ?? "",
      postalCode: session?.customer_details?.address?.postal_code ?? "",
      country: session?.customer_details?.address?.country ?? "",
    };

    const totals = {
      subtotal: session?.amount_subtotal ?? 0,
      tax: session?.total_details?.amount_tax ?? 0,
      shipping: session?.total_details?.amount_shipping ?? 0,
      total: session?.amount_total ?? 0,
    };

    return {
      totals,
      customer,
      shippingAddress,
      billingAddress,
      storeId: session?.metadata?.storeId ?? "",
      orderMetadata: {
        stripeCheckoutSessionId: session?.id ?? "",
      },
      sessionId: session?.id ?? "",
      intentId:
        (session?.payment_intent as Stripe.PaymentIntent)?.id ??
        (session?.payment_intent as string) ??
        "",
    };
  }
  async getLineItems(props: { sessionId: string }) {
    const sessionLineItems =
      await this.stripeClient.checkout.sessions.listLineItems(props.sessionId, {
        expand: ["data.price.product"],
      });

    return sessionLineItems.data;
  }
}
