import {
  SystemMessageFunction,
  useCopilotReadable,
} from "@copilotkit/react-core";
import { useLocalSearchParams, useSegments } from "expo-router/build/hooks";
import { prompt } from "@/agent/prompt";

export function useAppContext() {
  const route = useSegments().join("/");
  const routeParams = useLocalSearchParams();
  useCopilotReadable({
    description: "The app configured to focus on the event with ID",
    value: process.env.EXPO_PUBLIC_CURRENT_EVENT!,
  });
  useCopilotReadable({
    description: "Location",
    value:
      "The user has not shared their location. Unless they specify, assume that they are at the conference venue.",
  });
  useCopilotReadable({
    description: "Current route",
    value: route,
  });
  useCopilotReadable({
    description: "Current route arguments",
    value: routeParams,
  });
}

export const makeSystemMessage: SystemMessageFunction = (
  contextString,
  additionalInstructions
) => {
  return (
    `${prompt}

The user has provided you with the following context:
\`\`\`
0.Date and time: ${new Date().toISOString()}${contextString}
\`\`\`
` + (additionalInstructions ? `\n\n${additionalInstructions}` : "")
  );
};
