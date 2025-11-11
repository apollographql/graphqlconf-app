import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { type DocumentNode, type GraphQLFormattedError, GraphQLScalarType, GraphQLSchema } from "graphql";
import { type StandardJSONSchemaV1 } from "./standard-schema-spec.ts";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { CalculateSerializedType, CombinedSpec, ScalarMapping } from "./types.ts";
import type { OpenAiSupportedJsonSchema } from "./utils/openAiSupportedJsonSchema.ts";
export declare namespace GraphQLStandardSchemaGenerator {
    namespace Internal {
        type ScalarMapping = Record<string, OpenAiSupportedJsonSchema.Anything>;
    }
    interface ScalarDefinition<Serialized, Deserialized> {
        type: GraphQLScalarType<Deserialized, Serialized>;
        jsonSchema: {
            deserialized: OpenAiSupportedJsonSchema.Anything;
            serialized: OpenAiSupportedJsonSchema.Anything;
        };
        /** Will be used as "fake variable value" if this scalar is ever used in a non-nullable variable input value. */
        defaultValue?: any;
    }
    type ScalarDefinitions = Record<string, GraphQLStandardSchemaGenerator.ScalarDefinition<any, any>>;
    type DocumentTransform = (document: DocumentNode) => DocumentNode;
    interface Options<Scalars extends GraphQLStandardSchemaGenerator.ScalarDefinitions = Record<string, never>> {
        schema: GraphQLSchema | DocumentNode;
        scalarTypes?: Scalars;
        defaultJSONSchemaOptions?: JSONSchemaOptions | "OpenAI";
        /**
         * An array of document transforms to apply to each document before generating schemas.
         *
         * This can be used to apply custom transformations to the GraphQL documents,
         * such as adding default fields, removing deprecated fields, etc.
         *
         * Defaults to `[addTypename]` if not provided.
         */
        documentTransfoms?: GraphQLStandardSchemaGenerator.DocumentTransform[];
    }
    type Serialized<TData, Scalars extends GraphQLStandardSchemaGenerator.ScalarDefinitions = Record<string, never>> = CalculateSerializedType<TData, ScalarMapping<Scalars>>;
    type Deserialized<TData, Scalars extends GraphQLStandardSchemaGenerator.ScalarDefinitions = Record<string, never>> = TData;
    type JSONSchemaCreator = (params: StandardJSONSchemaV1.Options & JSONSchemaOptions) => Record<string, unknown>;
    interface JSONSchemaOptions {
        /**
         * If true, nullable properties will be marked as optional in the generated JSON Schema.
         *
         * {@defaultValue true}
         *
         * When `defaultJSONSchemaOptions` is set to "OpenAI", this will be false.
         */
        optionalNullableProperties?: boolean;
        /**
         * If set to either `true` or `false`, this setting will be added to all object types.
         * @defaultValue undefined
         *
         * When `defaultJSONSchemaOptions` is set to "OpenAI", this will be false.
         */
        additionalProperties?: boolean;
    }
    type JSONSchema = OpenAiSupportedJsonSchema;
    interface ValidationSchema<Input, Output = Input> extends CombinedSpec<Input, Output> {
        (value: unknown): StandardSchemaV1.Result<Output>;
    }
    type BidirectionalValidationSchema<Deserialized, Scalars extends GraphQLStandardSchemaGenerator.ScalarDefinitions> = GraphQLStandardSchemaGenerator.ValidationSchema<GraphQLStandardSchemaGenerator.Serialized<Deserialized, Scalars>, GraphQLStandardSchemaGenerator.Serialized<Deserialized, Scalars>> & {
        normalize: GraphQLStandardSchemaGenerator.ValidationSchema<GraphQLStandardSchemaGenerator.Serialized<Deserialized, Scalars>, GraphQLStandardSchemaGenerator.Serialized<Deserialized, Scalars>>;
        deserialize: GraphQLStandardSchemaGenerator.ValidationSchema<GraphQLStandardSchemaGenerator.Serialized<Deserialized, Scalars>, GraphQLStandardSchemaGenerator.Deserialized<Deserialized, Scalars>>;
        serialize: GraphQLStandardSchemaGenerator.ValidationSchema<GraphQLStandardSchemaGenerator.Deserialized<Deserialized, Scalars>, GraphQLStandardSchemaGenerator.Serialized<Deserialized, Scalars>>;
    };
}
export declare class GraphQLStandardSchemaGenerator<Scalars extends GraphQLStandardSchemaGenerator.ScalarDefinitions = Record<string, never>> {
    private schema;
    private scalarTypes;
    private deserializedScalarTypes;
    private serializedScalarTypes;
    private defaultJSONSchemaOptions;
    private documentTransfoms;
    constructor({ schema, scalarTypes, defaultJSONSchemaOptions, documentTransfoms, }: GraphQLStandardSchemaGenerator.Options<Scalars>);
    replaceSchema(schema: GraphQLSchema | DocumentNode): void;
    getDataSchema<TData, TVariables extends Record<string, unknown>>(document: TypedDocumentNode<TData, TVariables>, variables?: TVariables): GraphQLStandardSchemaGenerator.BidirectionalValidationSchema<TData, Scalars>;
    getResponseSchema<TData>(document: TypedDocumentNode<TData>): GraphQLStandardSchemaGenerator.BidirectionalValidationSchema<{
        errors?: ReadonlyArray<GraphQLFormattedError> | null;
        data?: TData | null;
        extensions?: Record<string, unknown> | null;
    }, Scalars>;
    getFragmentSchema<TData, TVariables extends Record<string, unknown>>(document: TypedDocumentNode<TData>, { fragmentName, variables, }?: {
        fragmentName?: string;
        variables?: TVariables;
    }): GraphQLStandardSchemaGenerator.BidirectionalValidationSchema<TData, Scalars>;
    getVariablesSchema<TVariables extends Record<string, unknown>>(document: TypedDocumentNode<any, TVariables>): GraphQLStandardSchemaGenerator.BidirectionalValidationSchema<TVariables, Scalars>;
}
//# sourceMappingURL=GraphQLStandardSchemaGenerator.d.ts.map