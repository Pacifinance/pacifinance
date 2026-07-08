export class TimeoutError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "TimeoutError"
    }
}

export function getTimeoutMs(envName: string, fallbackMs: number) {
    const configured = Number(process.env[envName])
    return Number.isFinite(configured) && configured > 0 ? configured : fallbackMs
}

export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
    let timeout: ReturnType<typeof setTimeout> | undefined
    try {
        return await Promise.race([
            promise,
            new Promise<T>((_, reject) => {
                timeout = setTimeout(() => {
                    reject(new TimeoutError(`${label} timed out after ${timeoutMs}ms`))
                }, timeoutMs)
            })
        ])
    } finally {
        if (timeout) clearTimeout(timeout)
    }
}
