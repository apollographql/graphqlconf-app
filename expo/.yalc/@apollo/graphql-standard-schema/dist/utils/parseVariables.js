import { GraphQLInputObjectType, isEnumType, isListType, isNonNullType, isScalarType, Kind, } from "graphql";
import { getScalarParser } from "./parseData.js";
import { assert } from "./assert.js";
export function parseVariables(data, operation, schema, mode) {
    if (typeof data !== "object" || data === null) {
        return {
            issues: [
                {
                    message: `Expected variables to be an object, got ${typeof data}`,
                },
            ],
        };
    }
    const parser = getScalarParser(mode);
    const variableDefs = operation.variableDefinitions || [];
    const issues = [];
    const value = Object.fromEntries(variableDefs.map((varDef) => {
        const name = varDef.variable.name.value;
        return [
            name,
            handleTypeNode(varDef.type, data[name], name, [name]),
        ];
    }));
    if (issues.length > 0) {
        return { issues };
    }
    return { value };
    function handleTypeNode(typeNode, variableValue, variableName, path) {
        try {
            switch (typeNode.kind) {
                case Kind.NAMED_TYPE:
                    if (variableValue == null) {
                        return variableValue;
                    }
                    const type = schema.getType(typeNode.name.value);
                    if (isScalarType(type) || isEnumType(type)) {
                        return parser(variableValue, type);
                    }
                    assert(!isListType(type), `Expected ${type} to not be a list type.`);
                    assert(!isNonNullType(type), `Expected ${type} to not be non-null.`);
                    return parseInputObject({
                        data: variableValue,
                        type,
                        path,
                        parser,
                        issues,
                    });
                case Kind.LIST_TYPE:
                    if (variableValue == null) {
                        return variableValue;
                    }
                    assert(Array.isArray(variableValue), `Expected value to be an array.`);
                    return variableValue.map((item, idx) => handleTypeNode(typeNode.type, item, variableName, [...path, idx]));
                case Kind.NON_NULL_TYPE:
                    assert(variableValue != null, `Expected value to be non-null.`);
                    return handleTypeNode(typeNode.type, variableValue, variableName, path);
            }
        }
        catch (e) {
            issues.push({
                message: e.message,
                path,
            });
            return undefined;
        }
    }
}
function parseInputObject({ data, type, path, parser, issues, }) {
    return handleData(data, type, path);
    function handleData(fieldValue, fieldType, path) {
        try {
            if (isNonNullType(fieldType)) {
                assert(fieldValue != null, `Expected value to be non-null.`);
                fieldType = fieldType.ofType;
            }
            if (fieldValue == null) {
                return fieldValue;
            }
            if (isListType(fieldType)) {
                const listType = fieldType.ofType;
                assert(Array.isArray(fieldValue), `Expected value to be an array.`);
                return fieldValue.map((item, idx) => {
                    return handleData(item, listType, [...path, idx]);
                });
            }
            if (isScalarType(fieldType) || isEnumType(fieldType)) {
                return parser(fieldValue, fieldType);
            }
            if (!(typeof fieldValue === "object" && !Array.isArray(fieldValue))) {
                console.log({ fieldValue, fieldType, path });
            }
            assert(typeof fieldValue === "object" && !Array.isArray(fieldValue), `Expected input object to be an object.`);
            const result = {};
            const fields = type.getFields();
            for (const [fieldName, field] of Object.entries(fields)) {
                const value = handleData(fieldValue[fieldName], field.type, [...path, fieldName]);
                if (value !== undefined) {
                    result[fieldName] = value;
                }
                continue;
            }
            return result;
        }
        catch (e) {
            issues.push({
                message: e.message,
                path,
            });
        }
    }
}
//# sourceMappingURL=parseVariables.js.map