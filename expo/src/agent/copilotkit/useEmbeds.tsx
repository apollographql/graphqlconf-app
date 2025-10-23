import { useFrontendTool } from "@copilotkit/react-core";
import {
  availableFragmentComponents,
  hasFragmentDefinitions,
} from "@/agent/clientTools/fragmentComponentEmbeds";
import {
  actionParametersToJsonSchema,
  jsonSchemaToActionParameters,
} from "@copilotkit/shared";
import { handleEmbedCacheOperations } from "../utils/handleEmbedCacheOperations";
import { useApolloClient } from "@apollo/client/react";
import { Suspense } from "react";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { TypingIndicator } from "@/components/Omnibar/TypingIndicator";

export function useEmbeds() {
  const client = useApolloClient();
  for (const [key, embed] of Object.entries(availableFragmentComponents)) {
    // the number or order of iterations will not change between renders
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useFrontendTool<any>({
      name: "ShowEmbed-" + key,
      description: embed.description,
      parameters: jsonSchemaToActionParameters(embed.schema.jsonSchema as any),
      async handler(args) {
        console.log({ embed, args });
        if (!hasFragmentDefinitions(embed)) return;

        const validationResult = await embed.schema.validate?.(args);
        if (validationResult?.success === false) {
          console.log("Validation error", validationResult.error, {
            args,
            originalSchema: embed.schema.jsonSchema,
            parameters: jsonSchemaToActionParameters(
              embed.schema.jsonSchema as any
            ),
            derivedSchema: actionParametersToJsonSchema(
              jsonSchemaToActionParameters(embed.schema.jsonSchema as any)
            ),
          });
          throw new Error(validationResult.error.message);
        }

        const result = handleEmbedCacheOperations({
          embed,
          client,
          args,
        });

        if (result.state === "error") {
          throw new Error(result.message);
        }
        return result;
      },
      render({ status, args }) {
        if (status !== "complete") {
          return <TypingIndicator />;
        }
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
                  Loading... {JSON.stringify(args, null, 2)}
                </ThemedText>
              </ThemedView>
            }
          >
            <embed.Component {...(args as any)} />
          </Suspense>
        );
      },
    });
  }
}
