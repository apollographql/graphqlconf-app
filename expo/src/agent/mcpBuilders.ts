import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { createOauth } from "./utils/oauth/create";
import { experimental_createMCPClient } from "ai";

export const oauth = createOauth({
  cookiePrefix: "mcpBuilders",
  clientConfigFile: "oauth-mcpBuilders.json",
  protectedResourceUrl: "https://events.apollo.dev/mcp",
});

async function getRemoteEventsMCPClient(accessToken: string) {
  const transport = new StreamableHTTPClientTransport(
    new URL("https://events.apollo.dev/mcp"),
    {
      requestInit: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );

  return await experimental_createMCPClient({
    transport,
  });
}

export const getTools = async (request: Request) => {
  const accessToken = oauth.accessToken(request);
  if (accessToken) {
    try {
      const remoteEventsClient = await getRemoteEventsMCPClient(accessToken);
      return await remoteEventsClient.tools();
    } catch (error) {
      console.error("Failed to connect to remote events MCP server:", error);
      // Continue without remote events MCP tools
    }
  }
  return {};
};
