export function schemaBase(params = { target: "draft-2020-12" }) {
    const schema = {};
    if (params?.target === "draft-2020-12" || params?.target === undefined) {
        schema.$schema = "https://json-schema.org/draft/2020-12/schema";
    }
    else if (params?.target === "draft-07") {
        schema.$schema = "http://json-schema.org/draft-07/schema#";
    }
    else {
        throw new Error("Only draft-07 and draft-2020-12 are supported");
    }
    return schema;
}
//# sourceMappingURL=schemaBase.js.map