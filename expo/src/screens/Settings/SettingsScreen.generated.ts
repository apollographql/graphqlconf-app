/* eslint-disable */
import * as Types from '../../graphql.generated';

import { AiFrameworkSection_QueryFragment } from './components/AiFrameworkSection.generated';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type SettingsScreenQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type SettingsScreenQuery = { ' $fragmentRefs'?: { 'AiFrameworkSection_QueryFragment': AiFrameworkSection_QueryFragment } };


export const SettingsScreenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SettingsScreen"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AiFrameworkSection_Query"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AiFrameworkSection_Query"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Query"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"aiFramework"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"client"}}]}]}}]} as unknown as DocumentNode<SettingsScreenQuery, SettingsScreenQueryVariables>;