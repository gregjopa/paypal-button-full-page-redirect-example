import fastify, { FastifyServerOptions } from "fastify";
import fastifyFormbody from "@fastify/formbody";
import fastifyCookie from "@fastify/cookie";
import fastifyCsrfProtection from "@fastify/csrf-protection";
import fastifyView from "@fastify/view";

import router from "./router";

export default function buildApp(options: FastifyServerOptions = {}) {
  const server = fastify(options);

  server.register(fastifyFormbody);
  server.register(fastifyCookie);
  server.register(fastifyCsrfProtection);
  server.register(router);

  server.register(fastifyView, {
    engine: {
      ejs: require("ejs"),
    },
  });

  return server;
}
