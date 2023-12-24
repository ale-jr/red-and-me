import { carEventEmitter } from "./services/carEventsService.js";


carEventEmitter.addListener('gps', (data) => {
    console.log('gps', data)
})