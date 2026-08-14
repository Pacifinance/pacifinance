/**
 * Whether this instance is self-hosted vs. the official pacifinance.com
 * deployment. Fails safe: self-hosted unless DEPLOYMENT_MODE=hosted is set
 * explicitly, which only the official deployment's own Vercel/Doppler
 * config does - it is never shipped as a repo default, so any fork or
 * self-hosted instance defaults to the more conservative, honest state.
 */
export function isSelfHosted(): boolean {
    return process.env.DEPLOYMENT_MODE !== "hosted"
}
