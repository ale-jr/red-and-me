import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyWebsocket from "@fastify/websocket";
import * as path from "path";
import { onConnect, onDisconnect, onMessage } from "./services/websocket.js";
import { v4 as randomId } from "uuid";
import { consts } from "./consts/index.js";
import dirname from "./consts/dirname.cjs";
import { state, startEvents } from './services/carEventsService.js'
const fastify = Fastify({
  logger: true,
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

fastify.get("/", function handler(request, reply) {
  reply.sendFile("app.html", { cacheControl: false });
});

fastify.get("/dash", function handler(request, reply) {
  reply.sendFile("dash.html", { cacheControl: false });
});

fastify.get('/state', function handler(request, reply) {
  reply.send(state);
})

const start = async () => {
  try {
    await fastify.listen({ port: consts.SERVER_PORT, host: "0.0.0.0" });
    startEvents();
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
