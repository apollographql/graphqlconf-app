import { ApolloClient } from "@apollo/client";
import { DocumentNode, buildClientSchema } from "graphql";
import {
  GraphQLStandardSchemaGenerator,
  toJSONSchema,
} from "@apollo/graphql-standard-schema";
import * as introspectionResult from "@/schema.json" with { type: "json" };
import { firstFragment } from "@/utils/firstFragment";
let generator: GraphQLStandardSchemaGenerator | null = null;
function getGenerator() {
  if (!generator) {
    generator = new GraphQLStandardSchemaGenerator({
      schema: buildClientSchema(introspectionResult as any),
    });
  }
  return generator;
}

export function generateQueryJsonSchema(
  query: DocumentNode,
  client: ApolloClient
) {
  const transformedQuery = client.documentTransform.transformDocument(query);
  const standardSchema = getGenerator().getDataSchema(transformedQuery);
  return toJSONSchema.input(standardSchema);
}

export function generateFragmentJsonSchema(
  fragmentDoc: DocumentNode,
  client: ApolloClient
) {
  const transformedFragment =
    client.documentTransform.transformDocument(fragmentDoc);

  const standardSchema = getGenerator().getFragmentSchema(transformedFragment, {
    fragmentName: firstFragment(transformedFragment).name.value,
  });
  return toJSONSchema.input(standardSchema);
}
