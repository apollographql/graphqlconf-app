import { standardJSONSchemaRootKey, } from "../standard-schema-spec.js";
export const toJSONSchema = {
    input(standardSchema, options) {
        return standardSchema[standardJSONSchemaRootKey].jsonSchema.input(options || { target: "draft-2020-12" });
    },
    output(standardSchema, options) {
        return standardSchema[standardJSONSchemaRootKey].jsonSchema.output(options || { target: "draft-2020-12" });
    },
};
//# sourceMappingURL=toJsonSchema.js.map