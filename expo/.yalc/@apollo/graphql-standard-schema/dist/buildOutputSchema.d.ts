import { type DocumentNode, GraphQLObjectType, GraphQLSchema, type SelectionSetNode } from "graphql";
import type { OpenAiSupportedJsonSchema } from "./openAiSupportedJsonSchema.ts";
export declare function buildOutputSchema(schema: GraphQLSchema, document: DocumentNode, scalarTypes: Record<string, OpenAiSupportedJsonSchema.Anything> | undefined, parentType: GraphQLObjectType, selections: SelectionSetNode): OpenAiSupportedJsonSchema;
//# sourceMappingURL=buildOutputSchema.d.ts.map