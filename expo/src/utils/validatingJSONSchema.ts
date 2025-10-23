import { jsonSchema, JSONSchema7 } from "ai";
import Ajv from "ajv";

const ajv = new Ajv({ allErrors: true });

export function validatingJSONSchema<T = any>(schema: JSONSchema7) {
  return jsonSchema<T>(schema, {
    validate(value: any) {
      ajv.validate(schema, value);
      if (ajv.errors && ajv.errors.length > 0) {
        const errorMessages = ajv.errors
          .map((err) => `${err.dataPath} ${err.message}`)
          .join(", ");
        return { success: false as const, error: new Error(errorMessages) };
      }
      return { success: true as const, value };
    },
  });
}
