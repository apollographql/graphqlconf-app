import * as oauth from "oauth4webapi";
import { getCookieOptions } from "@/agent/utils/oauth/cookieOptions";
import { ClientConfig, OauthContext } from "./create";

async function getOrRegisterClient(
  authServer: oauth.AuthorizationServer,
  redirectUri: string,
  scopes: string,
  context: OauthContext
): Promise<ClientConfig> {
  // Try to read existing client config
  {
    const config = await context.readClientConfigFile();
    if (config?.clientId) {
      return config;
    }
  }

  // Register new client
  console.log("Registering new OAuth client...");
  const registrationResponse = await oauth.dynamicClientRegistrationRequest(
    authServer,
    {
      client_name: "graphqlconf-expo-app",
      redirect_uris: [redirectUri],
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      scope: scopes,
    }
  );

  const client =
    await oauth.processDynamicClientRegistrationResponse(registrationResponse);

  // Persist client config with OAuth server metadata
  const config: ClientConfig = {
    clientId: client.client_id,
    tokenEndpoint: authServer.token_endpoint!,
    issuer: authServer.issuer,
  };
  await context.writeClientConfigFile(config);
  console.log("Persisted new client config:", config.clientId);

  return config;
}

export async function GET(request: Request, context: OauthContext) {
  const resourceUrl = context.protectedResourceUrl;
  const scopes = "openid profile offline_access";

  try {
    // Discover protected resource metadata
    // Manually fetch since oauth4webapi's processResourceDiscoveryResponse has strict URL validation
    const resourceUrlObj = new URL(resourceUrl);
    const metadataUrl = new URL(
      "/.well-known/oauth-protected-resource",
      resourceUrlObj.origin
    );

    const resourceResponse = await fetch(metadataUrl);
    if (!resourceResponse.ok) {
      throw new Error(
        `Failed to fetch resource metadata: ${resourceResponse.status}`
      );
    }

    const resource = await resourceResponse.json();

    if (!resource.authorization_servers?.[0]) {
      return Response.json(
        { error: "No authorization servers found in resource metadata" },
        { status: 500 }
      );
    }

    // Discover authorization server configuration
    // Use OAuth 2.0 Authorization Server metadata (not OpenID Connect)
    const issuerUrl = new URL(resource.authorization_servers[0]);
    const discoveryResponse = await oauth.discoveryRequest(issuerUrl, {
      algorithm: "oauth2",
    });
    const authServer = await oauth.processDiscoveryResponse(
      issuerUrl,
      discoveryResponse
    );

    if (!authServer.authorization_endpoint) {
      return Response.json(
        { error: "Authorization endpoint not found in discovery response" },
        { status: 500 }
      );
    }

    if (!authServer.registration_endpoint) {
      return Response.json(
        { error: "Dynamic client registration not supported by this server" },
        { status: 500 }
      );
    }

    // Build redirect URI from request origin
    const requestUrl = new URL(request.url);
    const redirectUri = `${requestUrl.origin}/api/mcp-auth/callback`;

    // Get or register OAuth client (persisted to disk with metadata)
    const config = await getOrRegisterClient(
      authServer,
      redirectUri,
      scopes,
      context
    );

    // Generate PKCE parameters
    const codeVerifier = oauth.generateRandomCodeVerifier();
    const codeChallenge = await oauth.calculatePKCECodeChallenge(codeVerifier);
    const state = oauth.generateRandomState();

    // Build authorization URL
    const authUrl = new URL(authServer.authorization_endpoint);
    authUrl.searchParams.set("client_id", config.clientId);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("scope", scopes);
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("code_challenge", codeChallenge);
    authUrl.searchParams.set("code_challenge_method", "S256");

    // Add resource parameter (the actual resource we want to access)
    authUrl.searchParams.set("resource", resourceUrl);

    // Store only temporary OAuth flow data in HTTP-only cookies (expires in 10 minutes)
    // Client config is persisted to disk and will be read during callback/refresh
    const response = Response.json({ authUrl: authUrl.toString() });
    const cookieOptions = getCookieOptions(request, 600); // 10 minutes

    response.headers.set(
      "Set-Cookie",
      `${context.cookiePrefix}_code_verifier=${codeVerifier}; ${cookieOptions}`
    );
    response.headers.append(
      "Set-Cookie",
      `${context.cookiePrefix}_state=${state}; ${cookieOptions}`
    );

    return response;
  } catch (error) {
    console.error("OAuth discovery failed:", error);
    return Response.json(
      { error: "Failed to discover OAuth configuration" },
      { status: 500 }
    );
  }
}
