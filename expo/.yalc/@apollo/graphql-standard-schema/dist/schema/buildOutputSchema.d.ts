import { type DocumentNode, GraphQLObjectType, GraphQLSchema, type SelectionSetNode } from "graphql";
import type { OpenAiSupportedJsonSchema } from "../utils/openAiSupportedJsonSchema.ts";
import type { GraphQLStandardSchemaGenerator } from "../GraphQLStandardSchemaGenerator.ts";
export declare function buildOutputSchema(schema: GraphQLSchema, document: DocumentNode, scalarTypes: Record<string, OpenAiSupportedJsonSchema.Anything> | undefined, parentType: GraphQLObjectType, selections: SelectionSetNode, options: GraphQLStandardSchemaGenerator.JSONSchemaOptions): OpenAiSupportedJsonSchema;
//# sourceMappingURL=buildOutputSchema.d.ts.map