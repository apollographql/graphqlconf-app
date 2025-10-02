import * as oauth from "oauth4webapi";
import { getCookieOptions } from "./cookieOptions";
import { OauthContext } from "./create";

export default async function middleware(
  request: Request,
  context: OauthContext
): Promise<Response | void> {
  const accessToken = context.accessToken(request);
  const refreshToken = context.refreshToken(request);

  // If we have an access token, continue to route handler
  if (accessToken) {
    return;
  }

  // No access token but have refresh token - attempt refresh
  if (!refreshToken) {
    return; // No tokens available, continue to route handler
  }

  try {
    // Access token missing, attempting refresh...
    // Read client config from disk
    const config = await context.readClientConfigFile();
    if (!config) {
      return;
    }

    const client: oauth.Client = {
      client_id: config.clientId,
      token_endpoint_auth_method: "none",
    };

    const authServer: oauth.AuthorizationServer = {
      issuer: config.issuer,
      token_endpoint: config.tokenEndpoint,
    };

    const tokenResponse = await oauth.refreshTokenGrantRequest(
      authServer,
      client,
      oauth.None(),
      refreshToken
    );

    const result = await oauth.processRefreshTokenResponse(
      authServer,
      client,
      tokenResponse
    );

    const newAccessToken = result.access_token;
    const newRefreshToken = result.refresh_token;

    if (!newAccessToken) {
      console.error("Token refresh succeeded but no access token in response");
      return;
    }

    const accessCookieOptions = getCookieOptions(
      request,
      result.expires_in || context.accessTokenMaxAge
    );
    const refreshCookieOptions = getCookieOptions(
      request,
      context.refreshTokenMaxAge
    );

    // Redirect to the same URL with refreshed cookies
    // This will cause a second request, but with the new access token in cookies
    const url = new URL(request.url);
    const headers = new Headers();
    headers.set("Location", url.toString());
    headers.append(
      "Set-Cookie",
      `mcp_access_token=${newAccessToken}; ${accessCookieOptions}`
    );
    if (newRefreshToken) {
      headers.append(
        "Set-Cookie",
        `mcp_refresh_token=${newRefreshToken}; ${refreshCookieOptions}`
      );
    }

    return new Response(null, {
      status: 302,
      headers,
    });
  } catch (error) {
    console.error("Token refresh failed:", error);
    return; // Continue to route handler
  }
}
