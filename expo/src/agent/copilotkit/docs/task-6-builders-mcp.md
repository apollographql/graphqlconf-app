# Task 6: Builders MCP (Remote Events)

**Goal**: Integrate OAuth-protected remote MCP server for additional event data.

**Status**: 🔴 Not Started

**Dependencies**: Task 2 (Supergraph MCP Integration)

**Estimated Effort**: 3-4 hours

---

## 📋 Overview

This task connects to a remote MCP server (`https://events.apollo.dev/mcp`) that provides additional event data. The server requires OAuth authentication. The integration should gracefully degrade if authentication fails or the server is unavailable.

---

## 🎯 Success Criteria

- ✅ Remote MCP server connects when user is authenticated
- ✅ OAuth flow works (login, callback, token refresh)
- ✅ OAuth tokens stored securely in cookies
- ✅ Remote MCP tools available to agent when connected
- ✅ App works without remote MCP (graceful degradation)
- ✅ Authentication errors handled gracefully
- ✅ Token refresh happens automatically

---

## 📁 Files to Create/Modify

### New Files

- `expo/src/agent/copilotkit/mcp/buildersMcp.ts` - Remote MCP configuration

### Modified Files

- [`expo/src/agent/copilotkit/agent.ts`](../agent.ts) - Add conditional MCP server

### Existing Files (Reused)

- `expo/src/agent/utils/oauth/` - Complete OAuth implementation
  - `create.ts` - OAuth client factory
  - `login.ts` - Initiate OAuth flow
  - `callback.ts` - Handle OAuth callback
  - `refresh.ts` - Refresh access tokens
  - `status.ts` - Check authentication status
  - `middleware.ts` - Request authentication middleware

---

## 🏗️ Implementation Steps

### Step 1: Understand Existing OAuth Infrastructure

**OAuth Client** (from [`buildersMcp.ts`](../../mcp/buildersMcp.ts:5-9)):

```typescript
export const oauth = createOauth({
  cookiePrefix: "mcpBuilders",
  clientConfigFile: "oauth-mcpBuilders.json",
  protectedResourceUrl: "https://events.apollo.dev/mcp",
});
```

**OAuth Configuration File** (`oauth-mcpBuilders.json`):

- Location: Project root
- Contains: `client_id`, `client_secret`, `authorization_endpoint`, `token_endpoint`
- This file should already exist if OAuth was set up for Vercel SDK

**OAuth Methods**:

- `oauth.login(request)` - Start OAuth flow, returns redirect URL
- `oauth.callback(request)` - Handle OAuth callback, stores tokens
- `oauth.accessToken(request)` - Get access token from cookies
- `oauth.refresh(request)` - Refresh expired tokens
- `oauth.status(request)` - Check if authenticated

**Reference**: See existing OAuth usage:

- [`expo/src/agent/mcp/buildersMcp.ts`](../../mcp/buildersMcp.ts)
- [`expo/src/agent/utils/oauth/`](../../utils/oauth/)

---

### Step 2: Create Builders MCP Configuration

**File**: `expo/src/agent/copilotkit/mcp/buildersMcp.ts` (new file)

```typescript
import { CopilotRuntime } from "@copilotkit/runtime";
import { createOauth } from "../../utils/oauth/create";

export const oauth = createOauth({
  cookiePrefix: "mcpBuilders",
  clientConfigFile: "oauth-mcpBuilders.json",
  protectedResourceUrl: "https://events.apollo.dev/mcp",
});

/**
 * Add remote MCP server if user is authenticated
 * Gracefully skips if not authenticated or connection fails
 */
export async function addBuildersMCP(
  runtime: CopilotRuntime,
  request: Request
) {
  try {
    // Check for access token
    const accessToken = oauth.accessToken(request);

    if (!accessToken) {
      console.log("⚠️  No access token for Builders MCP - skipping");
      return { connected: false, reason: "not_authenticated" };
    }

    // Add remote MCP server with OAuth token
    await runtime.addMCPServer({
      url: "https://events.apollo.dev/mcp",
      transport: "sse", // or "http"
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log("✅ Builders MCP server connected");
    return { connected: true };
  } catch (error) {
    console.error("❌ Failed to connect to Builders MCP server:", error);
    // Continue without remote MCP - graceful degradation
    return { connected: false, reason: "connection_failed", error };
  }
}
```

**Reference**: Compare with Vercel SDK:

- [`expo/src/agent/mcp/buildersMcp.ts:28-41`](../../mcp/buildersMcp.ts#L28-L41)

---

### Step 3: Update Agent to Use Builders MCP

**File**: [`expo/src/agent/copilotkit/agent.ts`](../agent.ts)

**Add conditional MCP initialization**:

```typescript
import { addSupergraphMCP } from "./mcp/supergraphMcp";
import { addBuildersMCP } from "./mcp/buildersMcp";

const runtime = new CopilotRuntime();

// Initialize function that runs on each request
async function initializeRuntime(request: Request) {
  // Add local MCP (always available)
  await addSupergraphMCP(runtime);

  // Add remote MCP (conditional on authentication)
  await addBuildersMCP(runtime, request);
}

// Create handler
const handler = copilotRuntimeNodeHttpEndpoint({
  endpoint: "/copilotkit",
  runtime,
  serviceAdapter,
  async beforeRequest(req) {
    // Initialize MCP connections before handling request
    await initializeRuntime(req);
  },
  async transformRequest(req) {
    const body = await req.json();
    const { context } = body;

    return {
      ...body,
      messages: [
        { role: "system", content: prompt },
        {
          role: "system",
          content: `
This message contains information about the current state of the UI.
Date and time: ${context.currentTime}
The app configured to focus on the event with ID "${context.currentEvent}". 
Location: ${context.location}
Current route: ${context.route}
Current route arguments: ${JSON.stringify(context.routeParams || {})}
          `.trim(),
        },
        ...body.messages,
      ],
    };
  },
});

export { handler };
```

**Note**: Check if CopilotKit supports `beforeRequest` hook. If not, we may need to initialize MCP servers outside the request handler or find alternative approach.

---

### Step 4: Create OAuth API Routes

**File**: `expo/src/app/api/mcp-auth/login+api.ts` (should already exist)

Verify it uses the copilotkit oauth client:

```typescript
import { oauth } from "@/agent/copilotkit/mcp/buildersMcp";

export async function GET(request: Request) {
  const redirectUrl = await oauth.login(request);
  return Response.redirect(redirectUrl);
}
```

**File**: `expo/src/app/api/mcp-auth/callback+api.ts` (should already exist)

```typescript
import { oauth } from "@/agent/copilotkit/mcp/buildersMcp";

export async function GET(request: Request) {
  await oauth.callback(request);
  return Response.redirect("/"); // Redirect to app after auth
}
```

**File**: `expo/src/app/api/mcp-auth/status+api.ts` (should already exist)

```typescript
import { oauth } from "@/agent/copilotkit/mcp/buildersMcp";

export async function GET(request: Request) {
  const status = await oauth.status(request);
  return Response.json(status);
}
```

**Reference**: See existing OAuth routes:

- [`expo/src/app/api/mcp-auth/`](../../../../app/api/mcp-auth/)

---

### Step 5: Add OAuth UI (Optional)

If you want users to authenticate via UI:

**Create Settings Page Link**:

```typescript
// In expo/src/screens/Settings/SettingsScreen.tsx
import { oauth } from "@/agent/copilotkit/mcp/buildersMcp";

export function SettingsScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetch("/api/mcp-auth/status")
      .then(res => res.json())
      .then(status => setIsAuthenticated(status.authenticated));
  }, []);

  const handleLogin = () => {
    window.location.href = "/api/mcp-auth/login";
  };

  return (
    <View>
      {/* ... other settings ... */}

      <ThemedText>Remote Events Access</ThemedText>
      {isAuthenticated ? (
        <ThemedText>✅ Connected</ThemedText>
      ) : (
        <Button onPress={handleLogin} title="Login to Apollo Events" />
      )}
    </View>
  );
}
```

---

### Step 6: Handle Token Refresh

**Automatic Refresh** (handled by OAuth utilities):

The OAuth client automatically refreshes tokens when needed. Ensure your agent handler checks token validity:

```typescript
// In agent.ts or buildersMcp.ts
async function addBuildersMCP(runtime: CopilotRuntime, request: Request) {
  let accessToken = oauth.accessToken(request);

  // Check if token needs refresh
  if (accessToken && isTokenExpired(accessToken)) {
    try {
      await oauth.refresh(request);
      accessToken = oauth.accessToken(request);
    } catch (error) {
      console.error("Token refresh failed:", error);
      return { connected: false, reason: "token_refresh_failed" };
    }
  }

  if (!accessToken) {
    return { connected: false, reason: "not_authenticated" };
  }

  // Connect to MCP...
}

function isTokenExpired(token: string): boolean {
  // Decode JWT and check expiration
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
```

**Reference**: See OAuth refresh implementation:

- [`expo/src/agent/utils/oauth/refresh.ts`](../../utils/oauth/refresh.ts)

---

## 🧪 Testing Steps

### 1. Verify OAuth Configuration

**Check config file exists**:

```bash
ls oauth-mcpBuilders.json
```

**Verify contents**:

```json
{
  "client_id": "...",
  "client_secret": "...",
  "authorization_endpoint": "https://auth.example.com/authorize",
  "token_endpoint": "https://auth.example.com/token"
}
```

### 2. Test OAuth Flow

**Step 1: Check Status (Unauthenticated)**

```bash
curl http://localhost:8081/api/mcp-auth/status
```

Expected: `{"authenticated": false}`

**Step 2: Initiate Login**

- Visit: `http://localhost:8081/api/mcp-auth/login`
- Should redirect to OAuth provider
- Login with credentials
- Should redirect back to app

**Step 3: Check Status (Authenticated)**

```bash
curl http://localhost:8081/api/mcp-auth/status \
  --cookie "mcpBuilders_access_token=..."
```

Expected: `{"authenticated": true}`

### 3. Test Remote MCP Connection

**Test 1: Without Authentication**

```
User: (in omnibar) "What events are available?"
Expected:
- Agent uses local MCP only
- No remote tools available
- App still functions normally
```

**Test 2: With Authentication**

```
User: (after OAuth login) "What events are available?"
Expected:
- Agent has access to both local and remote MCP tools
- Can query remote event data
- No errors
```

**Test 3: Token Refresh**

```
# Wait for token to expire (or manually expire it)
User: "Show me events"
Expected:
- Token refreshes automatically
- Remote MCP reconnects
- Query succeeds
```

### 4. Test Graceful Degradation

**Test 1: Remote Server Down**

```bash
# Simulate server down by using invalid URL
User: "What events are there?"
Expected:
- Connection fails gracefully
- Error logged to console
- App continues with local MCP only
- No crash
```

**Test 2: Invalid Token**

```bash
# Manually corrupt token in cookies
User: "Show events"
Expected:
- Auth fails gracefully
- Logs "No access token" or "Auth failed"
- Falls back to local MCP
- App still works
```

---

## 🔍 Troubleshooting

### Issue: "oauth-mcpBuilders.json not found"

**Solution**: Create the file in project root:

```bash
cat > oauth-mcpBuilders.json << EOF
{
  "client_id": "your-client-id",
  "client_secret": "your-client-secret",
  "authorization_endpoint": "https://auth.apollo.dev/authorize",
  "token_endpoint": "https://auth.apollo.dev/token"
}
EOF
```

Get credentials from Apollo team or OAuth provider.

### Issue: "OAuth redirect not working"

**Causes**:

1. Callback URL not registered with OAuth provider
2. Incorrect redirect_uri parameter
3. CORS issues

**Solutions**:

```typescript
// Verify callback URL is registered
// It should be: http://localhost:8081/api/mcp-auth/callback
// or: https://your-app.com/api/mcp-auth/callback

// Debug redirect
console.log("OAuth redirect URL:", await oauth.login(request));

// Check OAuth provider settings
```

### Issue: "Token not persisting in cookies"

**Causes**:

1. Cookie not being set properly
2. Secure/SameSite issues
3. Cookie expiration too short

**Solutions**:

```typescript
// Check cookie settings in oauth/middleware.ts
// Ensure cookies are set with appropriate flags

// Debug cookies
document.cookie.split(";").forEach((c) => console.log(c));

// Check cookie expiration
// Should be set to token expiration time
```

### Issue: "Remote MCP not connecting despite valid token"

**Causes**:

1. Wrong transport type (http vs sse)
2. Server not accepting token format
3. Network/firewall blocking request

**Solutions**:

```typescript
// Try different transport
transport: "http"; // instead of "sse"

// Debug token
console.log("Access token:", accessToken.substring(0, 20) + "...");

// Test remote server directly
fetch("https://events.apollo.dev/mcp", {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
```

### Issue: "beforeRequest hook not found"

**Cause**: CopilotKit might not support `beforeRequest` hook

**Solution**: Initialize MCP outside handler:

```typescript
// Option 1: Initialize once at startup
await addSupergraphMCP(runtime);
// But we can't add builders MCP here (no request context)

// Option 2: Add builders MCP conditionally in handler
// Check if runtime.addMCPServer() is synchronous enough

// Option 3: Use separate runtime per request (check CopilotKit docs)
```

---

## 📚 Reference Links

### OAuth

- [OAuth 2.0 Specification](https://oauth.net/2/)
- [OAuth Authorization Code Flow](https://oauth.net/2/grant-types/authorization-code/)

### CopilotKit

- [addMCPServer API](https://docs.copilotkit.ai/reference/runtime/addMCPServer)
- [Runtime Configuration](https://docs.copilotkit.ai/reference/runtime/CopilotRuntime)

### Vercel SDK Comparison

- [`expo/src/agent/mcp/buildersMcp.ts`](../../mcp/buildersMcp.ts) - Original implementation
- [`expo/src/agent/utils/oauth/`](../../utils/oauth/) - OAuth utilities

### Project Documentation

- [`CLAUDE.md:73-85`](../../../../CLAUDE.md#L73-L85) - Remote MCP documentation

---

## ✅ Completion Checklist

- [ ] `buildersMcp.ts` created with OAuth integration
- [ ] `agent.ts` updated to conditionally add builders MCP
- [ ] OAuth routes verified/created
- [ ] OAuth config file (`oauth-mcpBuilders.json`) exists
- [ ] Manual testing completed:
  - [ ] OAuth flow works (login → callback → authenticated)
  - [ ] Remote MCP connects with valid token
  - [ ] App works without authentication (graceful degradation)
  - [ ] Token refresh works automatically
  - [ ] Connection failure handled gracefully
- [ ] Settings UI shows auth status (optional)
- [ ] No console errors during auth flow
- [ ] Remote tools available to agent when authenticated
- [ ] Local tools always available

---

## 🚀 Next Steps

Once Task 6 is complete, proceed to:

- **Task 7**: MCP Cache Integration (Optional)

---

**Last Updated**: 2025-10-21
