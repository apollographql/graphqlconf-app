import { standardJSONSchemaRootKey } from "../standard-schema-spec.js";
export function standardSchema(validate, input, output) {
    return {
        "~standard": {
            validate,
            vendor: "@apollo/graphql-standard-schema",
            version: 1,
        },
        [standardJSONSchemaRootKey]: {
            jsonSchema: {
                input,
                output,
            },
        },
    };
}
//# sourceMappingURL=standardSchema.js.map