import { OperationTypeNode, } from "graphql";
import { buildOutputSchema } from "./buildOutputSchema.js";
export function buildOperationSchema(schema, document, operation, scalarTypes, options) {
    return {
        ...(operation.description
            ? { description: operation.description?.value }
            : {}),
        ...buildOutputSchema(schema, document, scalarTypes, operation.operation === OperationTypeNode.QUERY
            ? schema.getQueryType()
            : operation.operation === OperationTypeNode.SUBSCRIPTION
                ? schema.getSubscriptionType()
                : schema.getMutationType(), operation.selectionSet, options),
        title: `${operation.operation} ${operation.name?.value || "Anonymous"}`,
    };
}
//# sourceMappingURL=buildOperationSchema.js.map