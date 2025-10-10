import { type DocumentNode, type FormattedExecutionResult, GraphQLSchema } from "graphql";
import type { StandardJSONSchemaSourceV1, StandardSchemaV1 } from "./standard-schema-spec.ts";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import type { OpenAiSupportedJsonSchema } from "./openAiSupportedJsonSchema.ts";
export declare namespace GraphQLStandardSchemaGenerator {
    interface Options {
        schema: GraphQLSchema | DocumentNode;
        scalarTypes?: Record<string, OpenAiSupportedJsonSchema.Anything>;
    }
    type JSONSchema = OpenAiSupportedJsonSchema;
    interface ValidationSchema<T> extends StandardSchemaV1.WithJSONSchemaSource<T, T> {
        ["~standard"]: Omit<StandardJSONSchemaSourceV1.PropsWithStandardSchema<T, T>, "toJSONSchema"> & {
            toJSONSchema: (options: StandardJSONSchemaSourceV1.Options) => OpenAiSupportedJsonSchema;
        };
    }
}
export declare class GraphQLStandardSchemaGenerator {
    private schema;
    private scalarTypes?;
    constructor({ schema, scalarTypes }: GraphQLStandardSchemaGenerator.Options);
    replaceSchema(schema: GraphQLSchema | DocumentNode): void;
    getDataSchema<TData>(document: TypedDocumentNode<TData>): GraphQLStandardSchemaGenerator.ValidationSchema<TData>;
    getResponseSchema<TData>(document: TypedDocumentNode<TData>): GraphQLStandardSchemaGenerator.ValidationSchema<FormattedExecutionResult>;
    getFragmentSchema<TData>(document: TypedDocumentNode<TData>, { fragmentName, }?: {
        fragmentName?: string;
    }): GraphQLStandardSchemaGenerator.ValidationSchema<TData>;
    getVariablesSchema<TVariables>(document: TypedDocumentNode<any, TVariables>): GraphQLStandardSchemaGenerator.ValidationSchema<TVariables>;
}
//# sourceMappingURL=index.d.ts.map