import React, { FC, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  userId: number;
  email: string;
  name: string | null;
  iat?: number;
  exp?: number;
}

const AuthCallbackPage: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      console.log("AuthCallbackPage: Token received:", token);
      try {
        const decodedPayload = jwtDecode<JwtPayload>(token);
        console.log("AuthCallbackPage: Decoded payload:", decodedPayload);

        const userToLogin = {
          id: decodedPayload.userId,
          email: decodedPayload.email,
          name: decodedPayload.name || null,
        };

        if (userToLogin.id && userToLogin.email) {
          login(userToLogin, token);
          setMessage("Authentication successful! Redirecting...");
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 500);
        } else {
          throw new Error("Invalid or incomplete token payload.");
        }
      } catch (error) {
        console.error("AuthCallbackPage: Error processing token:", error);
        setMessage("Authentication error. Redirecting to login...");
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setTimeout(() => {
          navigate('/login?error=invalid-token', { replace: true });
        }, 1500);
      }
    } else {
      console.error("AuthCallbackPage: No token found in the URL.");
      setMessage("Authentication failed (missing token). Redirecting to login...");
      setTimeout(() => {
        navigate('/login?error=missing-token', { replace: true });
      }, 1500);
    }
  }, [location.search, login, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-xl text-gray-600">{message}</div>
    </div>
  );
};

export default AuthCallbackPage;
