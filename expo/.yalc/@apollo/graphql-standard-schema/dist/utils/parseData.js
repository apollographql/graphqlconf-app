import { getDirectiveValues, GraphQLEnumType, GraphQLIncludeDirective, GraphQLInputObjectType, GraphQLNonNull, GraphQLScalarType, GraphQLSkipDirective, GraphQLString, isAbstractType, isEnumType, isListType, isNonNullType, isObjectType, isScalarType, } from "graphql";
import { assert } from "./assert.js";
export function parseData(data, operation, schema, document, variableValues, mode, initialPath = []) {
    const initialTypename = operation.operation === "query"
        ? schema.getQueryType()
        : operation.operation === "mutation"
            ? schema.getMutationType()
            : operation.operation === "subscription"
                ? schema.getSubscriptionType()
                : undefined;
    assert(initialTypename, `Schema does not have root type for ${operation.operation} operations`);
    return parseSelectionSet({
        data,
        selections: operation.selectionSet.selections,
        rootType: initialTypename,
        rootPath: initialPath,
        schema,
        document,
        variableValues,
        mode,
    });
}
export function parseFragment(data, fragment, schema, document, variableValues, mode, initialPath = []) {
    try {
        return parseSelectionSet({
            data,
            selections: fragment.selectionSet.selections,
            rootType: getFragmentDataRootObjectType(data, schema),
            variableValues: variableValues,
            schema,
            rootPath: initialPath,
            document,
            mode,
        });
    }
    catch (e) {
        return {
            issues: [
                {
                    message: e.message,
                },
            ],
        };
    }
}
export function getScalarParser(mode) {
    return (value, scalar) => mode === "serialize"
        ? scalar.serialize(value)
        : mode === "deserialize"
            ? scalar.parseValue(value)
            : scalar.serialize(scalar.parseValue(value));
}
function parseSelectionSet({ data, selections, rootType, rootPath, schema, document, variableValues, mode, }) {
    const parseScalar = getScalarParser(mode);
    const fragments = Object.fromEntries(document.definitions
        .filter((def) => def.kind === "FragmentDefinition")
        .map((frag) => [frag.name.value, frag]));
    const issues = [];
    const parsed = handleSelections(data, selections, rootType, rootPath);
    if (issues.length > 0) {
        return { issues };
    }
    return { value: parsed };
    function handleSelections(data, selections, parentType, path) {
        const accumulatedSelections = {};
        const accumulatedData = {};
        const fields = parentType.getFields();
        const visitedFragments = new Set();
        const unhandled = new Set(selections);
        for (const selection of unhandled) {
            if (!shouldIncludeNode(variableValues, selection)) {
                continue;
            }
            if (selection.kind === "FragmentSpread" ||
                selection.kind === "InlineFragment") {
                let fragment;
                if (selection.kind === "FragmentSpread") {
                    const fragmentName = selection.name.value;
                    if (visitedFragments.has(fragmentName)) {
                        continue;
                    }
                    visitedFragments.add(fragmentName);
                    fragment = fragments[fragmentName];
                    assert(fragment, `Fragment "${fragmentName}" not found`);
                }
                else {
                    fragment = selection;
                }
                if (fragment.typeCondition) {
                    const abstractType = schema.getType(fragment.typeCondition.name.value);
                    assert(abstractType, `Type "${fragment.typeCondition.name.value}" not found in schema`);
                    if (isObjectType(abstractType)) {
                        if (abstractType.name !== parentType.name) {
                            continue;
                        }
                    }
                    else if (isAbstractType(abstractType)) {
                        if (!schema.isSubType(abstractType, parentType)) {
                            continue;
                        }
                    }
                    else {
                        assert(false, `Type "${abstractType.name}" is not an object or abstract type`);
                    }
                }
                fragment.selectionSet.selections.forEach((fragmentSelection) => unhandled.add(fragmentSelection));
            }
            if (selection.kind === "Field") {
                let childType = selection.name.value === "__typename"
                    ? typenameType
                    : fields[selection.name.value]?.type;
                const key = selection.alias?.value || selection.name.value;
                accumulatedSelections[key] ??= {
                    schemaType: childType,
                    fieldName: selection.name.value,
                    selections: [],
                };
                if (selection.selectionSet) {
                    accumulatedSelections[key].selections.push(...selection.selectionSet?.selections);
                }
            }
        }
        for (const [key, config] of Object.entries(accumulatedSelections)) {
            try {
                const fieldName = config.fieldName;
                let childType = config.schemaType;
                let fieldData = data[key];
                if (fieldName === "__typename" && isObjectType(parentType)) {
                    fieldData = parentType.name;
                }
                assert(childType, `Field "${fieldName}" not found on type "${parentType.name}"`);
                if (isNonNullType(childType)) {
                    childType = childType.ofType;
                }
                else {
                    if (fieldData == null) {
                        accumulatedData[key] = null;
                        continue;
                    }
                }
                if (isScalarType(childType) || isEnumType(childType)) {
                    accumulatedData[key] = parseScalar(fieldData, childType);
                    continue;
                }
                if (isListType(childType)) {
                    childType = childType.ofType;
                    let nullable = true;
                    if (isNonNullType(childType)) {
                        nullable = false;
                        childType = childType.ofType;
                    }
                    assert(Array.isArray(fieldData), `Expected list for field "${key}"`);
                    accumulatedData[key] = fieldData.map((item, idx) => {
                        try {
                            let itemType = childType;
                            if (item == null) {
                                assert(nullable, `Expected non-nullable type "${itemType.name}" not to be null.`);
                                return null;
                            }
                            if (isScalarType(itemType) || isEnumType(itemType)) {
                                return parseScalar(item, itemType);
                            }
                            if (isAbstractType(itemType)) {
                                itemType = specifyAbstractTypeFromFieldData(item, itemType);
                            }
                            assert(isObjectType(itemType), `Expected ${itemType} to be an object type.`);
                            assert(typeof item === "object", `Expected list item to be ${itemType}, but got ${typeof item} instead.`);
                            return handleSelections(item, config.selections, itemType, path.concat(key, idx));
                        }
                        catch (e) {
                            issues.push({
                                message: e.message,
                                path: path.concat(key, idx),
                            });
                        }
                    });
                    continue;
                }
                if (isAbstractType(childType)) {
                    childType = specifyAbstractTypeFromFieldData(fieldData, childType);
                }
                assert(isObjectType(childType), `expected object type, but got ${childType.name}`);
                assert(typeof fieldData === "object", `Expected type "${childType.name}" to be an object.`);
                assert(fieldData != null, `Expected non-nullable type "${childType.name}" not to be null.`);
                accumulatedData[key] = handleSelections(fieldData, config.selections, childType, path.concat(key));
            }
            catch (e) {
                issues.push({
                    message: e.message,
                    path: path.concat(key),
                });
            }
        }
        return accumulatedData;
    }
    function specifyAbstractTypeFromFieldData(fieldData, childType) {
        const typename = typeof fieldData === "object" &&
            fieldData &&
            "__typename" in fieldData &&
            fieldData["__typename"];
        assert(typename, `Expected object with __typename for abstract type "${childType.name}"`);
        assert(typeof typename === "string", `Expected __typename to be a string, but got ${typeof typename}`);
        const specificType = schema.getType(typename);
        assert(specificType && isObjectType(specificType), `Could not resolve concrete type for abstract type "${childType.name}" - "${typename}" is not an object type.`);
        return specificType;
    }
}
/**
 * Determines if a field should be included based on the `@include` and `@skip`
 * directives, where `@skip` has higher precedence than `@include`.
 */
function shouldIncludeNode(variableValues, node) {
    const skip = getDirectiveValues(GraphQLSkipDirective, node, variableValues);
    if (skip?.if === true) {
        return false;
    }
    const include = getDirectiveValues(GraphQLIncludeDirective, node, variableValues);
    if (include?.if === false) {
        return false;
    }
    return true;
}
function getFragmentDataRootObjectType(data, schema) {
    assert(typeof data === "object" && data !== null, "Expected object");
    const typename = data["__typename"];
    assert(typename, "Expected __typename field in fragment data");
    const fragmentType = schema.getType(typename);
    assert(fragmentType, `Type "${typename}" not found in schema for fragment`);
    assert(isObjectType(fragmentType), `Type "${typename}" is not an object type`);
    return fragmentType;
}
const typenameType = new GraphQLNonNull(GraphQLString);
//# sourceMappingURL=parseData.js.map