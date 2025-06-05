import { Socket } from "socket.io";
import { io, rooms } from "..";
import { shuffleList } from "./functions";

export const endGameHander = (socket: Socket) => {
	socket.on("end game", (roomId: string, mode: "words" | "sentences" | "numbers") => {
		const toType = shuffleList(mode).join(" ");
		rooms[roomId] = {
			players: rooms[roomId].players,
			toType,
			inGame: false,
			winner: socket.id,
		};
		// console.log(socket.id);
		// io.in(roomId).emit("winner", rooms[roomId].winner);
		io.in(roomId).emit("end game", socket.id);
	});
};

export const startGameHander = (socket: Socket) => {
	socket.on("start game", (roomId: string) => {
		console.log("Received start game event for room:", roomId);
		
		if (!rooms[roomId]) {
			console.log("Room not found:", roomId);
			return;
		}

		// Always generate new text for each game start
		const toType = shuffleList("words").join(" ");
		rooms[roomId].toType = toType;
		console.log("Generated new text:", toType);

		// First emit the text to be typed
		io.in(roomId).emit("words generated", toType);
		console.log("Emitted words_generated event");

		// Then start the game after a short delay to ensure text is loaded
		setTimeout(() => {
			rooms[roomId].inGame = true;
			io.in(roomId).emit("start game");
			console.log("Emitted start_game event");
		}, 500); // Increased delay to ensure text is loaded
	});
};
