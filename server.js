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

    ws.on("error", console.error);
    console.log(`Websocket server online: object = ${Object.keys(ws)}`);

    ws.on("message", (data) => {
        console.log(`Received message ${data} from user ${client}`);
        try {
            inputHandler(ws, JSON.parse(data), quoteArray);
        } catch (e) {
            ws.send(String(e));
            ws.close();
        }
    });

    ws.on("close", () => {
        console.log(client);
        closeHandler(ws, client);
    });
});

server.listen(8080);
