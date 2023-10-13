import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import * as path from "path";
import dirname from "./consts/dirname.cjs";
import cors from "@fastify/cors";

const fastify = Fastify({
  logger: true,
});

fastify.register(cors, {
  allowedHeaders: '*',
  origin: '*'
});

fastify.register(fastifyStatic, {
  root: path.join(dirname(), "..", "public"),
});

import { authenticationRoutes } from "./routes/authentication.js";
import { routePlanningRoutes } from "./routes/routePlanning.js";
import { mapSearchRoutes } from "./routes/mapSearch.js";
fastify.get("/", function handler(request, reply) {
  reply.sendFile("app.html", { cacheControl: false });
});

fastify.register(authenticationRoutes);
fastify.register(routePlanningRoutes);
fastify.register(mapSearchRoutes);

fastify.listen({
  port: 5000,
  host: "0.0.0.0",
});
