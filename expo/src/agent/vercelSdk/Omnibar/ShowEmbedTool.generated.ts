/* eslint-disable */
import * as Types from '../../../graphql.generated';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type FetchMissingQueryVariables = Types.Exact<{
  identifiers: Array<Types.EntityIdentifier> | Types.EntityIdentifier;
}>;


export type FetchMissingQuery = { entities: Array<
    | { __typename: 'Place', __insert_here__: 'Place' }
    | { __typename: 'SchedEvent', __insert_here__: 'SchedEvent' }
    | { __typename: 'SchedSession', __insert_here__: 'SchedSession' }
    | { __typename: 'SchedSpeaker', __insert_here__: 'SchedSpeaker' }
    | { __typename: 'SchedVenue', __insert_here__: 'SchedVenue' }
  > };


export const FetchMissingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FetchMissing"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"identifiers"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EntityIdentifier"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"entities"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"identifiers"},"value":{"kind":"Variable","name":{"kind":"Name","value":"identifiers"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"__insert_here__"},"name":{"kind":"Name","value":"__typename"}}]}}]}}]} as unknown as DocumentNode<FetchMissingQuery, FetchMissingQueryVariables>;