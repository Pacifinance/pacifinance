import type { Express } from "express"
import serverless from "serverless-http"

type JsonBody = Record<string, unknown> | unknown[] | null

type RequestOptions = {
    method?: string
    body?: JsonBody
    headers?: Record<string, string>
}

export async function request(app: Express, path: string, options: RequestOptions = {}) {
    const body = options.body === undefined ? "" : JSON.stringify(options.body)
    const headers = options.body === undefined
        ? (options.headers ?? {})
        : {...(options.headers ?? {}), "content-type": "application/json"}
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
        queryStringParameters: null,
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
