// app.js

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
// const path = require("path");
const PORT = process.env.PORT || 4000;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

let players = [];
let currentPlayerIndex = 0;
let timerInterval;

const BOARD_SIZE = 8;

function startTimer() {
  let timeLeft = 30;

  timerInterval = setInterval(() => {
    io.emit("timer", { timeLeft });

    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(timerInterval);
      io.emit("gameOver", { message: "Time is up! Game over." });
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function moveRook(socket, move) {
  const currentPlayer = players[currentPlayerIndex];

  if (socket.id !== currentPlayer.id) {
    return;
  }

  const { x, y } = move;

  //   if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) {
  //     return;
  //   }

  //   players[currentPlayerIndex].x = x;
  //   players[currentPlayerIndex].y = y;

  //   io.emit("move", { playerId: currentPlayer.id, x, y });

  //   currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  //   startTimer();
}

function moveRook(socket, move) {
  const currentPlayer = players[currentPlayerIndex];

  if (socket.id !== currentPlayer.id) {
    return;
  }

  const { x, y } = move;

  // Calculate the change in position
  const dx = x - currentPlayer.x;
  const dy = y - currentPlayer.y;

  // Check if the move is valid (left or down only)
  if ((dx === -1 && dy === 0) || (dx === 0 && dy === 1)) {
    // Update player's position
    players[currentPlayerIndex].x = x;
    players[currentPlayerIndex].y = y;

    // Emit move event to clients
    io.emit("move", { playerId: currentPlayer.id, x, y });

    // Update currentPlayerIndex and start timer
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    startTimer();
  }
}

io.on("connection", (socket) => {
  // console.log("a user connected");

  socket.on("disconnect", () => {
    // console.log("user disconnected");
    players = players.filter((player) => player.id !== socket.id);
  });

  socket.on("joinGame", (name) => {
    players.push({ id: socket.id, name, x: BOARD_SIZE - 1, y: 0 });

    if (players.length === 2) {
      startTimer();
    }

    io.emit("players", players);
  });

  socket.on("move", (move) => {
    moveRook(socket, move);
    // console.log(move);
  });
});

io.on("joinGame", (name) => {
  // Ensure the player's initial position is always at x: BOARD_SIZE - 1, y: 0
  const initialX = BOARD_SIZE - 1;
  const initialY = 0;

  players.push({ id: socket.id, name, x: initialX, y: initialY });

  if (players.length === 2) {
    startTimer();
  }

  io.emit("players", players);
});

server.listen(PORT, () => {
  // console.log(Server running on port ${PORT});
});
