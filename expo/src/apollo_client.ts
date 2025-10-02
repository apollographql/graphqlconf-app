import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { Platform } from "react-native";
import type { GraphQLCodegenDataMasking } from "@apollo/client/masking";
import { createFragmentRegistry } from "@apollo/client/cache";
import {
  DocumentTypeDecoration,
  TypedDocumentNode,
} from "@graphql-typed-document-node/core";
import { HKT } from "@apollo/client/utilities";

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

export const client = new ApolloClient({
  cache: new InMemoryCache({
    fragments: fragmentRegistry,
  }),
  link: new HttpLink({
    uri,
  }),
  dataMasking: true,
});

// export type From<TData = unknown> = NonNullable<
//   useSuspenseFragment.Options<TData, any>["from"]
// >;

export type FromParent<TDocumentType extends TypedDocumentNode<any, any>> =
  TDocumentType extends TypedDocumentNode<infer TType, any>
    ? [TType] extends [{ __typename: infer Typename; id: infer IdType }]
      ? { __typename: Typename; id: IdType }
      : never
    : never;
