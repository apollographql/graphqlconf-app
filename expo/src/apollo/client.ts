import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { Platform } from "react-native";
import type { GraphQLCodegenDataMasking } from "@apollo/client/masking";
import { createFragmentRegistry } from "@apollo/client/cache";
import {
  DocumentTypeDecoration,
  TypedDocumentNode,
} from "@graphql-typed-document-node/core";
import { HKT } from "@apollo/client/utilities";
import { LocalState } from "@apollo/client/local-state";
import { bookmarksResolvers } from "@/apollo/bookmarksResolvers";
import { aiFrameworkResolvers } from "@/apollo/aiFrameworkResolvers";

type AdjustedFragmentType<TData> =
  TData extends DocumentTypeDecoration<infer RealTData, any>
    ? AdjustedFragmentType<RealTData>
    : [TData] extends [{ " $fragmentName"?: infer TKey }]
      ? TKey extends string
        ? { " $fragmentRefs"?: { [key in TKey]: TData } }
        : never
      : never;

export interface AdjustedFragmentTypeHKT extends HKT {
  arg1: unknown; // TData
  return: AdjustedFragmentType<this["arg1"]>;
}

declare module "@apollo/client" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TypeOverrides
    extends Omit<GraphQLCodegenDataMasking.TypeOverrides, "FragmentType"> {
    FragmentType: AdjustedFragmentTypeHKT;
  }
}

if (!process.env.EXPO_PUBLIC__GRAPHQL_SERVER) {
  throw new Error("EXPO_PUBLIC__GRAPHQL_SERVER is not set");
}

let uri = process.env.EXPO_PUBLIC__GRAPHQL_SERVER!;
if (Platform.OS === "android") {
  uri = uri.replace("localhost", "10.0.2.2");
}

export const fragmentRegistry = createFragmentRegistry();

const _client = new ApolloClient({
  cache: new InMemoryCache({
    fragments: fragmentRegistry,
    typePolicies: {
      // Types with custom key fields
      File: {
        keyFields: ["path"],
      },
      SocialUrl: {
        keyFields: ["service", "url"],
      },
      LocalizedText: {
        keyFields: ["text", "languageCode"],
      },
      AddressComponent: {
        keyFields: ["longText", "shortText", "types", "languageCode"],
      },
      PlusCode: {
        keyFields: ["globalCode"],
      },
      Attribution: {
        keyFields: ["provider", "providerUri"],
      },
      AuthorAttribution: {
        keyFields: ["uri"],
      },

      // Embedded types that don't need normalization
      LatLng: {
        keyFields: false,
      },
      Viewport: {
        keyFields: false,
      },
      GoogleMapsLinks: {
        keyFields: false,
      },
    },
  }),
  link: new HttpLink({
    uri,
  }),
  localState: new LocalState({
    resolvers: {
      Query: {
        ...bookmarksResolvers.Query,
        ...aiFrameworkResolvers.Query,
      },
      Mutation: {
        ...bookmarksResolvers.Mutation,
        ...aiFrameworkResolvers.Mutation,
      },
    },
  }),
  dataMasking: true,
});

export const client =
  typeof window === "undefined"
    ? // sometimes something tries to access the client on the server, so we return a reduced version of AC here to get a very early error instead of a stack trace that doesn't have anything to do with the real problem
      ({
        documentTransform: _client.documentTransform,
      } as typeof _client)
    : _client;

export type FromParent<TDocumentType extends TypedDocumentNode<any, any>> =
  TDocumentType extends TypedDocumentNode<infer TType, any>
    ? [TType] extends [{ __typename: infer Typename; id: infer IdType }]
      ? { __typename: Typename; id: IdType }
      : never
    : never;
