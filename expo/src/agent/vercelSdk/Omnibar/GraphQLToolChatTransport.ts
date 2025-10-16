import { ApolloClient, DocumentNode, OperationVariables } from "@apollo/client";
import { DefaultChatTransport, UIMessage, UIMessageChunk } from "ai";
import * as KNOWN from "@/agent/mcp/supergraph-mcp-operations";
import { print } from "graphql";

const KnownQueries: Record<
  string,
  { query: DocumentNode; defaultVariables?: OperationVariables }
> = Object.fromEntries(
  Object.entries(KNOWN).map(([key, value]) => [
    key.toLowerCase(),
    { query: value },
  ])
);
KnownQueries["getcurrentevent"] = {
  query: KNOWN.GetEvents,
  defaultVariables: { ids: [process.env.EXPO_PUBLIC_CURRENT_EVENT] },
};

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
    const toolCalls: Record<
      string,
      { name: string; variables?: OperationVariables } | undefined
    > = {};
    const { client } = this;
    return super.processResponseStream(stream).pipeThrough(
      new TransformStream({
        transform(chunk, controller) {
          controller.enqueue(chunk);
          switch (chunk.type) {
            case "tool-input-start": {
              toolCalls[chunk.toolCallId] = {
                name: chunk.toolName,
              };
              break;
            }
            case "tool-input-available": {
              const tool = toolCalls[chunk.toolCallId];
              if (!tool) break;
              tool.variables = chunk.input as any;
              console.log("Tool call started:", tool);
              break;
            }
            case "tool-output-error": {
              const tool = toolCalls[chunk.toolCallId];
              if (!tool) break;
              delete toolCalls[chunk.toolCallId];
              console.log("Tool call errored:", tool, chunk.errorText);
              break;
            }
            case "tool-output-available": {
              const tool = toolCalls[chunk.toolCallId];
              if (!tool) break;
              delete toolCalls[chunk.toolCallId];
              console.log("Tool call finished:", tool, chunk.output);
              const queryDetails =
                tool && KnownQueries[tool.name.toLowerCase()];
              const data = (chunk.output as any).structuredContent?.data;
              if (queryDetails && data) {
                const options = {
                  query: queryDetails.query,
                  data,
                  variables: {
                    ...queryDetails.defaultVariables,
                    ...tool.variables,
                  },
                };
                console.log("Writing tool call result to Apollo cache", {
                  ...options,
                  query: print(queryDetails.query),
                });
                client.writeQuery(options);
              }
              break;
            }
            default: {
              console.debug("Message chunk:", chunk.type);
              break;
            }
          }
        },
      })
    );
  }
}
