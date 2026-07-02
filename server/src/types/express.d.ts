import "express"

declare module "express-serve-static-core" {
    interface Request {
        /** uuid of the authenticated user (Supabase Auth), set by the auth middleware in routes.ts */
        userId?: string
    }
}
