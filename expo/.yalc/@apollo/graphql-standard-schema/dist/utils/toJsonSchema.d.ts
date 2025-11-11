import type { GraphQLStandardSchemaGenerator } from "../GraphQLStandardSchemaGenerator.ts";
import { type StandardJSONSchemaV1 } from "../standard-schema-spec.ts";
export declare const toJSONSchema: {
    input(standardSchema: StandardJSONSchemaV1<unknown, unknown>, options?: StandardJSONSchemaV1.Options & {
        libraryOptions?: GraphQLStandardSchemaGenerator.JSONSchemaOptions;
    }): Record<string, unknown>;
    output(standardSchema: StandardJSONSchemaV1<unknown, unknown>, options?: StandardJSONSchemaV1.Options & {
        libraryOptions: GraphQLStandardSchemaGenerator.JSONSchemaOptions;
    }): Record<string, unknown>;
};
//# sourceMappingURL=toJsonSchema.d.ts.map