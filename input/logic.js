import { createClient } from "redis";

const redisclient = createClient({
    socket: {
        host: "127.0.0.1",
        port: "6379",
    },
});

redisclient.on("error", (err) => console.log("Redis Client Error", err));

await redisclient.connect();

async function logic(ws, input, quote) {
    const quoteArray = quote.split("");
    const type = input.data.type;
    if (type === "add") {
        let value = input.data.value;
        let len = await redisclient.rPush(ws.connectionId, value);
        if (Number(len) === quoteArray.length) {
            let inputValue = await redisclient.lRange(ws.connectionId, 0, -1);
            let isCorrect = inputValue.every(
                (val, index) => val === quoteArray[index]
            );
            if (isCorrect) {
                ws.send("--------\nWin!!!\n---------");
            }
        }
        ws.send(`The length of current input is: ${String(len)}`);
    } else if (type === "del") {
        console.log(await redisclient.rPop(ws.connectionId));
    }
}

async function closeHandler(ws) {
    await redisclient.del(ws.connectionId);
    console.log(`${ws.connectionId} was deleted from redis.`);
}

export { logic, closeHandler };
