/* eslint-disable */
import * as Types from '../../graphql.generated';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type SectionHeader_SchedEventFragment = { __typename: 'SchedEvent', start_time: string | null, start_weekday: string | null } & { ' $fragmentName'?: 'SectionHeader_SchedEventFragment' };

export const SectionHeader_SchedEventFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SectionHeader_SchedEvent"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SchedEvent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start_time"}},{"kind":"Field","name":{"kind":"Name","value":"start_weekday"}}]}}]} as unknown as DocumentNode<SectionHeader_SchedEventFragment, unknown>;