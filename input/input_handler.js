import { logic } from "./logic.js";
import { validateHandler } from "./validate.js";
import { startTimer, endTimer } from "./timer.js";

async function inputHandler(id, input, quoteArray, game) {
    let data;

    try {
        data = validateHandler(input);
    } catch (e) {
        return {
            statusCode: 400,
            err: e,
        };
    }

    if (!game.gameStart) {
        game.gameStart = true;
        game.startTime = startTimer();
    }

    try {
        game.gameFin = await logic(id, data, quoteArray);
        if (game.gameFin) {
            game.endTime = endTimer(game.startTime);
        }
        return {
            statusCode: 200,
        };
    } catch (e) {
        return {
            statusCode: 500,
            err: e,
        };
    }
}

export { inputHandler };
