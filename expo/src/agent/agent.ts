import { createOpenAI } from "@ai-sdk/openai";
import {
  streamText,
  UIMessage,
  convertToModelMessages,
  StreamTextResult,
} from "ai";

const model = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  organization: process.env.OPENAI_ORG_ID!,
})("gpt-4o");

const prompt = `
You are an agent for a conference schedule app.
A user might ask you questions about the schedule, speakers, venues, or other related information.
Use the tools you have available to find the most accurate and up-to-date information.
By default, all user questions should be interpreted as being about the 2025 GraphQLConf conference, unless explicitly stated otherwise.
`;

export async function runAgent({
  messages,
}: {
  messages: UIMessage[];
}): Promise<StreamTextResult<any, unknown>> {
  return streamText({
    model,
    messages: convertToModelMessages([
      { role: "system", parts: [{ type: "text", text: prompt }] },
      ...messages,
    ]),
  });
}
