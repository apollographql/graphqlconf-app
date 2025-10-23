import { FragmentComponentDefinition } from "@/agent/clientTools/fragmentComponentEmbeds";
import { JSONSchema7 } from "ai";
import { ApolloClient, gql } from "@apollo/client";
import { firstFragment } from "@/utils/firstFragment";
import { mapEntries } from "@/utils/mapEntries";
import { generateFragmentJsonSchema } from "@/utils/generateJsonSchema";
import { DocumentNode, Kind, visit } from "graphql";

type EmbedResult =
  | {
      state: "success";
      message: string;
      data: Record<string, unknown>;
    }
  | {
      state: "recoverable";
      message: string;
      missing: Record<string, { __typename: string; id: string }[]>;
      shapes: Record<string, JSONSchema7>;
    }
  | {
      state: "error";
      message: string;
    };

const bareGetIdentifiersQuery = gql`
  query FetchMissing($identifiers: [EntityIdentifier!]!) {
    entities(identifiers: $identifiers) {
      __insert_here__: __typename
    }
  }
`;

export function handleEmbedCacheOperations({
  args,
  embed: { Component, fetchIfMissing },
  client,
}: {
  args: Record<string, any>;
  embed: FragmentComponentDefinition;
  client: ApolloClient;
}) {
  const output: Record<string, unknown> = {};
  return client.cache.batch({
    update(cache): EmbedResult {
      const missing: Record<string, { __typename: string; id: string }[]> = {};
      for (const [key, fragment] of Object.entries(Component.fragments)) {
        const firstDef = firstFragment(fragment);
        const targetTypeName = firstDef.typeCondition.name.value;
        const fragmentName = firstDef.name.value;
        const propValue = args[key];
        const propResult = [];
        for (const item of Array.isArray(propValue) ? propValue : [propValue]) {
          const identifierOnly =
            item.__typename && Object.keys(item).length === 2;
          if (identifierOnly) {
            const fragmentData = cache.readFragment({
              id: cache.identify(args[targetTypeName]),
              fragment,
              fragmentName,
            });
            if (!fragmentData) {
              if (fetchIfMissing) {
                (missing[key] ??= []).push(item);
                continue;
              }
              return {
                state: "error",
                message:
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
                state: "error",
                message:
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
        };
      }

      return {
        state: "success",
        message: "This data has been displayed to the user",
        data: output,
      };
    },
  });
}
