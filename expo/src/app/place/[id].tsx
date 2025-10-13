import { useLocalSearchParams, Stack } from "expo-router";
import { skipToken, useBackgroundQuery } from "@apollo/client/react";
import { Suspense } from "react";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { SafeAreaView } from "react-native-safe-area-context";
import PlaceDetailScreen from "@/screens/PlaceDetail/PlaceDetailScreen";
import { VariablesOf } from "@graphql-typed-document-node/core";

export default function PlaceDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const variables: VariablesOf<typeof PlaceDetailScreen.Query> = {
    placeId: id || "",
  };

  const [queryRef] = useBackgroundQuery(
    PlaceDetailScreen.Query,
    id ? { variables } : skipToken
  );

  if (!queryRef) {
    return null;
  }

  return (
    <>
      <Stack.Screen options={{ title: "Place Details" }} />
      <SafeAreaView style={{ flex: 1 }}>
        <ThemedView style={{ flex: 1 }}>
          <Suspense fallback={<ThemedText>Loading...</ThemedText>}>
            <PlaceDetailScreen queryRef={queryRef} />
          </Suspense>
        </ThemedView>
      </SafeAreaView>
    </>
  );
}
