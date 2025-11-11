import { type GraphQLSchema, type OperationDefinitionNode } from "graphql";
import type { GraphQLStandardSchemaGenerator } from "../GraphQLStandardSchemaGenerator.ts";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { type SchemaResult } from "./parseData.ts";
export declare function parseVariables<TVariables extends Record<string, unknown>, Scalars extends GraphQLStandardSchemaGenerator.ScalarDefinitions, Mode extends "normalize" | "deserialize" | "serialize">(data: unknown, operation: OperationDefinitionNode, schema: GraphQLSchema, mode: Mode): StandardSchemaV1.Result<SchemaResult<TVariables, Scalars, Mode>>;
//# sourceMappingURL=parseVariables.d.ts.map