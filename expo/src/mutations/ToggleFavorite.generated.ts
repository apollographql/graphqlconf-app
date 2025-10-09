/* eslint-disable */
import * as Types from '../graphql.generated';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type ToggleFavoriteMutationVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
  typename: Types.Scalars['String']['input'];
}>;


export type ToggleFavoriteMutation = { toggleFavorite:
    | { __typename: 'Place', id: string, isFavorite: boolean }
    | { __typename: 'SchedSession', id: string, isFavorite: boolean }
    | { __typename: 'SchedSpeaker', id: string, isFavorite: boolean }
   };


export const ToggleFavoriteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ToggleFavorite"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"typename"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"toggleFavorite"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"typename"},"value":{"kind":"Variable","name":{"kind":"Name","value":"typename"}}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"client"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isFavorite"}}]}}]}}]} as unknown as DocumentNode<ToggleFavoriteMutation, ToggleFavoriteMutationVariables>;