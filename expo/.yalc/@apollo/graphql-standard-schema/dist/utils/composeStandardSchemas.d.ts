import type { CombinedSpec } from "../types.ts";
import { type StandardSchemaV1 } from "@standard-schema/spec";
type Id<T> = {
    [K in keyof T]: T[K];
} & {};
type InsertAt<Root, P extends string[], V, Required extends boolean> = P extends [infer Head extends string] ? Id<Root & (Required extends true ? {
    [K in Head]: V;
} : {
    [K in Head]?: V;
})> : P extends [infer Head extends string, ...infer Tail extends string[]] ? {
    [K in keyof Root | Head]: K extends Head ? InsertAt<K extends keyof Root ? Root[K] : {}, Tail, V, Required> : Root[K & keyof Root];
} : {
    wat: P;
};
export declare function composeStandardSchemas<Root extends CombinedSpec<any, any>, const Path extends string[], Extension extends CombinedSpec<any, any>, Required extends boolean = true>(
/** The root schema. */
rootSchema: Root, 
/** The path at which the extension schema should be included in the combined schema. */
path: Path, 
/** The extension/child schema. */
extension: Extension, 
/** If the child schema should be considered a required prop in the combined schema */
required?: Required, 
/** If the property at `path` should be hidden from runtime checks when validating the root schema part */
hideAddedFieldFromRootSchema?: boolean): CombinedSpec<InsertAt<StandardSchemaV1.InferInput<Root>, Path, StandardSchemaV1.InferInput<Extension>, Required>, InsertAt<StandardSchemaV1.InferOutput<Root>, Path, StandardSchemaV1.InferOutput<Extension>, Required>>;
export declare function nullable<Input, Output>(schema: CombinedSpec<Input, Output>): CombinedSpec<Input | null, Output | null>;
export {};
//# sourceMappingURL=composeStandardSchemas.d.ts.map