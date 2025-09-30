import { createOpenAI } from "@ai-sdk/openai";
import {
  streamText,
  UIMessage,
  convertToModelMessages,
  experimental_createMCPClient,
  stepCountIs,
  smoothStream,
} from "ai";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { componentTools } from "@/availableFragmentComponents";

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
    })("gpt-4.1-mini"),
    // https://github.com/vercel/ai/issues/7099#issuecomment-3069539156
    // avoid "Item 'rs_03e6d4960e393c150068dbd1b235cc819ca60b4f637ad981e2' of type 'reasoning' was provided without its required following item." error
    // this seems to only be necessary when using GPT 5 tools
    // providerOptions: {
    //   openai: {
    //     store: false,
    //     reasoningEffort: "low",
    //     reasoningSummary: "auto",
    //     include: ["reasoning.encrypted_content"],
    //   } satisfies OpenAIResponsesProviderOptions,
    // },
    system: `
You are an agent for a conference schedule app.
A user might ask you questions about the schedule, speakers, venues, or other related information.
Use the tools you have available to find the most accurate and up-to-date information.
By default, all user questions should be interpreted as being about the 2025 GraphQLConf conference, unless explicitly stated otherwise.

When you receive tool results, analyze them and provide a helpful response to the user.
You may need to call multiple tools or call the same tool multiple times to get complete information.

If possible, use the "ShowEmbed-*" tools to show rich information.
After calling, a "ShowEmbed-*" tool will return the information displayed to the user in the app. Always wait for the tool result before responding to the user.
Don't repeat the information displayed by that tool in text form, but do provide any additional information that might be helpful to the user.
If the tool returns an error that it could not display the information, fall back to giving the user a fully textual response.

If additional textual output is necessary, use a friendly conversational tone. 

Even if the user asks for a "list" or uses other language that implicitly hints at textual content, try to use the "ShowEmbed-*" tools to show the information in a rich format, rather than listing it out yourself.
Only give a textual list if explicitly prompted for text, or if no other option is available.
-- End of initial system instructions --
    `.trim(),
    messages: convertToModelMessages(messages),
    tools: {
      ...mcpTools,
      ...componentTools,
    },
    stopWhen: stepCountIs(10),
    onStepFinish: async (step) => {
      console.dir(
        {
          toolCalls: step.toolCalls?.length || 0,
          toolResults: step.toolResults?.length || 0,
          hasText: !!step.text,
          fullResults: step.toolResults.map((r) => r.output),
        },
        { depth: 7 }
      );
    },
    experimental_transform: smoothStream({
      delayInMs: 20,
      chunking: "line",
    }),
  });
  return result.toUIMessageStreamResponse({
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "none",
    },
  });
}
