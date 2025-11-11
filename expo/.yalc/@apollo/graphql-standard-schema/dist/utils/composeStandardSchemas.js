import { standardJSONSchemaRootKey, } from "../standard-schema-spec.js";
import {} from "@standard-schema/spec";
import { assert } from "./assert.js";
export function composeStandardSchemas(
/** The root schema. */
rootSchema, 
/** The path at which the extension schema should be included in the combined schema. */
path, 
/** The extension/child schema. */
extension, 
/** If the child schema should be considered a required prop in the combined schema */
required = true, 
/** If the property at `path` should be hidden from runtime checks when validating the root schema part */
hideAddedFieldFromRootSchema = true) {
    const jsonSchema = (direction) => (params) => {
        const rootJson = rootSchema[standardJSONSchemaRootKey].jsonSchema[direction](params);
        const { $defs, $schema, ...extensionJson } = extension[standardJSONSchemaRootKey].jsonSchema[direction](params);
        let step = rootJson;
        const refPrefix = path.join(".");
        for (let i = 0; i < path.length; i++) {
            const key = path[i];
            assert(step.type === "object");
            /* node:coverage ignore next 3 */
            if (!step.properties) {
                step.properties = {};
            }
            if (!step.properties[key]) {
                step.properties[key] = {
                    type: "object",
                    properties: {},
                    required: [],
                    additionalProperties: false,
                };
                if (required) {
                    step.required = [...(step.required || []), key];
                }
            }
            if (i === path.length - 1) {
                step.properties[key] = JSON.parse(JSON.stringify(extensionJson), (key, value) => {
                    if (key === "$ref" &&
                        typeof value === "string" &&
                        value.startsWith("#/$defs")) {
                        return "#/$defs/" + refPrefix + value.slice("#/$defs".length);
                    }
                    return value;
                });
            }
            step = step.properties[key];
        }
        if ($defs) {
            // note that this might override existing definitions in rootJson.$defs
            // this is okay while using this internally, but once exposed to users, we might
            // need to handle conflicts more gracefully
            rootJson.$defs = { ...rootJson.$defs, [refPrefix]: $defs };
        }
        return rootJson;
    };
    return {
        "~standard": {
            vendor: `${rootSchema["~standard"].vendor}`,
            version: rootSchema["~standard"].version,
            validate(value) {
                if (typeof value !== "object" || value === null) {
                    return rootSchema["~standard"].validate(value);
                }
                function handler(path) {
                    return {
                        ownKeys(target) {
                            if (path.length === 1) {
                                return Reflect.ownKeys(target).filter((key) => key !== path[0]);
                            }
                            return Reflect.ownKeys(target);
                        },
                        has(target, p) {
                            return path[0] === p && path.length === 1
                                ? false
                                : Reflect.has(target, p);
                        },
                        get(target, prop, receiver) {
                            if (prop !== path[0]) {
                                return Reflect.get(target, prop, receiver);
                            }
                            if (path.length === 1) {
                                return undefined;
                            }
                            return new Proxy(Reflect.get(target, prop, receiver), handler(path.slice(1)));
                        },
                    };
                }
                const rootResult = rootSchema["~standard"].validate(hideAddedFieldFromRootSchema ? new Proxy(value, handler(path)) : value);
                const extensionValue = path.reduce((obj, key) => obj[key], value);
                const extensionResult = extensionValue === undefined && !required
                    ? { value: undefined }
                    : extension["~standard"].validate(extensionValue);
                function combineResults(result1, result2) {
                    if (result1.issues || result2.issues) {
                        return {
                            issues: [
                                ...(result1.issues || []),
                                ...(result2.issues || []).map((issue) => {
                                    if (issue.path) {
                                        return {
                                            ...issue,
                                            path: [...path, ...issue.path],
                                        };
                                    } /* node:coverage ignore next */
                                    return issue;
                                }),
                            ],
                        };
                    }
                    return {
                        value: result2.value === undefined && !required
                            ? result1.value
                            : setIn(result1.value, path, result2.value),
                    };
                }
                /* node:coverage ignore next 5 */
                if ("then" in rootResult || "then" in extensionResult) {
                    return Promise.all([rootResult, extensionResult]).then(([r1, r2]) => combineResults(r1, r2));
                }
                return combineResults(rootResult, extensionResult);
            },
        },
        [standardJSONSchemaRootKey]: {
            jsonSchema: {
                input: jsonSchema("input"),
                output: jsonSchema("output"),
            },
        },
    };
}
export function nullable(schema) {
    return {
        "~standard": {
            vendor: schema["~standard"].vendor,
            version: schema["~standard"].version,
            validate(value) {
                if (value === null) {
                    return { value: null };
                }
                return schema["~standard"].validate(value);
            },
        },
        [standardJSONSchemaRootKey]: {
            jsonSchema: {
                input(params) {
                    const { $defs, $schema, ...orig } = schema[standardJSONSchemaRootKey].jsonSchema.input(params);
                    return { $schema, anyOf: [{ type: "null" }, orig], $defs };
                },
                output(params) {
                    const { $defs, $schema, ...orig } = schema[standardJSONSchemaRootKey].jsonSchema.output(params);
                    return { $schema, anyOf: [{ type: "null" }, orig], $defs };
                },
            },
        },
    };
}
function setIn(obj, path, value) {
    if (path.length === 0) {
        return value;
    }
    const [head, ...tail] = path;
    const child = setIn(obj?.[head] || {}, tail, value);
    return {
        ...obj,
        [head]: child,
    };
}
//# sourceMappingURL=composeStandardSchemas.js.map