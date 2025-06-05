"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startGameHander = exports.endGameHander = void 0;
const __1 = require("..");
const functions_1 = require("./functions");
const endGameHander = (socket) => {
    socket.on("end game", (roomId, mode) => {
        const toType = (0, functions_1.shuffleList)(mode).join(" ");
        __1.rooms[roomId] = {
            players: __1.rooms[roomId].players,
            toType,
            inGame: false,
            winner: socket.id,
        };
        // console.log(socket.id);
        // io.in(roomId).emit("winner", rooms[roomId].winner);
        __1.io.in(roomId).emit("end game", socket.id);
    });
};
exports.endGameHander = endGameHander;
const startGameHander = (socket) => {
    socket.on("start game", (roomId) => {
        console.log("Received start game event for room:", roomId);
        if (!__1.rooms[roomId]) {
            console.log("Room not found:", roomId);
            return;
        }
        // Always generate new text for each game start
        const toType = (0, functions_1.shuffleList)("words").join(" ");
        __1.rooms[roomId].toType = toType;
        console.log("Generated new text:", toType);
        // First emit the text to be typed
        __1.io.in(roomId).emit("words generated", toType);
        console.log("Emitted words_generated event");
        // Then start the game after a short delay to ensure text is loaded
        setTimeout(() => {
            __1.rooms[roomId].inGame = true;
            __1.io.in(roomId).emit("start game");
            console.log("Emitted start_game event");
        }, 500); // Increased delay to ensure text is loaded
    });
};
exports.startGameHander = startGameHander;
