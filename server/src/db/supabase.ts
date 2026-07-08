import { createClient } from "@supabase/supabase-js"

import { getTimeoutMs } from "../libs/timeout"

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}) {
    const timeoutMs = getTimeoutMs("SUPABASE_FETCH_TIMEOUT_MS", 10000)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    const upstreamSignal = init.signal

    if (upstreamSignal?.aborted)
        controller.abort()
    else
        upstreamSignal?.addEventListener("abort", () => controller.abort(), {once: true})

    try {
        return await fetch(input, {...init, signal: controller.signal})
    } finally {
        clearTimeout(timeout)
    }
}

/**
 * Server-side Supabase client, authenticated with the service_role key.
 * Bypasses Row Level Security (the backend enforces authorization itself,
 * mirroring the previous session-based checks) and can call the Auth Admin API.
 * Never expose this key/client to the browser.
 */
const supabase = createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    {
        auth: { autoRefreshToken: false, persistSession: false },
        global: { fetch: fetchWithTimeout }
    }
)

export default supabase
