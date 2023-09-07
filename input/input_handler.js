import { logic } from "./logic.js";
import { validateHandler } from "./validate.js";

async function inputHandler(id, input, quoteArray) {
    let data;

    try {
        data = validateHandler(input);
    } catch (e) {
        return {
            statusCode: 400,
            err: e,
        };
    }

    try {
        const gameFin = await logic(id, data, quoteArray);
        return {
            statusCode: 200,
            gameFin: gameFin,
        };
    } catch (e) {
        return {
            statusCode: 500,
            err: e,
        };
    }
}

export { inputHandler };
