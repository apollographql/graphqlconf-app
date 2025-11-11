import { type GraphQLSchema, type OperationDefinitionNode } from "graphql";
import type { OpenAiSupportedJsonSchema } from "../utils/openAiSupportedJsonSchema.ts";
import type { GraphQLStandardSchemaGenerator } from "../GraphQLStandardSchemaGenerator.ts";
export declare function buildInputSchema(schema: GraphQLSchema, operation: OperationDefinitionNode, scalarTypes: Record<string, OpenAiSupportedJsonSchema.Anything> | undefined, options: GraphQLStandardSchemaGenerator.JSONSchemaOptions): OpenAiSupportedJsonSchema;
//# sourceMappingURL=buildInputSchema.d.ts.map