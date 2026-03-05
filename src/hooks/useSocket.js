import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

/**
 * Custom hook to manage the Socket.io client connection.
 * Connects on mount, joins the "feed" room and a user-specific room
 * for personal notifications, and disconnects on unmount.
 *
 * @param {string} [userId] - The logged-in user's ID (for personal notifications)
 * @returns {object} socket - the Socket.io client instance
 */
const useSocket = (userId) => {
    const socketRef = useRef(null);

    useEffect(() => {
        // Connect to the Socket.io server
        const socket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('🔌 Socket connected:', socket.id);
            // Join the global feed room
            socket.emit('join_feed');
            // Join user-specific room for notifications
            if (userId) {
                socket.emit('join_user_room', userId);
            }
        });

        socket.on('disconnect', () => {
            console.log('🔌 Socket disconnected');
        });

        // Cleanup on unmount
        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [userId]);

    return socketRef.current;
};

export default useSocket;

