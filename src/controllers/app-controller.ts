import { FastifyInstance } from "fastify";

import getOrder from "../order/get-order";
import products from "../data/products.json";

export async function startCheckoutController(fastify: FastifyInstance) {
  fastify.route({
    method: "GET",
    url: "/start-checkout",
    handler: async (req, reply) => {
      const token = await reply.generateCsrf();
      return reply.view("/src/templates/start-checkout.ejs", {
        token,
        products,
      });
    },
  });
}

export async function captureCheckoutController(fastify: FastifyInstance) {
  fastify.route({
    method: "GET",
    url: "/capture-checkout",
    schema: {
      querystring: {
        type: "object",
        required: ["token"],
        properties: {
          token: { type: "string" },
        },
      },
    },
    handler: async (req, reply) => {
      const token = await reply.generateCsrf();
      const querystring = req.query as { token: string };
      const orderDetails = await getOrder({ orderID: querystring.token });

      return reply.view("/src/templates/capture-checkout.ejs", {
        token,
        orderDetails,
      });
    },
  });
}

export async function completeCheckoutController(fastify: FastifyInstance) {
  fastify.route({
    method: "GET",
    url: "/complete-checkout",
    schema: {
      querystring: {
        type: "object",
        required: ["token"],
        properties: {
          token: { type: "string" },
        },
      },
    },
    handler: async (req, reply) => {
      const querystring = req.query as { token: string };
      const orderDetails = await getOrder({ orderID: querystring.token });

      return reply.view("/src/templates/complete-checkout.ejs", {
        orderDetails,
      });
    },
  });
}
