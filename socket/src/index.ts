import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { PlayerState, RoomState, SendChat } from "./lib/types";
import { createRoomHandler, joinRoomHander, leaveRoomHandler, updateRoomHandler } from "./lib/roomHandler";
import { disconnectHandler } from "./lib/disconnectHandler";
import { endGameHander, startGameHander } from "./lib/gameHandler";

const port = process.env.PORT || 8080;
const app = express();
app.use(cors());

const server = http.createServer(app);
export const io = new Server(server, {
	cors: {
		origin: [
			"http://localhost:3000",
			"https://chimpanzee-type-neon.vercel.app",
			"https://3.109.206.179/:8080", // Replace with your actual EC2 public IP
		],
		methods: ["GET", "POST"],
		credentials: true
	},
});

export const playerRooms: PlayerState = {};

// rooms will consist of key value pair, key being room id, pair being users inside that room and their corresponding data
export const rooms: RoomState = {};

io.on("connection", (socket) => {
	console.log("New client connected:", socket.id);
	
	socket.join("public");
	const sockets = Array.from(io.sockets.sockets).map((socket) => socket[0]);
	io.to("public").emit("online users", sockets.length);

	// send online users
	socket.on("get online users", () => {
		const sockets = Array.from(io.sockets.sockets).map((socket) => socket[0]);
		io.to("public").emit("online users", sockets.length);
	});

	// chat handlers
	socket.on("send chat", (message: SendChat) => {
		try {
			console.log('Received chat message:', message);
			
			if (!message.username || !message.value) {
				console.error('Invalid message format:', message);
				return;
			}

			const chatMessage = {
				username: message.username,
				value: message.value,
				id: message.id || socket.id,
				type: 'message',
				roomId: message.roomId || 'public'
			};

			// Send to everyone in the room including sender
			if (chatMessage.roomId === 'public') {
				console.log('Broadcasting to public chat:', chatMessage);
				io.to('public').emit('receive chat', chatMessage);
			} else {
				console.log('Broadcasting to room:', chatMessage.roomId, chatMessage);
				io.to(chatMessage.roomId).emit('receive chat', chatMessage);
			}
		} catch (error) {
			console.error('Error handling chat message:', error);
			socket.emit('chat error', { message: 'Failed to send message' });
		}
	});

	// handle user disconnect
	disconnectHandler(socket);

	// game handlers
	startGameHander(socket);
	endGameHander(socket);

	// room handlers
	joinRoomHander(socket);
	leaveRoomHandler(socket);
	createRoomHandler(socket);
	updateRoomHandler(socket);
});

server.listen(port, () => {
	console.log(`Listening to server on port ${port}`);
});
