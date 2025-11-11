import { getOperationAST, } from "graphql";
import { assert } from "./assert.js";
export function getOperation(document) {
    const operation = getOperationAST(document);
    assert(operation, "Provided document does not contain a unique operation definition");
    return operation;
}
//# sourceMappingURL=getOperation.js.map