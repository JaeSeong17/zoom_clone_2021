import http from "http";
// import WebSocket from "ws";
import { Server} from "socket.io";
import express from "express";
import { parse } from "path";
import { SSL_OP_CISCO_ANYCONNECT } from "constants";
import { instrument } from "@socket.io/admin-ui";
 
const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const sis = new Server(httpServer, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true,
    },
});
instrument(sis, {
    auth: false,
});

function publicRooms(){
    const {
        sockets: {
            adapter: {sids, rooms},
        },
    } = sis;
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if(sids.get(key) === undefined){
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

function countRoom(roomName) {
    return sis.sockets.adapter.rooms.get(roomName)?.size
}

sis.on("connection", (socket) => {
    socket["nickname"] = "Anonymous";
    sis.sockets.emit("room_change", publicRooms());

    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
    });
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        sis.sockets.emit("room_change", publicRooms());
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach( (room) => socket.to(room).emit("bye", socket.nickname));
    });
    socket.on("disconnect", () => {
        sis.sockets.emit("room_change", publicRooms());
    });
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });
    socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

// 같은 서버에서 http 와 wss를 모두 다루고 싶을때 이렇게 선언한다.
// wss만 사용하고 싶다면 http server를 인자로 전달하지 않으면 됨.
// const wss = new WebSocket.Server({ server });

// const sockets = [];
// wss.on("connection", (socket) => {
//     sockets.push(socket);
//     socket["nickname"] = "Anon";
//     console.log("Conneted to Browser!");
//     socket.on("close", () => console.log("Disconneted to Browser"));
//     socket.on("message", (msg) => {
//         const message = JSON.parse(msg);
//         switch(message.type){
//             case "new_message":
//                 sockets.forEach( (aSocket) => 
//                     aSocket.send(`${socket.nickname}: ${message.payload}`
//                 ));
//             case "nickname":
//                 socket["nickname"] = message.payload;
//         }
//     });
// });

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);


