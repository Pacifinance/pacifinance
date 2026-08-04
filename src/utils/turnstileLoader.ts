const TURNSTILE_SCRIPT_ID = "cloudflare-turnstile-api";
const TURNSTILE_ONLOAD_CALLBACK = "__pacifinanceTurnstileOnload";

interface TurnstileLoaderWindow extends Window {
    [TURNSTILE_ONLOAD_CALLBACK]?: () => void;
}

let pendingLoad: Promise<void> | null = null;

export const isTurnstileReady = () =>
    Boolean(window.turnstile && typeof window.turnstile.render === "function");

export function loadTurnstileApi(timeoutMs = 10000): Promise<void> {
    if (isTurnstileReady()) return Promise.resolve();
    if (pendingLoad) return pendingLoad;

    pendingLoad = new Promise<void>((resolve, reject) => {
        const turnstileWindow = window as TurnstileLoaderWindow;
        let settled = false;

        const finish = (error?: Error) => {
            if (settled) return;
            settled = true;
            window.clearTimeout(timeoutId);
            delete turnstileWindow[TURNSTILE_ONLOAD_CALLBACK];
            if (error) reject(error);
            else resolve();
        };

        turnstileWindow[TURNSTILE_ONLOAD_CALLBACK] = () => {
            if (isTurnstileReady()) finish();
            else finish(new Error("Turnstile loaded without a rendering API"));
        };

        const timeoutId = window.setTimeout(
            () => finish(new Error("Timed out while loading Turnstile")),
            timeoutMs,
        );

        const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID);
        if (existingScript) existingScript.remove();

        const script = document.createElement("script");
        script.id = TURNSTILE_SCRIPT_ID;
        script.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?onload=${TURNSTILE_ONLOAD_CALLBACK}&render=explicit`;
        script.async = true;
        script.defer = true;
        script.onerror = () => finish(new Error("Failed to load Turnstile"));
        document.head.appendChild(script);
    }).catch((error: unknown) => {
        pendingLoad = null;
        throw error;
    });

    return pendingLoad;
}
