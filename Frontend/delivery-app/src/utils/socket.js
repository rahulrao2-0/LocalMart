import { io } from 'socket.io-client';

// Singleton socket instance for the delivery app
const socket = io('http://localhost:5003', { autoConnect: false });

export default socket;
