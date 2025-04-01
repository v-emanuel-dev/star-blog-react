import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext'; // To get the token

const SOCKET_URL = 'http://localhost:4000'; // Your backend URL

export const useSocket = () => {
    const { token } = useAuth(); // Get token from Auth context
    // Use useRef for the socket instance to avoid issues with useEffect dependencies
    const socketRef = useRef<Socket | null>(null);
    // State to track connection status
    const [isConnected, setIsConnected] = useState<boolean>(false);

    useEffect(() => {
        // Connect only if we have a token and aren't already connected
        if (token && !socketRef.current) {
            console.log('[useSocket] Token found, attempting connection...');
            // Create the connection with token for auth
            const newSocket = io(SOCKET_URL, {
                auth: { token },
                // Optional: add reconnection options if needed
                // reconnectionAttempts: 5,
                // reconnectionDelay: 1000,
            });

            // Store instance in ref
            socketRef.current = newSocket;

            newSocket.on('connect', () => {
                console.log('[useSocket] Socket connected:', newSocket.id);
                setIsConnected(true);
            });

            newSocket.on('disconnect', (reason) => {
                console.log('[useSocket] Socket disconnected:', reason);
                setIsConnected(false);
                socketRef.current = null; // Clear ref on disconnect
                // Handle potential reconnection logic here if desired
            });

            newSocket.on('connect_error', (err) => {
                console.error('[useSocket] Connection Error:', err.message);
                setIsConnected(false);
                socketRef.current?.disconnect(); // Ensure cleanup on error
                socketRef.current = null;
            });

        } else if (!token && socketRef.current) {
            // If token is removed (logout) and socket exists, disconnect
            console.log('[useSocket] Token removed, disconnecting.');
            socketRef.current.disconnect();
            socketRef.current = null;
            setIsConnected(false);
        }

        // Cleanup function on component unmount or token change
        return () => {
            if (socketRef.current) {
                console.log('[useSocket] Cleaning up socket connection.');
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
        };
    }, [token]); // Effect runs when token changes

    // Return the current socket instance (from ref) and connection status
    return { socket: socketRef.current, isConnected };
};
