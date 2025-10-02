import { getCookieOptions } from "@/agent/utils/oauth/cookieOptions";
import { OauthContext } from "./create";

export async function GET(request: Request, context: OauthContext) {
  const hasToken = context.accessToken(request) !== null;
  return Response.json({ authenticated: hasToken });
}

export async function DELETE(request: Request, context: OauthContext) {
  const clearCookie = getCookieOptions(request, 0);
  const response = Response.json({ success: true });

  response.headers.append(
    "Set-Cookie",
    `${context.cookiePrefix}_access_token=; ${clearCookie}`
  );
  response.headers.append(
    "Set-Cookie",
    `${context.cookiePrefix}_refresh_token=; ${clearCookie}`
  );

  return response;
}
