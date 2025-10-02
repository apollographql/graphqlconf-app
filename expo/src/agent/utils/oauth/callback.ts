import * as oauth from "oauth4webapi";
import { OauthContext } from "./create";
import { parseCookies } from "./parseCookies";
import { getCookieOptions } from "./cookieOptions";

export async function GET(request: Request, context: OauthContext) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return Response.redirect(
      `${url.origin}/settings?error=${encodeURIComponent(error)}`
    );
  }

  if (!code || !state) {
    return Response.json(
      { error: "Missing code or state parameter" },
      { status: 400 }
    );
  }

  // Retrieve stored values from cookies (temporary OAuth flow data)
  const cookies = parseCookies(request.headers.get("Cookie"));
  const codeVerifier = cookies[`${context.cookiePrefix}_code_verifier`];
  const storedState = cookies[`${context.cookiePrefix}_state`];

  if (!codeVerifier || !storedState) {
    return Response.json(
      { error: "Missing OAuth session data. Please try again." },
      { status: 400 }
    );
  }

  let config;
  try {
    config = await context.readClientConfigFile();
  } catch {}
  if (!config) {
    return Response.json(
      { error: "OAuth client not registered. Please try logging in again." },
      { status: 500 }
    );
  }

  // Verify state
  if (state !== storedState) {
    return Response.json(
      { error: "State mismatch. Possible CSRF attack." },
      { status: 400 }
    );
  }

  try {
    // Prepare client configuration
    const client: oauth.Client = {
      client_id: config.clientId,
      token_endpoint_auth_method: "none", // Public client (PKCE)
    };

    // Create auth server config with issuer and token endpoint
    const authServer: oauth.AuthorizationServer = {
      issuer: config.issuer,
      token_endpoint: config.tokenEndpoint,
    };

    const redirectUri = `${url.origin}/api/mcp-auth/callback`;

    // Validate callback parameters
    const callbackParams = oauth.validateAuthResponse(
      authServer,
      client,
      url,
      state
    );

    // Exchange authorization code for tokens
    const tokenResponse = await oauth.authorizationCodeGrantRequest(
      authServer,
      client,
      oauth.None(),
      callbackParams,
      redirectUri,
      codeVerifier
    );

    const result = await oauth.processAuthorizationCodeResponse(
      authServer,
      client,
      tokenResponse
    );

    const accessToken = result.access_token;
    const refreshToken = result.refresh_token;

    if (!accessToken) {
      return Response.json(
        { error: "No access token in response" },
        { status: 500 }
      );
    }

    // Store tokens in HTTP-only cookies (only 2 cookies needed now!)
    const accessTokenMaxAge = result.expires_in || 86400; // Default to 24 hours
    const refreshTokenMaxAge = 30 * 24 * 60 * 60; // 30 days

    const accessCookieOptions = getCookieOptions(request, accessTokenMaxAge);
    const refreshCookieOptions = getCookieOptions(request, refreshTokenMaxAge);
    const clearCookie = getCookieOptions(request, 0);

    // Build redirect response with multiple Set-Cookie headers
    const headers = new Headers();
    headers.set("Location", `${url.origin}/settings?success=true`);

    // Clear temporary OAuth cookies
    headers.append(
      "Set-Cookie",
      `${context.cookiePrefix}_code_verifier=; ${clearCookie}`
    );
    headers.append(
      "Set-Cookie",
      `${context.cookiePrefix}_state=; ${clearCookie}`
    );

    // Store access token
    const accessCookieHeader = `${context.cookiePrefix}_access_token=${accessToken}; ${accessCookieOptions}`;
    headers.append("Set-Cookie", accessCookieHeader);

    // Store refresh token if available
    if (refreshToken) {
      const refreshCookieHeader = `${context.cookiePrefix}_refresh_token=${refreshToken}; ${refreshCookieOptions}`;
      headers.append("Set-Cookie", refreshCookieHeader);
    } else {
      console.warn("No refresh token in OAuth response!");
    }

    return new Response(null, {
      status: 302,
      headers,
    });
  } catch (error) {
    console.error("Error during token exchange:", error);
    return Response.json(
      { error: "Failed to complete OAuth flow" },
      { status: 500 }
    );
  }
}
