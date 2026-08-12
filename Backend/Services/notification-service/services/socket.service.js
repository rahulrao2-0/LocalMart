import { Server } from "socket.io";
import { redis } from "@localmart/shared";

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

        // Live Tracking: Delivery Partner updates their location
        socket.on('updateLocation', async (data) => {
            // data should look like { partnerId: '123', orderId: '456', lat: 19.076, lng: 72.877 }
            const { partnerId, orderId, lat, lng } = data;
            
            if (partnerId && lat && lng) {
                try {
                    // Save to Redis Geospatial index for "nearby partners" queries
                    await redis.geoAdd("delivery_partners_live", {
                        longitude: lng,
                        latitude: lat,
                        member: partnerId
                    });
                    
                    // Also set a quick TTL hash if you want to know when they go offline
                    await redis.set(`partner_status:${partnerId}`, "online", { EX: 60 });
                    
                    // Broadcast the location to the specific order room so customer/seller can see it
                    if (orderId) {
                        io.to(`order_${orderId}`).emit('partnerLocationUpdated', { partnerId, lat, lng, timestamp: new Date() });
                    }
                } catch (err) {
                    console.error("Redis geoAdd error:", err);
                }
            }
        });

        // Customers/Sellers can join an order tracking room
        socket.on('joinOrderTrack', (orderId) => {
            socket.join(`order_${orderId}`);
            console.log(`User joined order tracking room: order_${orderId}`);
        });
        
        socket.on('leaveOrderTrack', (orderId) => {
            socket.leave(`order_${orderId}`);
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
