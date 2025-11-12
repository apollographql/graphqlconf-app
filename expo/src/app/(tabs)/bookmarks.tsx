import { useBackgroundQuery } from "@apollo/client/react";
import { Suspense } from "react";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { SafeAreaView } from "react-native-safe-area-context";
import { BookmarksScreen } from "@/screens/Bookmarks/BookmarksScreen";

export default function BookmarksRoute() {
  const [queryRef] = useBackgroundQuery(BookmarksScreen.Query);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1 }}>
        <Suspense fallback={<ThemedText>Loading...</ThemedText>}>
          <BookmarksScreen queryRef={queryRef} />
        </Suspense>
      </ThemedView>
    </SafeAreaView>
  );
}
