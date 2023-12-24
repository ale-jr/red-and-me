import { tracking } from "../services/tracking.js";
import { verifyAuth } from "./authentication.js";


export const trackingRoutes = (fastify, opts, done) => {
    fastify.get('/tracking/last', async (req, resp) => {
        await verifyAuth(req, resp);
        const { lat, lng } = req.query || {}
        const response = await tracking.getLastTrackingPoint(lat, lng);
        resp.send(response)
    })

    fastify.post('/tracking', async (req, resp) => {
        await verifyAuth(req, resp);
        const point = req.body;
        tracking.createTrackingPoint(point)
        resp.code(201).send();
    })

    done();
}