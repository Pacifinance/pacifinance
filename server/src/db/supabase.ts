import { createClient } from "@supabase/supabase-js"

/**
 * Server-side Supabase client, authenticated with the service_role key.
 * Bypasses Row Level Security (the backend enforces authorization itself,
 * mirroring the previous session-based checks) and can call the Auth Admin API.
 * Never expose this key/client to the browser.
 */
const supabase = createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    { auth: { autoRefreshToken: false, persistSession: false } }
)

export default supabase
