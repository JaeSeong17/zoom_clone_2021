import http from "http";
import WebSocket from "ws";
import express from "express";
import { parse } from "path";
 
const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log('Listening on http://localhost:3000');

const server = http.createServer(app);

// 같은 서버에서 http 와 wss를 모두 다루고 싶을때 이렇게 선언한다.
// wss만 사용하고 싶다면 http server를 인자로 전달하지 않으면 됨.
const wss = new WebSocket.Server({ server });

const sockets = [];

wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "Anon";
    console.log("Conneted to Browser!");
    socket.on("close", () => console.log("Disconneted to Browser"));
    socket.on("message", (msg) => {
        const message = JSON.parse(msg);
        switch(message.type){
            case "new_message":
                sockets.forEach( (aSocket) => 
                    aSocket.send(`${socket.nickname}: ${message.payload}`
                ));
            case "nickname":
                socket["nickname"] = message.payload;
        }
    });
});

server.listen(3000, handleListen);


