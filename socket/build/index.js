"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rooms = exports.playerRooms = exports.io = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const roomHandler_1 = require("./lib/roomHandler");
const disconnectHandler_1 = require("./lib/disconnectHandler");
const gameHandler_1 = require("./lib/gameHandler");
const port = process.env.PORT || 8080;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const server = http_1.default.createServer(app);
exports.io = new socket_io_1.Server(server, {
    cors: {
        origin: [
            "http://localhost:3000",
            "https://chimpanzee-type-neon.vercel.app",
        ],
        methods: ["GET", "POST"],
        credentials: true
    },
});
exports.playerRooms = {};
// rooms will consist of key value pair, key being room id, pair being users inside that room and their corresponding data
exports.rooms = {};
exports.io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    socket.join("public");
    const sockets = Array.from(exports.io.sockets.sockets).map((socket) => socket[0]);
    exports.io.to("public").emit("online users", sockets.length);
    // send online users
    socket.on("get online users", () => {
        const sockets = Array.from(exports.io.sockets.sockets).map((socket) => socket[0]);
        exports.io.to("public").emit("online users", sockets.length);
    });
    // chat handlers
    socket.on("send chat", (message) => {
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
                exports.io.to('public').emit('receive chat', chatMessage);
            }
            else {
                console.log('Broadcasting to room:', chatMessage.roomId, chatMessage);
                exports.io.to(chatMessage.roomId).emit('receive chat', chatMessage);
            }
        }
        catch (error) {
            console.error('Error handling chat message:', error);
            socket.emit('chat error', { message: 'Failed to send message' });
        }
    });
    // handle user disconnect
    (0, disconnectHandler_1.disconnectHandler)(socket);
    // game handlers
    (0, gameHandler_1.startGameHander)(socket);
    (0, gameHandler_1.endGameHander)(socket);
    // room handlers
    (0, roomHandler_1.joinRoomHander)(socket);
    (0, roomHandler_1.leaveRoomHandler)(socket);
    (0, roomHandler_1.createRoomHandler)(socket);
    (0, roomHandler_1.updateRoomHandler)(socket);
});
server.listen(port, () => {
    console.log(`Listening to server on port ${port}`);
});
