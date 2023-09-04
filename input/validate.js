import Ajv from "ajv";
import schema from './schema_input.json' assert {type: 'json'};

const ajv = new Ajv()

const validate = ajv.compile(schema);

function validateHandler(input) {
    const valid = validate(input)
    if (valid) {
        console.log( 'All good')
        return true
    } else {
        console.log(`Error: ${ajv.errorsText(validate.errors)}`)
        return false
    }
}

export { validateHandler };