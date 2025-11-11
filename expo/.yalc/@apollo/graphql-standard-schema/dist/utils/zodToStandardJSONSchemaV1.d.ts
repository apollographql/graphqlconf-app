import type { CombinedSpec } from "../types.ts";
import z from "zod";
/**
 * Temporary helper function until `StandardJSONSchemaV1` is fully specified and supported by zod.
 */
export declare function zodToStandardJSONSchemaV1<Schema extends z.Schema>(schema: Schema): CombinedSpec<z.input<Schema>, z.output<Schema>>;
//# sourceMappingURL=zodToStandardJSONSchemaV1.d.ts.map