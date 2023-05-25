import type { FastifyInstance } from "fastify";

import {
  createOrderController,
  captureOrderController,
} from "./controllers/order-controller";

import {
  startCheckoutController,
  captureCheckoutController,
  completeCheckoutController,
  cancelCheckoutController,
  homeRedirectController,
  createOrderFailureController,
} from "./controllers/app-controller";

import { setErrorHandler } from "./controllers/error-controller";

export default async function router(fastify: FastifyInstance) {
  setErrorHandler(fastify);

  fastify.register(createOrderController, { prefix: "/api/paypal" });
  fastify.register(captureOrderController, { prefix: "/api/paypal" });

  fastify.register(startCheckoutController, { prefix: "/app" });
  fastify.register(captureCheckoutController, { prefix: "/app" });
  fastify.register(completeCheckoutController, { prefix: "/app" });
  fastify.register(cancelCheckoutController, { prefix: "/app" });
  fastify.register(createOrderFailureController, { prefix: "/app" });

  fastify.register(homeRedirectController);
}
