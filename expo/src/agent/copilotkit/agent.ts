import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNodeHttpEndpoint,
} from "@copilotkit/runtime";

const serviceAdapter = new OpenAIAdapter({
  model: "gpt-4o",
});

// Create runtime instance
const runtime = new CopilotRuntime();

// Create endpoint handler
const copilotKitHandler = copilotRuntimeNodeHttpEndpoint({
  endpoint: "/copilotkit",
  runtime,
  serviceAdapter,
});

export async function handler(request: Request): Promise<Response> {
  const result = await copilotKitHandler(request);
  return new Response(result.body, {
    headers: result.headers,
    status: result.status,
  });
}
