import type { GraphQLSchema, OperationDefinitionNode } from "graphql";
import type { GraphQLStandardSchemaGenerator } from "../GraphQLStandardSchemaGenerator.ts";
import type { OpenAiSupportedJsonSchema } from "../utils/openAiSupportedJsonSchema.ts";
export declare function buildVariablesSchema(schema: GraphQLSchema, operation: OperationDefinitionNode, scalarTypes: GraphQLStandardSchemaGenerator.Internal.ScalarMapping, options: GraphQLStandardSchemaGenerator.JSONSchemaOptions): OpenAiSupportedJsonSchema;
//# sourceMappingURL=buildVariablesSchema.d.ts.map