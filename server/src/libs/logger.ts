/**
 * Minimal structured logger: one JSON line per call (level, message,
 * timestamp), so log output stays greppable/parseable without pulling in an
 * external logging library for what is currently plain operational logging
 * (cache jobs, registration flow).
 */

type LogLevel = "info" | "warn" | "error"

function emit(level: LogLevel, message: string) {
    const line = JSON.stringify({level, message, timestamp: new Date().toISOString()})
    if (level === "error") console.error(line)
    else if (level === "warn") console.warn(line)
    else console.log(line)
}

export const logger = {
    info: (message: string) => emit("info", message),
    warn: (message: string) => emit("warn", message),
    error: (message: string) => emit("error", message),
}
