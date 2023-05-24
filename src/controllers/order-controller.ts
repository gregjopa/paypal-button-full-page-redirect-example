import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

import createOrder from "../order/create-order";
import captureOrder from "../order/capture-order";
import products from "../data/products.json";

import type {
  CreateOrderRequestBody,
  OrderResponseBody,
  PurchaseItem,
} from "@paypal/paypal-js";

const currency = "USD";
const intent = "CAPTURE";

type CartItem = {
  id: (typeof products)[number]["id"];
  quantity: number;
};

function roundTwoDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function getItemsAndTotal(cart: CartItem[]): {
  itemsArray: PurchaseItem[];
  itemTotal: number;
} {
  // API reference: https://developer.paypal.com/docs/api/orders/v2/#orders_create!path=purchase_units/items&t=request
  const itemsArray = cart.map(({ id, quantity = "1" }) => {
    // If limited inventory applies to your use case, this is normally tracked in a database alongside other product information
    // Static information from data/products.json is used here for demo purposes
    const product = products.find((product) => product.id === id);
    if (!product) {
      throw new Error(`Invalid product ID ${id}`);
    }

    const { name, description, price, category, stock = "1" } = product;
    if (stock < quantity)
      throw new Error(`${name} ${id} (qty: ${quantity}) is out of stock.`);
    return {
      name,
      id,
      description,
      category,
      quantity,
      unit_amount: {
        currency_code: currency,
        value: price,
      },
    } as PurchaseItem;
  });

  const itemTotal = itemsArray.reduce(
    (partialSum, item) =>
      partialSum + parseFloat(item.unit_amount.value) * parseInt(item.quantity),
    0
  );

  return { itemsArray, itemTotal: roundTwoDecimals(itemTotal) };
}

async function createOrderHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id, quantity } = request.body as CartItem;
  const { itemsArray, itemTotal } = getItemsAndTotal([{ id, quantity }]);

  // Example shipping and tax calculation
  const shippingTotal = 0;
  const taxTotal = roundTwoDecimals(itemTotal * 0.05);
  const grandTotal = roundTwoDecimals(itemTotal + shippingTotal + taxTotal);

  type CreateOrderRequestBodyWithPaymentSource = CreateOrderRequestBody & {
    payment_source: {
      paypal: {
        experience_context: {
          user_action: "CONTINUE" | "PAY_NOW";
          return_url: string;
          cancel_url: string;
        };
      };
    };
  };

  const orderPayload: CreateOrderRequestBodyWithPaymentSource = {
    // API reference: https://developer.paypal.com/docs/api/orders/v2/#orders_create
    intent: intent,
    purchase_units: [
      {
        amount: {
          currency_code: currency,
          value: String(grandTotal),
          breakdown: {
            item_total: {
              // Required when `items` array is also present
              currency_code: currency,
              value: String(itemTotal),
            },
            shipping: {
              currency_code: currency,
              value: String(shippingTotal),
            },
            tax_total: {
              currency_code: currency,
              value: String(taxTotal),
            },
          },
        },
        items: itemsArray,
      },
    ],
    payment_source: {
      paypal: {
        experience_context: {
          user_action: "CONTINUE",
          return_url: `${request.protocol}://${request.hostname}/app/capture-checkout`,
          cancel_url: `${request.protocol}://${request.hostname}/app/cancel-checkout`,
        },
      },
    },
  };

  const orderResponse = await createOrder({
    body: orderPayload,
    headers: { Prefer: "return=minimal", "PayPal-Request-Id": request.id },
  });

  if (orderResponse.status === "ok") {
    const { id, status } = orderResponse.data as OrderResponseBody;
    request.log.info({ id, status }, "order successfully created");
    request.log.info(orderResponse.data);

    const redirectLink = orderResponse.data.links.find(({ rel, method }) => {
      return rel === "payer-action" && method === "GET";
    });
    reply.redirect(redirectLink!.href);
  }

  request.log.error(orderResponse.data, "failed to create order");
  // TODO: redirect to error page
}

export async function createOrderController(fastify: FastifyInstance) {
  fastify.route({
    method: "POST",
    url: "/create-order",
    preHandler: fastify.csrfProtection,
    handler: createOrderHandler,
    schema: {
      body: {
        type: "object",
        required: ["id", "quantity"],
        properties: {
          id: { type: "string" },
          quantity: { type: "number" },
        },
      },
    },
  });
}

async function captureOrderHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { orderID } = request.body as { orderID: string };

  const responseData = await captureOrder(orderID);
  const data = responseData?.data as OrderResponseBody;

  const transaction =
    data?.purchase_units?.[0]?.payments?.captures?.[0] ||
    data?.purchase_units?.[0]?.payments?.authorizations?.[0];

  if (!transaction?.id || transaction.status === "DECLINED") {
    console.warn(`PayPal API order ${orderID}: capture failed`, data);
  } else {
    console.info(
      `PayPal API order ${orderID}: successful capture`,
      transaction
    );
  }

  reply.redirect(`/app/complete-checkout?token=${orderID}`);
}

export async function captureOrderController(fastify: FastifyInstance) {
  fastify.route({
    method: "POST",
    url: "/capture-order",
    preHandler: fastify.csrfProtection,
    handler: captureOrderHandler,
    schema: {
      body: {
        type: "object",
        required: ["orderID"],
        properties: {
          orderID: {
            type: "string",
          },
        },
      },
    },
  });
}
