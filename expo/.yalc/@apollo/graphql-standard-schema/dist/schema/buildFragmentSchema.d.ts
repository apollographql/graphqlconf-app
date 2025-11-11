import { GraphQLSchema, type DocumentNode, type FragmentDefinitionNode } from "graphql";
import type { GraphQLStandardSchemaGenerator } from "../GraphQLStandardSchemaGenerator.ts";
import type { OpenAiSupportedJsonSchema } from "../utils/openAiSupportedJsonSchema.ts";
export declare function buildFragmentSchema(schema: GraphQLSchema, document: DocumentNode, fragment: FragmentDefinitionNode, scalarTypes: GraphQLStandardSchemaGenerator.Internal.ScalarMapping, options: GraphQLStandardSchemaGenerator.JSONSchemaOptions): OpenAiSupportedJsonSchema;
//# sourceMappingURL=buildFragmentSchema.d.ts.map