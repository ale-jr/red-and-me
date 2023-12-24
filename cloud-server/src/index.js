import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyWebsocket from "@fastify/websocket";
import { onConnect, onDisconnect, onMessage } from "./services/websocket.js";
import { v4 as randomId } from "uuid";
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

fastify.register(fastifyWebsocket, {
  options: { maxPayload: 1048576 },
});

fastify.register(async function wsRegister(fastify) {
  fastify.get("/live", { websocket: true }, (connection, request) => {
    const connectionId = randomId();
    connection.socket.on("message", (message) => {
      onMessage(message, connection.socket, connectionId);
    });
    connection.socket.on("close", () => {
      onDisconnect(connection.socket, connectionId);
    });
    console.log("connected");
    onConnect(connection.socket, connectionId);
  });
});

import { authenticationRoutes } from "./routes/authentication.js";
import { routePlanningRoutes } from "./routes/routePlanning.js";
import { mapSearchRoutes } from "./routes/mapSearch.js";
import { trackingRoutes } from "./routes/tracking.js";
fastify.get("/", function handler(request, reply) {
  reply.sendFile("app.html", { cacheControl: false });
});

fastify.register(authenticationRoutes);
fastify.register(routePlanningRoutes);
fastify.register(mapSearchRoutes);
fastify.register(trackingRoutes);

fastify.listen({
  port: 5000,
  host: "0.0.0.0",
});
