import { gql } from "@apollo/client";
import {
  useReadQuery,
  QueryRef,
  useQueryRefHandlers,
} from "@apollo/client/react";
import { SessionDetailContent } from "./components/SessionDetailContent";
import { SessionDetailScreenDocument } from "./SessionDetailScreen.generated";
import { ThemedText } from "@/components/ThemedText";

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    query SessionDetailScreen($sessionId: String!) {
      session(id: $sessionId) {
        id
        ...SessionDetailContent_session
      }
    }
  `;
}

SessionDetailScreen.Query = SessionDetailScreenDocument;

export default function SessionDetailScreen({
  queryRef,
}: {
  queryRef: QueryRef.ForQuery<typeof SessionDetailScreen.Query>;
}) {
  const { refetch } = useQueryRefHandlers(queryRef);
  const { data } = useReadQuery(queryRef);

  if (!data.session) {
    return <ThemedText>No session found.</ThemedText>;
  }

  return <SessionDetailContent session={data.session} refetch={refetch} />;
}
