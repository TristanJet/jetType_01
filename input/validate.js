import Ajv from "ajv";
import schema from "./schema_input.json" assert { type: "json" };

const ajv = new Ajv();

const validate = ajv.compile(schema);

function validateHandler(rawInput) {
    const data = JSON.parse(rawInput);
    const valid = validate(data);
    if (!valid) {
        throw new Error(`${ajv.errorsText(validate.errors)}`);
    } else {
        return data;
    }
}

export { validateHandler };
