import { logic } from "./logic.js";
import { validateHandler } from "./validate.js";

function inputHandler (ws, input, quote) {
    if (validateHandler(input)) {
        logic(ws, input, quote)
    } else {
        throw new Error('Client error: input format error');
    }

}

export { inputHandler }