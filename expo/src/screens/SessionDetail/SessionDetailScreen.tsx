import { gql } from "@apollo/client";
import { useReadQuery, QueryRef } from "@apollo/client/react";
import { SessionDetailContent } from "./components/SessionDetailContent";
import { SessionDetailScreenDocument } from "./SessionDetailScreen.generated";
import { ResultOf } from "@graphql-typed-document-node/core";

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
  queryRef: QueryRef<ResultOf<typeof SessionDetailScreen.Query>>;
}) {
  const { data } = useReadQuery(queryRef);

  if (!data.session) {
    return null;
  }

  return <SessionDetailContent session={data.session} queryRef={queryRef} />;
}
