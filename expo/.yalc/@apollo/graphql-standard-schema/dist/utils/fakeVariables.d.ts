import { type GraphQLSchema, type VariableDefinitionNode } from "graphql";
import type { GraphQLStandardSchemaGenerator } from "../GraphQLStandardSchemaGenerator.ts";
export declare function fakeVariables(definitions: ReadonlyArray<VariableDefinitionNode>, schema: GraphQLSchema, scalars: GraphQLStandardSchemaGenerator.ScalarDefinitions): {
    [k: string]: unknown;
};
//# sourceMappingURL=fakeVariables.d.ts.map