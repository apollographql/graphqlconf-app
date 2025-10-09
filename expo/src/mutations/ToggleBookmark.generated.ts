/* eslint-disable */
import * as Types from '../graphql.generated';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type ToggleBookmarkMutationVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
  typename: Types.Scalars['String']['input'];
  isBookmarked?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
}>;


export type ToggleBookmarkMutation = { toggleBookmark:
    | { __typename: 'Place', id: string, isBookmarked: boolean }
    | { __typename: 'SchedSession', id: string, isBookmarked: boolean }
    | { __typename: 'SchedSpeaker', id: string, isBookmarked: boolean }
   };


export const ToggleBookmarkDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ToggleBookmark"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"typename"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isBookmarked"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"toggleBookmark"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"typename"},"value":{"kind":"Variable","name":{"kind":"Name","value":"typename"}}},{"kind":"Argument","name":{"kind":"Name","value":"isBookmarked"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isBookmarked"}}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"client"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isBookmarked"}}]}}]}}]} as unknown as DocumentNode<ToggleBookmarkMutation, ToggleBookmarkMutationVariables>;