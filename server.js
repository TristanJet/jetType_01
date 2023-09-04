import { createServer } from "node:http";
import { parse } from "node:url";
import { decode as qsdecode } from "node:querystring";
import { WebSocketServer } from "ws";
import { nanoid } from "nanoid/non-secure";

import { inputHandler } from "./input/input_handler.js";
import { closeHandler } from "./input/logic.js";

function onSocketError(err) {
    console.error(err);
}

function authenticate(request, callback) {
    const queryString = parse(request.url, true).search.substring(1);
    const decode = qsdecode(queryString);

    if (decode.client === "tjizzle") {
        return callback(null, decode.client);
    } else {
        return callback(new Error("Unauthorized"));
    }
}

const quote = "Test.";
const quoteArray = quote.split("");
const server = createServer();
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
    socket.on("error", onSocketError);

    authenticate(request, (err, client) => {
        if (err || !client) {
            socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
            socket.destroy();
            return;
        }

        socket.removeListener("error", onSocketError);

        wss.handleUpgrade(request, socket, head, (ws) => {
            const connectionId = nanoid(10);
            ws.connectionId = connectionId;
            wss.emit("connection", ws, request, client);
        });
    });
});

wss.on("connection", (ws, request, client) => {
    //Scope is unique to each connection
    const game = {
        gameStart: false,
        gameFin: 0,
        startTime: 0,
        endTime: 0,
    };

    ws.on("error", console.error);
    console.log(`Websocket server online: id = ${ws.connectionId}`);

    ws.on("message", async (data) => {
        console.log(`Received message ${data} from user ${client}`);
        try {
            await inputHandler(ws, JSON.parse(data), quoteArray, game);
            /*
            if (game.gameFin) 
                //finish game
            */
        } catch (e) {
            //error is triggered here
            ws.send(String(e));
            ws.close();
        }
    });

    ws.on("close", () => {
        console.log(`${ws.connectionId} : is being disconnected`);
        closeHandler(ws, client);
    });
});

server.listen(8080);
