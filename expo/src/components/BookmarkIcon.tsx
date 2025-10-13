import { useMutation } from "@apollo/client/react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ToggleBookmarkDocument } from "@/mutations/ToggleBookmark";

export function BookmarkIcon({
  id,
  typename,
  isBookmarked,
  size = 24,
  color = "#007AFF",
  hitSlop = 8,
}: {
  id: string;
  typename: string;
  isBookmarked: boolean;
  size?: number;
  color?: string;
  hitSlop?: number;
}) {
  const [toggleBookmark] = useMutation(ToggleBookmarkDocument);

  const handleToggleBookmark = (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    toggleBookmark({
      variables: {
        id,
        typename,
      },
    });
  };

  return (
    <Pressable onPress={handleToggleBookmark} hitSlop={hitSlop}>
      <Ionicons
        name={isBookmarked ? "bookmark" : "bookmark-outline"}
        size={size}
        color={color}
      />
    </Pressable>
  );
}
