import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { fragmentRegistry, FromParent } from "@/apollo/client";
import { FragmentType, gql } from "@apollo/client";
import { useSuspenseFragment, useMutation } from "@apollo/client/react";
import {
  AiFrameworkSection_QueryFragmentDoc,
  ChooseAiFrameworkDocument,
} from "./AiFrameworkSection.generated";
import { Picker } from "@react-native-picker/picker";
import { useColorScheme } from "@/hooks/use-color-scheme";

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    fragment AiFrameworkSection_Query on Query {
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
  Query: AiFrameworkSection_QueryFragmentDoc,
} as const;

fragmentRegistry.register(AiFrameworkSection.fragments.Query);

export function AiFrameworkSection({
  parent,
}: {
  parent:
    | FragmentType<typeof AiFrameworkSection.fragments.Query>
    | FromParent<typeof AiFrameworkSection.fragments.Query>;
}) {
  const { data } = useSuspenseFragment({
    fragment: AiFrameworkSection.fragments.Query,
    fragmentName: "AiFrameworkSection_Query",
    from: parent,
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
