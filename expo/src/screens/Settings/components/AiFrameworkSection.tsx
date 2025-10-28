import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { fragmentRegistry, FromParent } from "@/apollo/client";
import { FragmentType, gql } from "@apollo/client";
import { useSuspenseFragment, useMutation } from "@apollo/client/react";
import {
  AiFrameworkSection_FrameworksFragmentDoc,
  ChooseAiFrameworkDocument,
} from "./AiFrameworkSection.generated";
import { Picker } from "@react-native-picker/picker";
import { useColorScheme } from "@/hooks/use-color-scheme";

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    fragment AiFrameworkSection_frameworks on Query {
      aiFramework @client
    }
  `;
  // eslint-disable-next-line no-unused-expressions
  gql`
    mutation ChooseAiFramework($framework: String!) {
      chooseAiFramework(framework: $framework) @client
    }
  `;
}

AiFrameworkSection.fragments = {
  frameworks: AiFrameworkSection_FrameworksFragmentDoc,
} as const;

fragmentRegistry.register(AiFrameworkSection.fragments.frameworks);

export function AiFrameworkSection({
  frameworks,
}: {
  frameworks:
    | FragmentType<typeof AiFrameworkSection.fragments.frameworks>
    | FromParent<typeof AiFrameworkSection.fragments.frameworks>;
}) {
  const { data } = useSuspenseFragment({
    fragment: AiFrameworkSection.fragments.frameworks,
    fragmentName: "AiFrameworkSection_frameworks",
    from: frameworks,
  });

  const [chooseAiFramework] = useMutation(ChooseAiFrameworkDocument);
  const colorScheme = useColorScheme();

  const handleFrameworkChange = async (framework: string) => {
    try {
      await chooseAiFramework({
        variables: { framework },
      });
    } catch (error) {
      console.error("Failed to update AI framework:", error);
    }
  };

  return (
    <>
      <ThemedText type="subtitle" style={styles.sectionHeading}>
        AI Framework
      </ThemedText>

      <ThemedView style={styles.section}>
        <ThemedText type="defaultSemiBold">Chat Assistant SDK</ThemedText>
        <ThemedText style={styles.description}>
          The AI framework used for the chat assistant.
        </ThemedText>

        <ThemedView style={styles.pickerContainer}>
          <Picker
            selectedValue={data.aiFramework}
            onValueChange={handleFrameworkChange}
            style={styles.picker}
            dropdownIconColor={colorScheme === "dark" ? "#fff" : "#000"}
          >
            <Picker.Item label="None" value="none" />
            <Picker.Item label="Vercel AI SDK" value="vercel" />
            <Picker.Item
              label="CopilotKit (this is WIP, is not fully implemented and might break!)"
              value="copilotkit"
            />
          </Picker>
        </ThemedView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeading: {
    marginTop: 20,
    marginBottom: 10,
  },
  section: {
    gap: 12,
  },
  description: {
    opacity: 0.7,
    fontSize: 14,
  },
  pickerContainer: {
    marginTop: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
});
