import { createServer } from "node:http";
import { parse } from "node:url";
import { decode as qsdecode } from "node:querystring";
import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import { inputHandler, closeHandler } from "./onInput.js";

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
            const connectionId = uuidv4();
            ws.connectionId = connectionId;
            wss.emit("connection", ws, request, client);
        });
    });
});

wss.on("connection", (ws, request, client) => {
    ws.on("error", console.error);
    console.log(`Websocket server online: connectionId = ${ws.connectionId}`);

    ws.on("message", (data) => {
        console.log(`Received message ${data} from user ${client}`);
        inputHandler(ws, quote, data);
    });

    ws.on("close", () => {
        console.log(client);
        closeHandler(ws, client);
    });
});

server.listen(8080);
