import type { GraphQLStandardSchemaGenerator } from "../GraphQLStandardSchemaGenerator.ts";
import type { CombinedSpec } from "../types.ts";
export declare function standardSchema<Input, Output>(validate: GraphQLStandardSchemaGenerator.ValidationSchema<Input, Output>["~standard"]["validate"], input: GraphQLStandardSchemaGenerator.JSONSchemaCreator, output: GraphQLStandardSchemaGenerator.JSONSchemaCreator): CombinedSpec<Input, Output>;
//# sourceMappingURL=standardSchema.d.ts.map