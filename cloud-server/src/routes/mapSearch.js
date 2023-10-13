import { mapSearch } from "../services/mapSearch.js";

export const mapSearchRoutes = (fastify, opts, done) => {
  fastify.get("/map-search", async (req, resp) => {
    const { q, lat, lng, isPlace } = req.query;
    const results = await mapSearch.search(q, lat, lng, isPlace);
    resp.send(results);
  });
  done();
};
