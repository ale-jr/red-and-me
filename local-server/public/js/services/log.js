export const CURRENT_LOG_LEVEL = 3
export const LOG_LEVEL = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
}
export const log = (logLevel, ...args) => {
    if (CURRENT_LOG_LEVEL >= logLevel)
        console.log(`[${new Date().toLocaleTimeString()}] `, ...args)
}