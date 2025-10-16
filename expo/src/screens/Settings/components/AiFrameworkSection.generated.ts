/* eslint-disable */
import * as Types from '../../../graphql.generated';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type AiFrameworkSection_QueryFragment = { aiFramework: string } & { ' $fragmentName'?: 'AiFrameworkSection_QueryFragment' };

export type ChooseAiFrameworkMutationVariables = Types.Exact<{
  framework: Types.Scalars['String']['input'];
}>;


export type ChooseAiFrameworkMutation = { chooseAiFramework: string };

export const AiFrameworkSection_QueryFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AiFrameworkSection_Query"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Query"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"aiFramework"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"client"}}]}]}}]} as unknown as DocumentNode<AiFrameworkSection_QueryFragment, unknown>;
export const ChooseAiFrameworkDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChooseAiFramework"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"framework"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chooseAiFramework"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"framework"},"value":{"kind":"Variable","name":{"kind":"Name","value":"framework"}}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"client"}}]}]}}]} as unknown as DocumentNode<ChooseAiFrameworkMutation, ChooseAiFrameworkMutationVariables>;