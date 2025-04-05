import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

const SOCKET_URL = "http://localhost:4000";

export const useSocket = () => {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (token && !socketRef.current) {
      const newSocket = io(SOCKET_URL, { auth: { token } });
      socketRef.current = newSocket;

      newSocket.on("connect", () => setIsConnected(true));
      newSocket.on("disconnect", () => {
        setIsConnected(false);
        socketRef.current = null;
      });
      newSocket.on("connect_error", () => {
        setIsConnected(false);
        socketRef.current?.disconnect();
        socketRef.current = null;
      });
    }

    if (!token && socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [token]);

  return { socket: socketRef.current, isConnected };
};
