import { GraphQLStandardSchemaGenerator } from "../GraphQLStandardSchemaGenerator.js";
import { standardSchema } from "./standardSchema.js";
export function validationSchema(validate, inputSchema, outputSchema) {
    const wrapper = {
        [validate.name](arg) {
            return validate(arg);
        },
    }[validate.name];
    return Object.assign(wrapper, standardSchema(wrapper, inputSchema, outputSchema));
}
//# sourceMappingURL=validationSchema.js.map