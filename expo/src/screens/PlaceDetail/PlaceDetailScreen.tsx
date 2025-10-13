import { gql } from "@apollo/client";
import { useReadQuery, QueryRef } from "@apollo/client/react";
import { PlaceDetailContent } from "./components/PlaceDetailContent";
import { PlaceDetailScreenDocument } from "./PlaceDetailScreen.generated";
import { ResultOf } from "@graphql-typed-document-node/core";

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    query PlaceDetailScreen($placeId: String!) {
      place(id: $placeId) {
        id
        ...PlaceDetailContent_Place
      }
    }
  `;
}

PlaceDetailScreen.Query = PlaceDetailScreenDocument;

export default function PlaceDetailScreen({
  queryRef,
}: {
  queryRef: QueryRef<ResultOf<typeof PlaceDetailScreen.Query>>;
}) {
  const { data } = useReadQuery(queryRef);

  if (!data.place) {
    return null;
  }

  return <PlaceDetailContent Place={data.place} queryRef={queryRef} />;
}
