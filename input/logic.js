import { createClient } from "redis";

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

async function logic(id, input, quoteArray) {
    const type = input.data.type;
    if (type === "add") {
        const value = input.data.value;
        const len = await redisclient.rPush(id, value);
        if (Number(len) === quoteArray.length) {
            const inputValue = await redisclient.lRange(id, 0, -1);
            const isCorrect = inputValue.every(
                (val, index) => val === quoteArray[index]
            );
            if (isCorrect) {
                return 1;
            }
        }
        return 0;
    } else if (type === "del") {
        await redisclient.rPop(id);
        return 0;
    }
}

async function delClient(id) {
    await redisclient.del(id);
    console.log(`${id} was deleted from redis.`);
}

export { logic, delClient };
