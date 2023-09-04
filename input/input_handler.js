import { logic } from "./logic.js";
import { validateHandler } from "./validate.js";

function inputHandler(ws, input, quoteArray) {
    if (validateHandler(input)) {
        logic(ws, input, quoteArray);
    } else {
        throw new Error("Client error: input format error");
    }
}

export { inputHandler };
