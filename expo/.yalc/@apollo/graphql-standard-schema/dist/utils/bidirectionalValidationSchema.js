import { validationSchema } from "./validationSchema.js";
export function bidirectionalValidationSchema({ normalize, deserialize, serialize, buildSchema, }) {
    const base = validationSchema(normalize, buildSchema("serialized"), buildSchema("serialized"));
    return Object.assign(base, {
        normalize: base,
        deserialize: validationSchema(deserialize, buildSchema("serialized"), buildSchema("deserialized")),
        serialize: validationSchema(serialize, buildSchema("deserialized"), buildSchema("serialized")),
    });
}
//# sourceMappingURL=bidirectionalValidationSchema.js.map