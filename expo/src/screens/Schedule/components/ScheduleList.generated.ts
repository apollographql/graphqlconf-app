/* eslint-disable */
import * as Types from '../../../graphql.generated';

import { ScheduleListItem_SchedSessionFragment } from './ScheduleItem.generated';
import { SectionHeader_SchedEventFragment } from './SectionHeader.generated';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type ScheduleList_QueryFragment = { events: Array<(
    { __typename: 'SchedSession', id: string, start_time_ts: number | null, venue: { __typename: 'SchedVenue', id: string } | null }
    & { ' $fragmentRefs'?: { 'ScheduleListItem_SchedSessionFragment': ScheduleListItem_SchedSessionFragment;'SectionHeader_SchedEventFragment': SectionHeader_SchedEventFragment } }
  )> } & { ' $fragmentName'?: 'ScheduleList_QueryFragment' };

export const ScheduleList_QueryFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ScheduleList_Query"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Query"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"year"},"value":{"kind":"Variable","name":{"kind":"Name","value":"year"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"start_time_ts"}},{"kind":"Field","name":{"kind":"Name","value":"venue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"ScheduleListItem_SchedSession"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SectionHeader_SchedEvent"}}]}}]}}]} as unknown as DocumentNode<ScheduleList_QueryFragment, unknown>;