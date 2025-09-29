/* eslint-disable */
import * as Types from '../../graphql.generated';

import { ScheduleList_QueryFragment } from '../../components/schedule/ScheduleList.generated';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type ScheduleScreenQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ScheduleScreenQuery = { ' $fragmentRefs'?: { 'ScheduleList_QueryFragment': ScheduleList_QueryFragment } };


export const ScheduleScreenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ScheduleScreen"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ScheduleList_Query"}}]}}]} as unknown as DocumentNode<ScheduleScreenQuery, ScheduleScreenQueryVariables>;