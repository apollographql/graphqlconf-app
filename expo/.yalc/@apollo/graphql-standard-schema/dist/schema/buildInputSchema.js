import { GraphQLNonNull, isNonNullType, isDefinitionNode, Kind, isListType, isSpecifiedScalarType, GraphQLString, GraphQLInt, GraphQLFloat, GraphQLBoolean, isScalarType, isEnumType, GraphQLInputObjectType, } from "graphql";
export function buildInputSchema(schema, operation, scalarTypes, options) {
    const objectTypeSpread = options.additionalProperties !== undefined
        ? { additionalProperties: options.additionalProperties }
        : {};
    const variableDefs = operation.variableDefinitions || [];
    const defs = {};
    const required = [];
    const properties = Object.fromEntries(variableDefs.map((varDef) => {
        const name = varDef.variable.name.value;
        return [name, handleTypeNode(varDef.type, true)];
        function handleTypeNode(typeNode, nullable) {
            switch (typeNode.kind) {
                case Kind.NAMED_TYPE:
                    const type = schema.getType(typeNode.name.value);
                    if (!options.optionalNullableProperties || !nullable) {
                        required.push(name);
                    }
                    return handleMaybe(nullable ? type : new GraphQLNonNull(type));
                case Kind.LIST_TYPE:
                    return {
                        type: nullable ? ["null", "array"] : "array",
                        items: handleTypeNode(typeNode.type, true),
                    };
                case Kind.NON_NULL_TYPE:
                    return handleTypeNode(typeNode.type, false);
            }
        }
    }));
    return {
        type: "object",
        ...objectTypeSpread,
        properties,
        required,
        $defs: defs,
    };
    function handleMaybe(parentType) {
        if (isNonNullType(parentType)) {
            const itemType = parentType.ofType;
            /* node:coverage ignore next 4 */
            if (isNonNullType(itemType)) {
                // nested non-null should be impossible, but this makes TypeScript happy and is safer on top
                return handleMaybe(itemType);
            }
            return handle(itemType, false);
        }
        else {
            return handle(parentType, true);
        }
    }
    function handle(parentType, nullable) {
        function maybe(schema) {
            if (!nullable)
                return schema;
            if ("type" in schema) {
                if (Array.isArray(schema.type)) {
                    /* node:coverage ignore next 6 */ // cannot be reached in current code
                    if (!schema.type.includes("null")) {
                        return {
                            ...schema,
                            type: [...schema.type, "null"],
                        };
                    }
                }
                else if (schema.type !== "null") {
                    return {
                        ...schema,
                        type: [schema.type, "null"],
                    };
                } /* node:coverage ignore next 1 */
                return schema;
            }
            else if ("$ref" in schema) {
                return {
                    anyOf: [schema, { type: "null" }],
                };
            } /* node:coverage ignore next 2 */
            else {
                throw new Error("unhandled maybe case in " + JSON.stringify(schema));
            }
        }
        if (isListType(parentType)) {
            return maybe({
                type: "array",
                items: handleMaybe(parentType.ofType),
            });
        }
        if (isSpecifiedScalarType(parentType)) {
            switch (parentType.name) {
                case GraphQLString.name:
                    return maybe({ type: "string" });
                case GraphQLInt.name:
                    return maybe({ type: "integer" });
                case GraphQLFloat.name:
                    return maybe({ type: "number" });
                case GraphQLBoolean.name:
                    return maybe({ type: "boolean" });
                case "ID":
                    return maybe({ type: "string" });
            }
        }
        if (isScalarType(parentType)) {
            const scalarType = scalarTypes?.[parentType.name];
            /* node:coverage ignore next 5 */
            if (!scalarType) {
                throw new Error(`Scalar type ${parentType.name} not found in \`scalarTypes\`, but \`scalarTypes\` option was provided.`);
            }
            defs.scalar ??= {};
            defs.scalar[parentType.name] = scalarType;
            return maybe({ $ref: `#/$defs/scalar/${parentType.name}` });
        }
        if (isEnumType(parentType)) {
            const refName = `${parentType.name}`;
            const base = nullable ? [null] : [];
            const enumDefs = (defs.enum ??=
                {});
            enumDefs[refName] ??= {
                title: `${parentType.name}`,
                ...(parentType.description
                    ? { description: parentType.description }
                    : {}),
                enum: base.concat(parentType.getValues().map((v) => v.name)),
            };
            return maybe({ $ref: `#/$defs/enum/${refName}` });
        }
        return maybe(handleInputType(parentType));
    }
    function handleInputType(parentType) {
        const fields = parentType.getFields();
        defs.input ??= {};
        const name = parentType.name;
        if (!defs.input[name]) {
            const properties = {};
            defs.input[name] = {
                type: "object",
                ...objectTypeSpread,
                title: parentType.name,
                ...(parentType.description
                    ? { description: parentType.description }
                    : {}),
                properties: {},
                required: [],
            };
            for (const fieldName of Object.keys(fields)) {
                const field = fields[fieldName];
                defs.input[name].properties[fieldName] = handleMaybe(field.type);
                if (!options.optionalNullableProperties || isNonNullType(field.type)) {
                    defs.input[name].required.push(fieldName);
                }
            }
        }
        return { $ref: `#/$defs/input/${name}` };
    }
}
//# sourceMappingURL=buildInputSchema.js.map