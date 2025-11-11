import { standardJSONSchemaRootKey, } from "../standard-schema-spec.js";
import z from "zod";
/**
 * Temporary helper function until `StandardJSONSchemaV1` is fully specified and supported by zod.
 */
export function zodToStandardJSONSchemaV1(schema) {
    return Object.assign({}, schema, {
        [standardJSONSchemaRootKey]: {
            jsonSchema: {
                input: ({ target, ...otherOptions } = {
                    target: "draft-2020-12",
                }) => z.toJSONSchema(schema, {
                    ...otherOptions,
                    target: target,
                    io: "input",
                }),
                output: ({ target, ...otherOptions } = {
                    target: "draft-2020-12",
                }) => z.toJSONSchema(schema, {
                    ...otherOptions,
                    target: target,
                    io: "output",
                }),
            },
        },
    });
}
//# sourceMappingURL=zodToStandardJSONSchemaV1.js.map