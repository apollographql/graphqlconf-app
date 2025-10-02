import { gql } from "@apollo/client";
import { QueryRef } from "@apollo/client/react";
import { ScheduleScreenDocument } from "./ScheduleScreen.generated";
import { ScheduleList } from "./components/ScheduleList";
import { ResultOf, VariablesOf } from "@graphql-typed-document-node/core";

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    query ScheduleScreen($year: String!) {
      ...ScheduleList_Query
    }
  `;
}

ScheduleScreen.Query = ScheduleScreenDocument;

export function ScheduleScreen({
  queryRef,
  variables,
}: {
  queryRef: QueryRef<
    ResultOf<typeof ScheduleScreen.Query>,
    VariablesOf<typeof ScheduleScreen.Query>
  >;
  variables: VariablesOf<typeof ScheduleScreen.Query>;
}) {
  return (
    <ScheduleList
      parent={"ROOT_QUERY" as any}
      queryRef={queryRef}
      variables={variables}
    />
  );
}
