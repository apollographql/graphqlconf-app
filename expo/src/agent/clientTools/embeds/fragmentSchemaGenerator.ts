import { DocumentNode, GraphQLSchema, buildClientSchema } from "graphql";
import { GraphQLStandardSchemaGenerator } from "@apollo/graphql-standard-schema";
import * as introspectionResult from "@/schema.json" with { type: "json" };
let cachedSchema: GraphQLSchema | null = null;
let cachedGenerator: GraphQLStandardSchemaGenerator | null = null;

function getGenerator() {
  if (!cachedGenerator) {
    // Load the GraphQL schema from the server and local schema files
    cachedSchema = buildClientSchema(introspectionResult as any);
    console.log({ cachedSchema });
    cachedGenerator = new GraphQLStandardSchemaGenerator({
      schema: cachedSchema,
    });
  }
  return cachedGenerator;
}

/**
 * Generate a standard schema for a GraphQL fragment
 * This schema can be converted to JSON Schema for use with the AI SDK
 */
export function getFragmentStandardSchema(
  fragmentDoc: DocumentNode,
  fragmentName?: string
) {
  const generator = getGenerator();
  return generator.getFragmentSchema(
    fragmentDoc,
    fragmentName ? { fragmentName } : undefined
  );
}

/**
 * Convert a standard schema to JSON Schema for use with the AI SDK
 */
export function toJSONSchema(
  schema: ReturnType<typeof getFragmentStandardSchema>
) {
  return schema["~standard"].toJSONSchema({
    io: "input",
    target: "draft-2020-12",
  });
}

/**
 * Get the JSON Schema for a fragment, ready to use with the AI SDK
 */
export function getFragmentJSONSchema(
  fragmentDoc: DocumentNode,
  fragmentName?: string
) {
  const standardSchema = getFragmentStandardSchema(fragmentDoc, fragmentName);
  return toJSONSchema(standardSchema);
}
