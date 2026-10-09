import type { NextRequest } from "next/server";

const BACKEND_URL = (
  process.env.BACKEND_API_URL ?? "http://localhost:8080"
).replace(/\/$/, "");

const SKIP_REQUEST_HEADERS = new Set([
  "origin",
  "referer",
  "host",
  "connection",
  "content-length",
  "accept-encoding",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-forwarded-for",
  "x-vercel-id",
  "x-vercel-forwarded-for",
  "x-vercel-deployment-url",
]);

const SKIP_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
  "keep-alive",
  "access-control-allow-origin",
  "access-control-allow-credentials",
  "access-control-allow-methods",
  "access-control-allow-headers",
]);

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const search = request.nextUrl.search;
  const target = `${BACKEND_URL}/api/v1/${path.join("/")}${search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!SKIP_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const hasBody = !["GET", "HEAD"].includes(request.method);

  try {
    const backendResponse = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: "manual",
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, key) => {
      if (!SKIP_RESPONSE_HEADERS.has(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    if (backendResponse.status === 204 || backendResponse.status === 304) {
      return new Response(null, {
        status: backendResponse.status,
        headers: responseHeaders,
      });
    }

    return new Response(await backendResponse.arrayBuffer(), {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch {
    return Response.json(
      {
        success: false,
        message: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
        data: null,
      },
      { status: 502 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
export const OPTIONS = proxy;

export const dynamic = "force-dynamic";
