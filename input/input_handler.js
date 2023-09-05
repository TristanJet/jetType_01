import { logic } from "./logic.js";
import { validate } from "./validate.js";
import { startTimer } from "./timer.js";

async function inputHandler(id, input, quoteArray, game) {
    let data;
    try {
        data = JSON.parse(input);
        const valid = validate(data);
        if (!valid) {
            throw new Error(`${ajv.errorsText(validate.errors)}`);
        }
    } catch (e) {
        throw new Error(`Client error, invalid JSON: ${e}`);
    }

    if (!game.gameStart) {
        game.gameStart = true;
        game.startTime = startTimer();
    }

    try {
        await logic(id, data, quoteArray, game);
    } catch (e) {
        console.log(String(e));
        throw new Error("Server error: Logic error");
    }
}

export { inputHandler };
