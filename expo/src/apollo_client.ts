import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { type useSuspenseFragment } from "@apollo/client/react";
import { Platform } from "react-native";
import type { GraphQLCodegenDataMasking } from "@apollo/client/masking";
import { createFragmentRegistry } from "@apollo/client/cache";
import { DocumentTypeDecoration } from "@graphql-typed-document-node/core";

declare module "@apollo/client" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TypeOverrides extends GraphQLCodegenDataMasking.TypeOverrides {}
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

export type From<TDocumentType extends DocumentTypeDecoration<any, any>> =
  TDocumentType extends DocumentTypeDecoration<infer TType, any>
    ? [TType] extends [{ " $fragmentName"?: infer TKey }]
      ? TKey extends string
        ? { " $fragmentRefs"?: { [key in TKey]: TType } }
        : never
      : never
    : never;
