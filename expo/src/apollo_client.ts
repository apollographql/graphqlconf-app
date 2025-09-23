import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { type useSuspenseFragment } from "@apollo/client/react";
import { Platform } from "react-native";

if (!process.env.EXPO_PUBLIC__GRAPHQL_SERVER) {
  throw new Error("EXPO_PUBLIC__GRAPHQL_SERVER is not set");
}

let uri = process.env.EXPO_PUBLIC__GRAPHQL_SERVER!;
if (Platform.OS === "android") {
  uri = uri.replace("localhost", "10.0.2.2");
}

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri,
  }),
  dataMasking: true,
});

export type From<TData = unknown> = NonNullable<
  useSuspenseFragment.Options<TData, any>["from"]
>;
