const socket = io();

const welcome = document.getElementById("welcome");
// const form = welcome.querySelector("form");
const nicknameForm = document.getElementById("nickname");
const roomnameForm = document.getElementById("roomname");
const room = document.getElementById("room");


roomname.hidden = true;
room.hidden = true;

let nickName;
let roomName;

function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h2 = room.querySelector("h2");
    const h3 = room.querySelector("h3");
    h2.innerText = `Name: ${nickName}`;
    h3.innerText = `Room: ${roomName}`;
    const msgForm = room.querySelector("#msg");
    // const nameForm = room.querySelector("#name");
    msgForm.addEventListener("submit", handleMessageSubmit);
    // nameForm.addEventListener("submit", handleNicknameSubmit);
}

function addMessage(message) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${value}`);
    });
    input.value = "";
}

function handleNicknameSubmit(event) {
    event.preventDefault();
    nickname.hidden = true;
    roomname.hidden = false;
    const input = nicknameForm.querySelector("input");
    nickName = input.value;
    socket.emit("nickname", input.value);
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = roomnameForm.querySelector("input");
    // 코드 작성 순서가 실행 순서를 보여줄 수 있음 -> 처리완료를 알리는 로그는 마지막에
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
}

nicknameForm.addEventListener("submit", handleNicknameSubmit);
roomnameForm.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user) => {
    addMessage(`${user} joined!`);
});

socket.on("bye", (user) => {
    addMessage(`${user} left.`);
});

socket.on("new_message", (msg) => {addMessage(msg)});

socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    if(rooms.length === 0){
        return;
    }
    rooms.forEach((room) => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    });
});

