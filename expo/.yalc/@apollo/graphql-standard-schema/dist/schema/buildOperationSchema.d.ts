import { type DocumentNode, type GraphQLSchema, type OperationDefinitionNode } from "graphql";
import type { GraphQLStandardSchemaGenerator } from "../GraphQLStandardSchemaGenerator.ts";
import type { OpenAiSupportedJsonSchema } from "../utils/openAiSupportedJsonSchema.ts";
export declare function buildOperationSchema(schema: GraphQLSchema, document: DocumentNode, operation: OperationDefinitionNode, scalarTypes: GraphQLStandardSchemaGenerator.Internal.ScalarMapping, options: GraphQLStandardSchemaGenerator.JSONSchemaOptions): OpenAiSupportedJsonSchema;
//# sourceMappingURL=buildOperationSchema.d.ts.map