import { ApolloClient } from "@apollo/client";
import { DocumentNode, buildClientSchema } from "graphql";
import { GraphQLStandardSchemaGenerator } from "@apollo/graphql-standard-schema";
import * as introspectionResult from "@/schema.json" with { type: "json" };
import { firstFragment } from "@/utils/firstFragment";
let generator: GraphQLStandardSchemaGenerator | null = null;

export function fullFragmentData(
  fragmentDoc: DocumentNode,
  client: ApolloClient
) {
  const transformedFragment =
    client.documentTransform.transformDocument(fragmentDoc);
  if (!generator) {
    generator = new GraphQLStandardSchemaGenerator({
      schema: buildClientSchema(introspectionResult as any),
    });
  }
  const standardSchema = generator.getFragmentSchema(transformedFragment, {
    fragmentName: firstFragment(transformedFragment).name.value,
  });
  return standardSchema["~standard"].toJSONSchema({
    io: "input",
    target: "draft-2020-12",
  });
}
