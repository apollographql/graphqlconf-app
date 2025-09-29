import { createOpenAI } from "@ai-sdk/openai";
import {
  streamText,
  UIMessage,
  convertToModelMessages,
  experimental_createMCPClient,
  stepCountIs,
} from "ai";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

let persistentClient: Awaited<
  ReturnType<typeof experimental_createMCPClient>
> | null = null;

async function getPersistentClient() {
  if (persistentClient) return persistentClient;

  const transport = new StreamableHTTPClientTransport(
    new URL("http://127.0.0.1:5000/mcp")
  );

  persistentClient = await experimental_createMCPClient({
    transport,
  });

  return persistentClient;
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const client = await getPersistentClient();

  const mcpTools = await client.tools();

  const result = streamText({
    model: createOpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      organization: process.env.OPENAI_ORG_ID!,
    })("gpt-5-mini"),

    system: `
You are an agent for a conference schedule app.
A user might ask you questions about the schedule, speakers, venues, or other related information.
Use the tools you have available to find the most accurate and up-to-date information.
By default, all user questions should be interpreted as being about the 2025 GraphQLConf conference, unless explicitly stated otherwise.

When you receive tool results, analyze them and provide a helpful response to the user.
You may need to call multiple tools or call the same tool multiple times to get complete information.
Always synthesize the information from tools into a clear, conversational response.
-- End of initial system instructions --
    `.trim(),
    messages: convertToModelMessages(messages),
    tools: mcpTools,
    stopWhen: stepCountIs(10),
    onStepFinish: async (step) => {
      console.log("Step completed:", {
        toolCalls: step.toolCalls?.length || 0,
        toolResults: step.toolResults?.length || 0,
        hasText: !!step.text,
      });
    },
  });

  return result.toUIMessageStreamResponse({
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "none",
    },
  });
}
// export async function GET(req: Request) {
//   const result = generateObject({
//     model: ollama("gemma3:1b"),
//     providerOptions: {
//       ollama: { think: false } satisfies OllamaProviderOptions,
//     },
//     prompt: "Write a very simple recipe for pancakes.",
//     schema: z.object({
//       title: z.string().describe("The title of the recipe"),
//       ingredients: z.array(z.string()).describe("The ingredients needed"),
//       instructions: z.array(z.string()).describe("The cooking instructions"),
//     }),
//   });

//   return Response.json((await result).object);
// }
