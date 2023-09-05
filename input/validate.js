import Ajv from "ajv";
import schema from "./schema_input.json" assert { type: "json" };

const ajv = new Ajv();

const validate = ajv.compile(schema);

export { validate };
