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
      const { token: orderID } = req.query as { token: string };
      const orderDetails = await getOrder({ orderID });

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
      const { token: orderID } = req.query as { token: string };
      const orderDetails = await getOrder({ orderID });

      return reply.view("/src/templates/complete-checkout.ejs", {
        orderDetails,
      });
    },
  });
}

export async function cancelCheckoutController(fastify: FastifyInstance) {
  fastify.route({
    method: "GET",
    url: "/cancel-checkout",
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
      const { token: orderID } = req.query as { token: string };
      const orderDetails = await getOrder({ orderID });

      return reply.view("/src/templates/cancel-checkout.ejs", {
        orderDetails,
      });
    },
  });
}

export async function createOrderFailureController(fastify: FastifyInstance) {
  fastify.route({
    method: "GET",
    url: "/create-order-failed",
    schema: {
      querystring: {
        type: "object",
        required: ["error-details"],
        properties: {
          "error-details": { type: "string" },
        },
      },
    },
    handler: async (req, reply) => {
      const { "error-details": errorDetails } = req.query as {
        "error-details": string;
      };

      return reply.view("/src/templates/create-order-failed.ejs", {
        errorDetails: JSON.parse(errorDetails),
      });
    },
  });
}

export async function homeRedirectController(fastify: FastifyInstance) {
  fastify.route({
    method: "GET",
    url: "/",
    handler: async (req, reply) => {
      return reply.redirect("/app/start-checkout");
    },
  });
}
