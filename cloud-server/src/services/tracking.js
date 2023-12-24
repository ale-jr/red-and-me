/**
 * @typedef {Object} TrackingPoint
 * @property {number} lat
 * @property {number} lng
 * @property {number} speed
 * @property {string} time
 */


import { db } from './database.js'
import { mapSearch } from './mapSearch.js';
import { sendToAll } from './websocket.js';


const createTrackingService = () => {


    let lastLoggedService = 0;
    /** 
     * @param {TrackingPoint} point
     */
    const createTrackingPoint = async (point) => {

        sendToAll({ type: 'positionChange', point });

        if ((Date.now() - lastLoggedService) > 30_000) {
            lastLoggedService = Date.now();

            const pointWithTime = { ...point, time: Date.now() }
            if (db.data.tracking)
                db.data.tracking.push(pointWithTime)
            else
                db.data.tracking = [pointWithTime]
            await db.write();
        }

    }
    /**
     * @returns {Promise<TrackingPoint>} point 
     */
    const getLastTrackingPoint = async (lat, lng) => {
        const tracking = db.data.tracking || []
        const point = tracking[tracking.length - 1]
        if (!lat || !lng || !point) return { point }

        const eta = await mapSearch.getETA({
            lat: point.lat,
            lng: point.lng
        }, {
            lat,
            lng
        })

        return { point, eta }

    }






    return {
        createTrackingPoint,
        getLastTrackingPoint
    }


}

export const tracking = createTrackingService()
