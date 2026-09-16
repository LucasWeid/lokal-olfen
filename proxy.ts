import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    return new NextResponse("Admin-Zugang ist nicht konfiguriert.", {
      status: 500,
    });
  }

  const authorization = request.headers.get("authorization");

  if (authorization) {
    const [scheme, encoded] = authorization.split(" ");

    if (scheme === "Basic" && encoded) {
      try {
        const decoded = Buffer.from(encoded, "base64").toString("utf8");

        const separatorIndex = decoded.indexOf(":");

        if (separatorIndex !== -1) {
          const enteredUsername = decoded.slice(0, separatorIndex);
          const enteredPassword = decoded.slice(separatorIndex + 1);

          if (
            enteredUsername === username &&
            enteredPassword === password
          ) {
            return NextResponse.next();
          }
        }
      } catch {
        // ungültiger Authorization-Header
      }
    }
  }

  return new NextResponse("Anmeldung erforderlich.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Lokal Olfen Admin"',
      "Cache-Control": "no-store",
    },
  });
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};