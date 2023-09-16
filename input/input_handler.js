import { startTimer, endTimer } from "./timer.js";

async function inputHandler(game, input, quoteArray) {

    if (!game.start) {
        game.timeStart = startTimer();
        game.start = true;
    }

    const type = input.data.type;
    if (type === "add") {
        const value = input.data.value;
        const len = game.inputState.push(value);
        if (len === quoteArray.length) {
            const isCorrect = game.inputState.every(
                (val, index) => val === quoteArray[index]
            );
            if (isCorrect) {
                game.fin = true
                game.timeFinal = endTimer(game.timeStart)
                console.log(game.timeFinal)
            }
        }
    } else if (type === "del") {

        game.inputState.pop();
    }
}

export { inputHandler };
