import { ollama, OllamaProvider } from "ollama-ai-provider-v2";
import { streamText, UIMessage, convertToModelMessages } from "ai";
import type { input } from "zod";

type OllamaProviderOptions = input<
  NonNullable<Parameters<OllamaProvider["chat"]>[1]>
>;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: ollama("gemma3:1b"),
    providerOptions: {
      ollama: { think: false } satisfies OllamaProviderOptions,
    },
    messages: convertToModelMessages(messages),
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
