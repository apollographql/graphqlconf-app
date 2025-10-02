import * as oauth from "oauth4webapi";
import { getCookieOptions } from "@/agent/utils/oauth/cookieOptions";
import { OauthContext } from "./create";

export async function POST(request: Request, context: OauthContext) {
  const refreshToken = context.refreshToken(request);

  if (!refreshToken) {
    return Response.json(
      { error: "No refresh token available. Please log in again." },
      { status: 401 }
    );
  }

  const config = await context.readClientConfigFile();
  if (!config) {
    return Response.json(
      { error: "OAuth client not registered. Please log in again." },
      { status: 500 }
    );
  }

  try {
    const client: oauth.Client = {
      client_id: config.clientId,
      token_endpoint_auth_method: "none",
    };

    const authServer: oauth.AuthorizationServer = {
      issuer: config.issuer,
      token_endpoint: config.tokenEndpoint,
    };

    // Request new access token using refresh token
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
    const newRefreshToken = result.refresh_token; // May be rotated

    if (!newAccessToken) {
      return Response.json(
        { error: "Failed to refresh access token" },
        { status: 500 }
      );
    }

    // Update cookies with new tokens
    const accessTokenMaxAge = result.expires_in || 86400;
    const refreshTokenMaxAge = 30 * 24 * 60 * 60; // 30 days

    const accessCookieOptions = getCookieOptions(request, accessTokenMaxAge);
    const refreshCookieOptions = getCookieOptions(request, refreshTokenMaxAge);

    const response = Response.json({ success: true });

    response.headers.append(
      "Set-Cookie",
      `${context.cookiePrefix}_access_token=${newAccessToken}; ${accessCookieOptions}`
    );

    // Update refresh token if rotated
    if (newRefreshToken) {
      response.headers.append(
        "Set-Cookie",
        `${context.cookiePrefix}_refresh_token=${newRefreshToken}; ${refreshCookieOptions}`
      );
    }

    return response;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return Response.json(
      { error: "Failed to refresh token. Please log in again." },
      { status: 401 }
    );
  }
}
