import { oauth } from "@/agent/mcpBuilders";

export default async function middleware(request: Request) {
  {
    const response = oauth.middleware(request);
    if (response) {
      return response;
    }
  }
}

export const unstable_settings = {
  // Run middleware only for API routes that might need authentication
  matcher: ["/api/chat", "/api/mcp-auth/status"],
};
