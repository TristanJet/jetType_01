import { createServer } from "node:http";
import { parse } from "node:url";
import { decode as qsdecode } from "node:querystring";
import { WebSocketServer } from "ws";
import { nanoid } from "nanoid/non-secure";

import { inputHandler } from "./input/input_handler.js";
import { validateHandler } from "./input/validate.js";

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

const server = createServer();
const IP = '';
const PORT = process.env.PORT || 3000
const wss = new WebSocketServer({ noServer: true });

const quote = "Test.";
const quoteArray = quote.split("");

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
    //Server is concerned with: sending data, logging errors, and updating scope, logic is in another function.

    const game = {
        start: false,
        fin: false,
        timeStart: 0,
        timeFinal: 0,
        inputState: Array(),
    };

    ws.on("error", console.error);
    console.log(`Websocket server online: id = ${ws.connectionId}`);

    ws.on("message", async (input) => {
        console.log(`Received message ${input} from user ${client}`);

        let inputParse;

        try {
            inputParse = validateHandler(input);
        } catch (e) {
            console.log(`Input error: ${result.err}`);
            ws.send("Input error");
            ws.close();
        }

        inputHandler(game, inputParse, quoteArray);
        
        if (game.fin) {
            ws.send("--------\nWin!!!\n--------");
            ws.send(`You typed the quote in: ${game.timeFinal}`);
            game.start = false;
            game.fin = false;
            game.inputState = Array();
        }
        
    });

    ws.on("close", () => {
        console.log(`${ws.connectionId} : is being disconnected`);
    });
});

server.listen(PORT, IP);
