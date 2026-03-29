import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AuthRouteContext = {
  params: Promise<{
    auth: string[];
  }>;
};

const PROXIED_AUTH_PREFIXES = new Set(["signin", "callback"]);

function getConvexSiteUrl() {
  const convexSiteUrl = process.env.CONVEX_SITE_URL?.trim();

  if (convexSiteUrl) {
    return convexSiteUrl.replace(/\/$/, "");
  }

  const publicConvexUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.trim();

  if (publicConvexUrl) {
    const derivedSiteUrl = publicConvexUrl.replace(
      /\.convex\.cloud\/?$/,
      ".convex.site"
    );

    if (derivedSiteUrl !== publicConvexUrl) {
      return derivedSiteUrl;
    }
  }

  throw new Error(
    "Missing `CONVEX_SITE_URL`, and `NEXT_PUBLIC_CONVEX_URL` could not be used to derive it."
  );
}

function isSupportedAuthRoute(authSegments: string[]) {
  return (
    authSegments.length >= 2 &&
    PROXIED_AUTH_PREFIXES.has(authSegments[0] ?? "")
  );
}

async function proxyAuthRequest(
  request: NextRequest,
  authSegments: string[]
) {
  if (!isSupportedAuthRoute(authSegments)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (
    authSegments[0] === "signin" &&
    !request.nextUrl.searchParams.get("code")
  ) {
    const retryUrl = new URL("/login", request.url);
    const redirectTo = request.nextUrl.searchParams.get("redirectTo");
    const provider = authSegments[1];

    retryUrl.searchParams.set("provider", provider);

    if (
      redirectTo &&
      redirectTo.startsWith("/") &&
      !redirectTo.startsWith("//")
    ) {
      retryUrl.searchParams.set("redirectTo", redirectTo);
    }

    return NextResponse.redirect(retryUrl);
  }

  try {
    const targetUrl = new URL(
      `/api/auth/${authSegments.join("/")}`,
      getConvexSiteUrl()
    );
    targetUrl.search = request.nextUrl.search;

    const headers = new Headers();
    const accept = request.headers.get("accept");
    const contentType = request.headers.get("content-type");
    const cookie = request.headers.get("cookie");

    if (accept) {
      headers.set("accept", accept);
    }

    if (contentType) {
      headers.set("content-type", contentType);
    }

    if (cookie) {
      headers.set("cookie", cookie);
    }

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      redirect: "manual",
      cache: "no-store",
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : await request.arrayBuffer(),
    });

    const responseHeaders = new Headers();
    const location = response.headers.get("location");
    const cacheControl = response.headers.get("cache-control");
    const contentLanguage = response.headers.get("content-language");
    const responseContentType = response.headers.get("content-type");
    const responseSetCookie =
      (
        response.headers as Headers & {
          getSetCookie?: () => string[];
        }
      ).getSetCookie?.() ?? [];

    if (location) {
      responseHeaders.set("location", location);
    }

    if (cacheControl) {
      responseHeaders.set("cache-control", cacheControl);
    }

    if (contentLanguage) {
      responseHeaders.set("content-language", contentLanguage);
    }

    if (responseContentType) {
      responseHeaders.set("content-type", responseContentType);
    }

    if (responseSetCookie.length > 0) {
      for (const setCookie of responseSetCookie) {
        responseHeaders.append("set-cookie", setCookie);
      }
    } else {
      const fallbackSetCookie = response.headers.get("set-cookie");
      if (fallbackSetCookie) {
        responseHeaders.append("set-cookie", fallbackSetCookie);
      }
    }

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Auth proxy request failed", error);

    return NextResponse.json(
      {
        error:
          "The auth proxy could not reach the configured Convex auth routes. Check that `CONVEX_SITE_URL` matches the same deployment as `NEXT_PUBLIC_CONVEX_URL`.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, context: AuthRouteContext) {
  const { auth } = await context.params;
  return proxyAuthRequest(request, auth);
}

export async function POST(request: NextRequest, context: AuthRouteContext) {
  const { auth } = await context.params;
  return proxyAuthRequest(request, auth);
}
