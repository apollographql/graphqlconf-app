import { getFragmentJSONSchema } from "@/agent/clientTools/embeds/fragmentSchemaGenerator";
import { ApolloClient } from "@apollo/client";
import { DocumentNode } from "graphql";
import { firstFragment } from "./firstFragment";

export function fullFragmentData(
  fragmentDoc: DocumentNode,
  client: ApolloClient
) {
  const fragment = firstFragment(
    client.documentTransform.transformDocument(fragmentDoc)
  );
  return getFragmentJSONSchema(fragmentDoc, fragment.name.value);
}
