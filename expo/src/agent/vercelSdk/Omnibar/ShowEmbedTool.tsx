import { availableFragmentComponents } from "@/agent/clientTools/fragmentComponentEmbeds";
import {
  AbstractChat,
  ChatOnToolCallCallback,
  isToolUIPart,
  Tool,
  UIMessage,
  UITool,
  UIToolInvocation,
} from "ai";
import { Suspense } from "react";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { ApolloClient, DocumentNode, gql } from "@apollo/client";
import { firstFragment } from "@/utils/firstFragment";
import { mapEntries } from "@/utils/mapEntries";
import { generateFragmentJsonSchema } from "@/utils/generateJsonSchema";
import { Kind, visit } from "graphql";

type ShowEmbedToolUIInvocation<TOOL extends UITool | Tool> = {
  type: `tool-ShowEmbed-${string}`;
} & UIToolInvocation<TOOL>;

type ToolCall = Parameters<ChatOnToolCallCallback>[0]["toolCall"];

type ToolResult = Parameters<AbstractChat<UIMessage>["addToolResult"]>[0];

export function isShowEmbedToolUIPart(
  part: Parameters<typeof isToolUIPart>[0]
): part is ShowEmbedToolUIInvocation<UITool> {
  return isToolUIPart(part) && part.type.startsWith("tool-ShowEmbed-");
}

function hasFragmentDefinitions(
  Component: React.FC<any>
): Component is typeof Component & {
  fragments: Record<string, DocumentNode>;
} {
  return "fragments" in Component;
}

const bareGetIdentifiersQuery = gql`
  query FetchMissing($identifiers: [EntityIdentifier!]!) {
    entities(identifiers: $identifiers) {
      __insert_here__: __typename
    }
  }
`;

/**
 * @returns true if the tool call was handled, false otherwise
 */
export function handleShowEmbedToolCall(
  toolCall: ToolCall,
  client: ApolloClient
): void | ToolResult {
  if (!toolCall.toolName.startsWith("ShowEmbed-")) return;
  const componentName = toolCall.toolName.substring("ShowEmbed-".length);
  if (!(componentName in availableFragmentComponents)) {
    throw new Error(`Unknown component name: ${componentName}`);
  }
  const details =
    availableFragmentComponents[
      componentName as keyof typeof availableFragmentComponents
    ];
  const output: Record<string, unknown> = {};
  const props = toolCall.input as Record<string, any>;
  const { Component } = details;
  if (!hasFragmentDefinitions(Component)) return;
  const result = client.cache.batch({
    update(cache): ToolResult {
      const missing: Record<string, { __typename: string; id: string }[]> = {};
      for (const [key, fragment] of Object.entries(Component.fragments)) {
        const firstDef = firstFragment(fragment);
        const targetTypeName = firstDef.typeCondition.name.value;
        const fragmentName = firstDef.name.value;
        const propValue = props[key];
        const propResult = [];
        for (const item of Array.isArray(propValue) ? propValue : [propValue]) {
          console.log({ targetTypeName, fragmentName, item });
          const identifierOnly =
            item.__typename && Object.keys(item).length === 2;
          if (identifierOnly) {
            const fragmentData = cache.readFragment({
              id: cache.identify(props[targetTypeName]),
              fragment,
              fragmentName,
            });
            if (!fragmentData) {
              if (details.fetchIfMissing) {
                (missing[key] ??= []).push(item);
                continue;
              }
              return {
                tool: toolCall.toolName,
                toolCallId: toolCall.toolCallId,
                state: "output-error",
                errorText:
                  "Could not render component in the app due to missing data. Fall back to giving the user a textual response.",
              };
            }
            propResult.push(fragmentData);
          } else {
            try {
              cache.writeFragment({
                id: cache.identify(item),
                fragment: fragment,
                fragmentName: fragmentName,
                data: item,
              });
              propResult.push(item);
            } catch (e: any) {
              return {
                tool: toolCall.toolName,
                toolCallId: toolCall.toolCallId,
                state: "output-error",
                errorText:
                  "Data could not be written. This ususally means that the tool call arguments didn't satisfy the `inputSchema`. This tool call might be retried once before giving up, with more focus on strict adherence to the `inputSchema` for the tool.\n" +
                  "Original error message:\n" +
                  e.message,
              };
            }
          }
        }
        output[targetTypeName] = Array.isArray(propValue)
          ? propResult
          : propResult[0];
      }

      if (Object.keys(missing).length > 0) {
        const shapes = mapEntries(missing, "", (_, key) => {
          const fragment = Component.fragments[key];
          return generateFragmentJsonSchema(fragment, client);
        });
        const query = visit(bareGetIdentifiersQuery, {
          SelectionSet(node) {
            if (
              node.selections.length === 1 &&
              node.selections[0].kind === "Field" &&
              node.selections[0].alias?.value === "__insert_here__"
            ) {
              console.log("Inserting selections for", { missing });
              return {
                ...node,
                selections: Object.keys(missing).map((key) => {
                  const fragment = Component.fragments[key];
                  const firstDef = firstFragment(fragment);
                  return {
                    kind: Kind.FRAGMENT_SPREAD,
                    name: {
                      kind: Kind.NAME,
                      value: firstDef.name.value,
                    },
                  };
                }),
              };
            }
          },
        });
        void client
          .query({
            query,
            variables: {
              identifiers: Object.values(missing)
                .flat()
                .map(({ __typename, ...key }) => ({
                  typename: __typename,
                  ...key,
                })),
            },
          })
          .catch(console.error);
        return {
          tool: toolCall.toolName,
          toolCallId: toolCall.toolCallId,
          output: {
            state: "recoverable",
            missing,
            shapes,
            ...(Object.keys(output).length === 0
              ? {
                  message: `
The requested items could not be found in the cache and will be fetched on the client - those can be found in the \`missing\` property.
See the \`shapes\` property that described the structure of the data those missing items will have and what will be displayed to the user.
Double-check that the typenames and ids from \`missing\` are correct with data that you have available.
If they are, assume that they will be displayed to the user before your next response arrives and formulate it accordingly.
If any IDs are incorrect, assume that these items will not be displayed and the action might result in a partial or full error.
In that case, apologize to the user and describe the items with text instead.
`.trim(),
                }
              : {
                  message: `
The data in the \`data\` property has been displayed to the user.
Some items could not be found in the cache and will be fetched on the client - those can be found in the \`missing\` property.
See the \`shapes\` property that described the structure of the data those missing items will have and what will be displayed to the user.
Double-check that the typenames and ids from \`missing\` are correct with data that you have available.
If they are, assume that they will be displayed to the user before your next response arrives and formulate it accordingly.
If any IDs are incorrect, assume that these items will not be displayed and the action might result in a partial or full error.
In that case, apologize to the user and describe the items with text instead.
`.trim(),
                  data: output,
                }),
          },
        };
      }

      return {
        tool: toolCall.toolName,
        toolCallId: toolCall.toolCallId,
        output: {
          state: "success",
          message: "This data has been displayed to the user",
          data: output,
        },
      };
    },
  });
  if (result) {
    console.log("ShowEmbed tool call result:", result);
  }
  return result;
}

export function ShowEmbedPart({
  part,
}: {
  part: ShowEmbedToolUIInvocation<UITool>;
}) {
  const componentName = part.type.substring("tool-ShowEmbed-".length);
  if (part.state === "output-available") {
    const embed =
      availableFragmentComponents[
        componentName as keyof typeof availableFragmentComponents
      ];

    return (
      <Suspense
        fallback={
          <ThemedView
            style={{
              margin: 10,
              borderWidth: 1,
              borderRadius: 8,
              padding: 10,
            }}
          >
            <ThemedText>
              Loading... {JSON.stringify(part.input, null, 2)}
            </ThemedText>
          </ThemedView>
        }
      >
        <embed.Component {...(part.input as any)} />
      </Suspense>
    );
  }
}
