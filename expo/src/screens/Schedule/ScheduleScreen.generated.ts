/* eslint-disable */
import * as Types from '../../graphql.generated';

import { ScheduleList_QueryFragment } from './components/ScheduleList.generated';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type ScheduleScreenQueryVariables = Types.Exact<{
  year: Types.Scalars['String']['input'];
}>;


export type ScheduleScreenQuery = { ' $fragmentRefs'?: { 'ScheduleList_QueryFragment': ScheduleList_QueryFragment } };


export const ScheduleScreenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ScheduleScreen"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"year"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ScheduleList_Query"}}]}}]} as unknown as DocumentNode<ScheduleScreenQuery, ScheduleScreenQueryVariables>;