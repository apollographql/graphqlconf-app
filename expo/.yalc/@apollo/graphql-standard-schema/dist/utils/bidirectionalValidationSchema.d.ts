import type { GraphQLStandardSchemaGenerator } from "../GraphQLStandardSchemaGenerator.ts";
import type { StandardSchemaV1 } from "@standard-schema/spec";
export declare function bidirectionalValidationSchema<Deserialized, Scalars extends GraphQLStandardSchemaGenerator.ScalarDefinitions = Record<string, never>>({ normalize, deserialize, serialize, buildSchema, }: {
    normalize: (value: unknown) => StandardSchemaV1.Result<GraphQLStandardSchemaGenerator.Serialized<Deserialized, Scalars>>;
    deserialize: (value: unknown) => StandardSchemaV1.Result<Deserialized>;
    serialize: (value: unknown) => StandardSchemaV1.Result<GraphQLStandardSchemaGenerator.Serialized<Deserialized, Scalars>>;
    buildSchema: (direction: "serialized" | "deserialized") => GraphQLStandardSchemaGenerator.JSONSchemaCreator;
}): GraphQLStandardSchemaGenerator.BidirectionalValidationSchema<Deserialized, Scalars>;
//# sourceMappingURL=bidirectionalValidationSchema.d.ts.map