import type { Express } from "express"
import serverless from "serverless-http"

type JsonBody = Record<string, unknown> | unknown[] | null

type RequestOptions = {
    method?: string
    body?: JsonBody
    headers?: Record<string, string>
    query?: Record<string, string>
}

// Matches the default Origin below - a same-origin request, which is what
// every existing test implicitly assumes now that server/src/index.ts
// enforces an Origin/Referer-vs-Host CSRF check on state-changing requests.
// Tests exercising that check directly override `headers.host`/`headers.origin`.
export const testHost = "pacifinance.test"

export async function request(app: Express, path: string, options: RequestOptions = {}) {
    const body = options.body === undefined ? "" : JSON.stringify(options.body)
    const headers = {
        host: testHost,
        origin: `https://${testHost}`,
        ...(options.body === undefined ? {} : {"content-type": "application/json"}),
        ...(options.headers ?? {}),
    }
    const handler = serverless(app)
    const response = await handler({
        httpMethod: options.method ?? "GET",
        path,
        headers,
        body,
        isBase64Encoded: false,
        requestContext: {
            identity: {sourceIp: "127.0.0.1"},
            requestId: "test-request"
        },
        // A literal "?" inside `path` is NOT a query string as far as serverless-http's
        // requestUrl() is concerned (it feeds `path` straight into url.format's pathname,
        // which percent-encodes "?") - pass query params here instead.
        queryStringParameters: options.query ?? null,
        multiValueQueryStringParameters: null,
        multiValueHeaders: {}
    }, {})

    const responseBody = response.body ?? ""
    const responseHeaders = new Headers(response.headers as Record<string, string>)
    const contentType = responseHeaders.get("content-type") ?? ""
    const json = responseBody && contentType.includes("application/json") ? JSON.parse(responseBody) : undefined
    const multiValueHeaders = response.multiValueHeaders as Record<string, string[]> | undefined
    const setCookie = multiValueHeaders?.["set-cookie"] ?? multiValueHeaders?.["Set-Cookie"] ?? []

    return {
        status: response.statusCode,
        text: responseBody,
        json,
        headers: responseHeaders,
        cookies: setCookie
    }
}

export const authCookie = "sb-access-token=access-token; sb-refresh-token=refresh-token"
