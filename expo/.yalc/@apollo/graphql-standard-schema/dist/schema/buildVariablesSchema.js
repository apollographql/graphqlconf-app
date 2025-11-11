import { buildInputSchema } from "./buildInputSchema.js";
export function buildVariablesSchema(schema, operation, scalarTypes, options) {
    return {
        ...(operation.description
            ? { description: operation.description?.value }
            : {}),
        ...buildInputSchema(schema, operation, scalarTypes, options),
        title: `Variables for ${operation.operation} ${operation.name?.value || "Anonymous"}`,
    };
}
//# sourceMappingURL=buildVariablesSchema.js.map