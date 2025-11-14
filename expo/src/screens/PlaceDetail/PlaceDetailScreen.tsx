import { gql } from "@apollo/client";
import {
  useReadQuery,
  QueryRef,
  useQueryRefHandlers,
} from "@apollo/client/react";
import { PlaceDetailContent } from "./components/PlaceDetailContent";
import { PlaceDetailScreenDocument } from "./PlaceDetailScreen.generated";
import { ThemedText } from "@/components/ThemedText";

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    query PlaceDetailScreen($placeId: String!) {
      place(id: $placeId) {
        id
        ...PlaceDetailContent_place
      }
    }
  `;
}

PlaceDetailScreen.Query = PlaceDetailScreenDocument;

export default function PlaceDetailScreen({
  queryRef,
}: {
  queryRef: QueryRef.ForQuery<typeof PlaceDetailScreen.Query>;
}) {
  const { refetch } = useQueryRefHandlers(queryRef);
  const { data } = useReadQuery(queryRef);

  if (!data.place) {
    return <ThemedText>No place found.</ThemedText>;
  }

  return <PlaceDetailContent place={data.place} refetch={refetch} />;
}
