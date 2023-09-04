import { logic } from "./logic.js";
import { validateHandler } from "./validate.js";
import { startTimer } from "./timer.js";

async function inputHandler(ws, input, quoteArray, game) {
    if (validateHandler(input)) {
        if (!game.gameStart) {
            game.gameStart = true;
            game.startTime = startTimer();
        }
        try {
            await logic(ws, input, quoteArray, game);
        } catch (e) {
            console.log(String(e));
            throw new Error("Server error: Logic error");
        }
    }
}

export { inputHandler };
