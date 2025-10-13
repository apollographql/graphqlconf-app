import { ApolloClient, DocumentNode } from "@apollo/client";
import { DefaultChatTransport, UIMessage, UIMessageChunk } from "ai";
import * as KnownQueries from "@/agent/mcp/supergraph-mcp-operations";

export class GraphQLToolChatTransport extends DefaultChatTransport<UIMessage> {
  private client: ApolloClient;
  constructor(
    client: ApolloClient,
    options: ConstructorParameters<typeof DefaultChatTransport>[0]
  ) {
    super(options);
    this.client = client;
  }

  override processResponseStream(
    stream: ReadableStream<Uint8Array<ArrayBufferLike>>
  ): ReadableStream<UIMessageChunk> {
    const toolCalls: Record<string, string | undefined> = {};
    const { client } = this;
    return super.processResponseStream(stream).pipeThrough(
      new TransformStream({
        transform(chunk, controller) {
          controller.enqueue(chunk);
          if (chunk.type === "tool-input-start") {
            toolCalls[chunk.toolCallId] = chunk.toolName;
          }
          if (chunk.type === "tool-output-available") {
            const toolName = toolCalls[chunk.toolCallId];
            const query =
              toolName &&
              (KnownQueries as Record<string, DocumentNode>)[toolName];
            const data = (chunk.output as any).structuredContent?.data;
            if (query && data) {
              client.writeQuery({
                query,
                data,
              });
            }
          }
        },
      })
    );
  }
}
