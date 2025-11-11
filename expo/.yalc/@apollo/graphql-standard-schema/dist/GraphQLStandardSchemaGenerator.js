import { MapperKind, mapSchema } from "@graphql-tools/utils";
import { buildASTSchema, GraphQLScalarType, GraphQLSchema, } from "graphql";
import { buildFragmentSchema } from "./schema/buildFragmentSchema.js";
import { buildOperationSchema } from "./schema/buildOperationSchema.js";
import { buildVariablesSchema } from "./schema/buildVariablesSchema.js";
import { responseShapeSchema } from "./schema/responseShapeSchema.js";
import { schemaBase } from "./schema/schemaBase.js";
import { standardJSONSchemaRootKey, } from "./standard-schema-spec.js";
import { addTypename } from "./transforms/addTypename.js";
import { assert } from "./utils/assert.js";
import { bidirectionalValidationSchema } from "./utils/bidirectionalValidationSchema.js";
import { composeStandardSchemas, nullable, } from "./utils/composeStandardSchemas.js";
import { fakeVariables } from "./utils/fakeVariables.js";
import { getOperation } from "./utils/getOperation.js";
import { parseData as parseDataSelection, parseFragment, } from "./utils/parseData.js";
import { validationSchema } from "./utils/validationSchema.js";
import { parseVariables } from "./utils/parseVariables.js";
export class GraphQLStandardSchemaGenerator {
    schema;
    scalarTypes;
    deserializedScalarTypes;
    serializedScalarTypes;
    defaultJSONSchemaOptions;
    documentTransfoms;
    constructor({ schema, scalarTypes = {}, defaultJSONSchemaOptions, documentTransfoms = [addTypename], }) {
        this.scalarTypes = scalarTypes;
        this.replaceSchema(schema);
        this.deserializedScalarTypes = Object.fromEntries(Object.entries(scalarTypes).map(([key, def]) => [
            key,
            def.jsonSchema.deserialized,
        ]));
        this.serializedScalarTypes = Object.fromEntries(Object.entries(scalarTypes).map(([key, def]) => [
            key,
            def.jsonSchema.serialized,
        ]));
        this.documentTransfoms = documentTransfoms;
        this.defaultJSONSchemaOptions =
            defaultJSONSchemaOptions === "OpenAI"
                ? {
                    additionalProperties: false,
                    optionalNullableProperties: false,
                }
                : {
                    optionalNullableProperties: true,
                    ...defaultJSONSchemaOptions,
                };
    }
    replaceSchema(schema) {
        assert("getTypeMap" in schema || "kind" in schema, "Schema needs to be of type GraphQLSchema or DocumentNode");
        const schemaInstance = "getTypeMap" in schema ? schema : buildASTSchema(schema);
        // override pre-existing scalar types with scalars passed in via the `scalarTypes` option
        this.schema = mapSchema(schemaInstance, {
            [MapperKind.SCALAR_TYPE]: (type) => {
                return this.scalarTypes[type.name]?.type ?? type;
            },
        });
    }
    getDataSchema(document, variables) {
        const schema = this.schema;
        const scalarTypes = this.scalarTypes;
        document = this.documentTransfoms.reduce((doc, transform) => transform(doc), document);
        const operation = getOperation(document);
        const variableValues = variables ||
            fakeVariables(operation.variableDefinitions || [], schema, scalarTypes);
        const buildSchema = (direction) => (options) => {
            return {
                ...schemaBase(options),
                ...buildOperationSchema(schema, document, operation, this[`${direction}ScalarTypes`], { ...this.defaultJSONSchemaOptions, ...options }),
            };
        };
        return bidirectionalValidationSchema({
            normalize: (data) => parseDataSelection(data, operation, schema, document, variableValues, "normalize"),
            deserialize: (data) => parseDataSelection(data, operation, schema, document, variableValues, "deserialize"),
            serialize: (data) => parseDataSelection(data, operation, schema, document, variableValues, "serialize"),
            buildSchema,
        });
    }
    getResponseSchema(document) {
        const dataSchema = this.getDataSchema(document);
        const rootSchema = responseShapeSchema(getOperation(document));
        const composedNormalize = composeStandardSchemas(rootSchema, ["data"], nullable(dataSchema.normalize), false, false);
        const composedDeserialize = composeStandardSchemas(rootSchema, ["data"], nullable(dataSchema.deserialize), false, false);
        const composedSerialize = composeStandardSchemas(rootSchema, ["data"], nullable(dataSchema.serialize), false, false);
        function forceSync(fn) {
            return (...args) => {
                const result = fn(...args);
                assert(!("then" in result), "Async validation not supported here");
                return result;
            };
        }
        const normalize = forceSync(composedNormalize["~standard"].validate);
        const deserialize = forceSync(composedDeserialize["~standard"].validate);
        const serialize = forceSync(composedSerialize["~standard"].validate);
        return bidirectionalValidationSchema({
            // computation doesn't work out as `Scalars` is not known inside this function
            normalize: normalize,
            deserialize,
            // computation doesn't work out as `Scalars` is not known inside this function
            serialize: serialize,
            buildSchema: (direction) => direction === "serialized"
                ? composedSerialize[standardJSONSchemaRootKey].jsonSchema.output
                : composedSerialize[standardJSONSchemaRootKey].jsonSchema.input,
        });
    }
    getFragmentSchema(document, { fragmentName, variables, } = {}) {
        if (!document.definitions.every((def) => def.kind === "FragmentDefinition")) {
            throw new Error("Document must only contain fragment definitions");
        }
        document = this.documentTransfoms.reduce((doc, transform) => transform(doc), document);
        const fragments = document.definitions;
        assert(fragments.length !== 0, "No fragments found in document");
        assert(fragments.length == 1 || fragmentName, "Multiple fragments found, please specify a fragmentName");
        const fragment = fragments.find((def) => fragmentName ? def.name.value === fragmentName : true);
        assert(fragment, `Fragment with name ${fragmentName} not found in document`);
        const schema = this.schema;
        const variableValues = variables ||
            // TODO: also find all stray referenced variables throughout the document and try to infer their types
            fakeVariables(fragment.variableDefinitions || [], schema, this.scalarTypes);
        const buildSchema = (direction) => (options) => {
            return {
                ...schemaBase(options),
                ...buildFragmentSchema(schema, document, fragment, this[`${direction}ScalarTypes`], { ...this.defaultJSONSchemaOptions, ...options }),
            };
        };
        return bidirectionalValidationSchema({
            normalize: (value) => parseFragment(value, fragment, schema, document, variableValues, "normalize"),
            deserialize: (value) => parseFragment(value, fragment, schema, document, variableValues, "deserialize"),
            serialize: (value) => parseFragment(value, fragment, schema, document, variableValues, "serialize"),
            buildSchema,
        });
    }
    getVariablesSchema(document) {
        const schema = this.schema;
        document = this.documentTransfoms.reduce((doc, transform) => transform(doc), document);
        const operation = getOperation(document);
        const buildSchema = (direction) => (options) => {
            return {
                ...schemaBase(options),
                ...buildVariablesSchema(schema, operation, this[`${direction}ScalarTypes`], { ...this.defaultJSONSchemaOptions, ...options }),
            };
        };
        return bidirectionalValidationSchema({
            normalize: (variables) => parseVariables(variables, operation, schema, "normalize"),
            deserialize: (variables) => parseVariables(variables, operation, schema, "deserialize"),
            serialize: (variables) => parseVariables(variables, operation, schema, "serialize"),
            buildSchema,
        });
    }
}
//# sourceMappingURL=GraphQLStandardSchemaGenerator.js.map