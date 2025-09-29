/* eslint-disable */
import * as Types from '../../graphql.generated';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export default function NotARoute(){ throw new Error('This is not a route!'); }
export type SectionHeader_SchedEventFragment = { __typename: 'SchedSession', id: string, start_time: string, start_time_ts: number | null } & { ' $fragmentName'?: 'SectionHeader_SchedEventFragment' };

export const SectionHeader_SchedEventFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SectionHeader_SchedEvent"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SchedSession"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"start_time"}},{"kind":"Field","name":{"kind":"Name","value":"start_time_ts"}}]}}]} as unknown as DocumentNode<SectionHeader_SchedEventFragment, unknown>;