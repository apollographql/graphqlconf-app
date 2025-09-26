import { ollama, OllamaProvider } from "ollama-ai-provider-v2";
import {
  streamText,
  UIMessage,
  convertToModelMessages,
  experimental_createMCPClient,
} from "ai";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { input } from "zod";

type OllamaProviderOptions = input<
  NonNullable<Parameters<OllamaProvider["chat"]>[1]>
>;

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
    model: ollama("mistral:7b"),
    providerOptions: {
      ollama: { think: false } satisfies OllamaProviderOptions,
    },

    messages: convertToModelMessages([
      {
        role: "system",
        parts: [
          {
            type: "text",
            text: `
You are part of a conference schedule app. 
A user might ask you questions about the schedule, speakers, venues, or other related information. 
Use the tools you have available to find the most accurate and up-to-date information.
By default, all user questions should be interpreted as being about the 2025 GraphQLConf conference, unless explicitly stated otherwise.
    `.trim(),
            state: "done",
          },
        ],
      },
      ...messages,
    ]),
    tools: mcpTools,
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
