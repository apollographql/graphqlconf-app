import { GraphQLStandardSchemaGenerator } from "../GraphQLStandardSchemaGenerator.ts";
import type { StandardSchemaV1 } from "@standard-schema/spec";
export declare function validationSchema<Input, Output = Input>(validate: (value: unknown) => StandardSchemaV1.Result<Output>, inputSchema: GraphQLStandardSchemaGenerator.JSONSchemaCreator, outputSchema: GraphQLStandardSchemaGenerator.JSONSchemaCreator): GraphQLStandardSchemaGenerator.ValidationSchema<Input, Output>;
//# sourceMappingURL=validationSchema.d.ts.map