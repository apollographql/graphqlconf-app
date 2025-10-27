/* eslint-disable */
import * as Types from '../../../graphql.generated';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type SectionHeader_EventFragment = { __typename: 'SchedSession', id: string, start_time: string, start_time_ts: number | null } & { ' $fragmentName'?: 'SectionHeader_EventFragment' };

export const SectionHeader_EventFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SectionHeader_event"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SchedSession"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"start_time"}},{"kind":"Field","name":{"kind":"Name","value":"start_time_ts"}}]}}]} as unknown as DocumentNode<SectionHeader_EventFragment, unknown>;