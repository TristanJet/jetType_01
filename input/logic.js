import { createClient } from "redis";
import { endTimer } from "./timer.js";

const redisclient = createClient({
    socket: {
        host: "127.0.0.1",
        port: "6379",
    },
});

redisclient.on("error", (err) => {
    console.log("Redis Connection Error:\n", err);
    process.exit(1);
});

await redisclient.connect();

async function logic(id, input, quoteArray, game) {
    const type = input.data.type;
    if (type === "add") {
        let value = input.data.value;
        let len = await redisclient.rPush(id, value);
        if (Number(len) === quoteArray.length) {
            let inputValue = await redisclient.lRange(id, 0, -1);
            let isCorrect = inputValue.every(
                (val, index) => val === quoteArray[index]
            );
            if (isCorrect) {
                game.gameFin = 1;
                game.endTime = endTimer(game.startTime);
            }
        }
    } else if (type === "del") {
        await redisclient.rPop(id);
    }
}

async function closeHandler(id) {
    await redisclient.del(id);
    console.log(`${id} was deleted from redis.`);
}

export { logic, closeHandler };
