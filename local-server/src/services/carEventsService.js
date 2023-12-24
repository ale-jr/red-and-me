import { SerialPort, ReadlineParser } from "serialport";
import { EventEmitter } from 'node:events'
import GPS from 'gps'
import { sendToAll } from "./websocket.js";
import axios from 'axios'
import { execSync } from "node:child_process";
import { consts } from "../consts/index.js";
export const state = {
    gps: {},
    doors: {
        driver: false,
        passenger: false,
        trunk: false
    },
    lights: {
        lowBeam: false,
        highBeam: false,
        brake: false,
        leftTurnSignal: false,
        rightTurnSignal: false
    },
    transmission: {
        manual: false,
        gear: 0
    },
    keys: {
        leftUp: false,
        leftMiddle: false,
        leftDown: false,
        rightUp: false,
        rightMiddle: false,
        rightDown: false,
        mute: false,
        voiceAssistant: false,
        acceptCall: false,
        endCall: false
    },
    proximity: {
        front: [999, 999, 999],
        rear: [999, 999, 999]
    }
}

export const carEventEmitter = new EventEmitter();


const serialEventEmitter = new EventEmitter();

export const startEvents = () => {
    SerialPort.list()
        .then(ports => {
            console.log("found ports", ports.length)
            ports.forEach(port => {
                if (port.manufacturer?.includes('u-blox')) {
                    setupPort('gps', port.path, 9600)
                }
                else if (port.serialNumber === '40:4C:CA:F9:D3:6C') {
                    setupPort('car', port.path, 115200);
                }
                else if (port.manufacturer === "1a86" && port.productId === "7523") {
                    setupPort('proximity', port.path, 9600);
                }

            })
        })
}


const setupPort = (event, path, baudRate) => {
    console.log("setup port", { event, path, baudRate })
    const port = new SerialPort({ path, baudRate })
    const parser = port.pipe(new ReadlineParser({
        delimiter: '\r\n'
    }))
    parser.on('data', (data) => {
        serialEventEmitter.emit(event, String(data))
    })
}

const setupGPS = () => {


    const gps = new GPS()
    serialEventEmitter.addListener('gps', (data) => {
        gps.update(data)
    })

    let lastUpload = 0;
    gps.on('data', () => {
        carEventEmitter.emit('gps', gps.state)
        state.gps = gps.state

        if ((Date.now() - lastUpload) > 10_000 && gps.state.lat && gps.state.lon) {

            lastUpload = Date.now()
            axios({
                method: 'POST',
                url: 'https://red-and-me.alejr.dev/tracking',
                headers: {
                    token: process.env.CLOUD_SERVER_TOKEN
                },
                data: {
                    lat: gps.state.lat,
                    lng: gps.state.lon,
                    speed: Math.floor(gps.state.speed),
                }
            })
                .catch((e) => {
                    console.error(e.message)
                })
        }
    })
}
setupGPS()



const setupCarEvents = () => {
    serialEventEmitter.addListener('car', (data) => {
        if (!data.includes("|")) {
            return carEventEmitter.emit('can', data)
        }
        const parts = data.split("|")
        switch (parts[0]) {
            case 'L':
                const lights = {
                    highBeam: parts[1] === "1",
                    lowBeam: parts[2] === "1",
                    brake: parts[3] === "1",
                    leftTurnSignal: parts[4] === "1",
                    rightTurnSignal: parts[5] === "1"
                }
                state.lights = lights
                carEventEmitter.emit('lights', lights)
                break;
            case 'D':
                const doors = {
                    drive: parts[1] === "1",
                    passenger: parts[2] === "1",
                    trunk: parts[3] === "1"
                }
                state.doors = doors
                carEventEmitter.emit('doors', doors)
                break;
            case 'T':
                const transmission = {
                    manual: parts[1] == "1",
                    gear: parts[2]
                }
                state.transmission = transmission
                carEventEmitter.emit('transmission', transmission);
                break;
            case 'SWC':
                const keys = {
                    leftUp: parts[1] === "1",
                    leftMiddle: parts[2] === "1",
                    leftDown: parts[3] === "1",
                    rightUp: parts[4] === "1",
                    rightMiddle: parts[5] === "1",
                    rightDown: parts[6] === "1",
                    mute: parts[7] === "1",
                    voiceAssistant: parts[8] === "1",
                    acceptCall: parts[9] === "1",
                    endCal: parts[10] === "1"
                }
                state.keys
                carEventEmitter.emit('keys', keys)
                break;
            case "S":
                if (parts[1] === "shutdown_request") {
                    execSync(consts.SHUTDOWN_COMMAND);
                }
        }
        carEventEmitter.emit('stateChange')
    })
}
setupCarEvents();

const setupProximitySensor = () => {
    serialEventEmitter.addListener('proximity', (data) => {
        const [frontLeft, frontMiddle, frontRight, rearLeft, rearMiddle, rearRight] = data.split(',')
        const proximity = {
            front: [+frontLeft, +frontMiddle, +frontRight],
            rear: [+rearLeft, +rearMiddle, +rearRight]
        }
        state.proximity = proximity
        carEventEmitter.emit('proximity', proximity)
        carEventEmitter.emit('stateChange')
    })
}

setupProximitySensor()


const onStateChange = () => {
    sendToAll({ type: 'stateChange', state })
}
carEventEmitter.addListener('stateChange', onStateChange)

