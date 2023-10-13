import { routePlanning } from "../services/routePlanning.js";
import { verifyAuth } from "./authentication.js";

export const routePlanningRoutes = (fastify, opts, done) => {
  fastify.get("/route-plannings", async (req, res) => {
    await verifyAuth(req, res);
    if ("incomplete" in req.query)
      res.send(routePlanning.getIncompleteRoutePlannings());
    else res.send(routePlanning.getAllRoutePlannings());
  });

  fastify.post("/route-plannings", async (req, res) => {
    await verifyAuth(req, res);
    routePlanning.createRoutePlanning(req.body);
    res.code(204).send();
  });

  fastify.delete("/route-plannings/:id", async (req, res) => {
    await verifyAuth(req, res);
    routePlanning.deleteRoutePlanning(req.params.id);
    res.code(204).send();
  });

  fastify.post("/route-plannings/complete/:id", async (req, res) => {
    await verifyAuth(req, res);
    routePlanning.completeRoutePlanning(req.params.id);
    res.code(204).send();
  });

  done();
};
