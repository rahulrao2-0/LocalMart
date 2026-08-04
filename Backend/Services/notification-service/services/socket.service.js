import { Server } from "socket.io";

let io;

export const init = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
        }
    });
    
    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);
        
        socket.on('join', (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined their notification room`);
        });

        socket.on('leave', (userId) => {
            socket.leave(userId);
            console.log(`User ${userId} left their notification room`);
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

export const sendNotification = (userId, eventName, data) => {
    if (io) {
        io.to(userId).emit(eventName, data);
        console.log(`Socket event '${eventName}' sent to user ${userId}`);
    }
};
