import type { Stripe } from "stripe";

import type { PaymentProcessor } from "../payment-processor";
import type { CheckoutData } from "../types";

import { stripeClient } from "../clients/stripe";
import { cartToCoupon, orderToCoupon } from "../lib/stripe/coupons";
import { cartToLineItems, orderToLineItems } from "../lib/stripe/line-items";

const origin =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : process.env.NEXT_PUBLIC_HOSTNAME;

export class StripePaymentProcessor implements PaymentProcessor {
  async createCheckoutSession(props: CheckoutData) {
    if (!stripeClient) {
      throw new Error("Stripe client not initialized");
    }

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
        ? await stripeClient.coupons.create(couponData)
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
        ? await stripeClient.coupons.create(couponData)
        : null;

      orderDiscount = coupon ? { coupon: coupon.id } : undefined;

      shippingCost = props?.storeFlatRateAmount ?? 0;
    }

    const session = await stripeClient.checkout.sessions.create({
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
    if (!stripeClient) {
      throw new Error("Stripe client not initialized");
    }

    const session = await stripeClient.checkout.sessions.retrieve(
      props.sessionId,
      {
        expand: ["line_items", "customer", "payment_intent.latest_charge"],
      },
    );
    return this.formatCheckoutSessionData({ session });
  }

  async getPaymentIntent(props: { paymentIntentId: string }) {
    if (!stripeClient) {
      throw new Error("Stripe client not initialized");
    }

    const paymentIntent = await stripeClient.paymentIntents.retrieve(
      props.paymentIntentId,
      { expand: ["latest_charge", "latest_charge.balance_transaction"] },
    );

    const processorFee =
      (
        (paymentIntent.latest_charge as Stripe.Charge)
          ?.balance_transaction as Stripe.BalanceTransaction
      )?.fee ?? 0;
    const paymentReceipt =
      (paymentIntent.latest_charge as Stripe.Charge)?.receipt_url ?? "";

    return {
      paymentIntent,
      paymentReceipt,
      processorFee,
      amountPaid: paymentIntent.amount ?? 0,
      intentId: paymentIntent.id ?? "",
    };
  }

  async formatCheckoutSessionData(props: { session: Stripe.Checkout.Session }) {
    if (!stripeClient) {
      throw new Error("Stripe client not initialized");
    }

    const session = props.session;

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
    };
  }

  async createCustomer(props: {
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
  }) {
    if (!stripeClient) {
      throw new Error("Stripe client not initialized");
    }

    const stripeCustomer = await stripeClient.customers.create({
      email: props.email,
      name: props.name,
      ...(props?.address && {
        address: {
          line1: props.address.street ?? "",
          line2: props.address.additional ?? "",
          city: props.address.city ?? "",
          state: props.address.state ?? "",
          postal_code: props.address.postalCode ?? "",
          country: props.address.country ?? "",
        },
      }),
    });

    return { stripeCustomerId: stripeCustomer.id };
  }

  async getLineItems(props: { sessionId: string }) {
    if (!stripeClient) {
      throw new Error("Stripe client not initialized");
    }

    const sessionLineItems = await stripeClient.checkout.sessions.listLineItems(
      props.sessionId,
      { expand: ["data.price.product"] },
    );

    return sessionLineItems.data;
  }
}
