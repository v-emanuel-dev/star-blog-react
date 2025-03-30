// src/pages/AuthCallbackPage.tsx
import React, { FC, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import Spinner from '../components/Spinner';

interface JwtPayload {
    userId: number;
    email: string;
    name: string | null;
    avatarUrl?: string | null; // Ensure avatarUrl is in the payload type
    iat?: number;
    exp?: number;
}

const AuthCallbackPage: FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const processToken = async () => {
            const params = new URLSearchParams(location.search);
            const token = params.get('token');

            if (token) {
                try {
                    const decodedPayload = jwtDecode<JwtPayload>(token);

                    // Create the user object INCLUDING avatarUrl from decoded payload
                    const userToLogin = {
                        id: decodedPayload.userId,
                        email: decodedPayload.email,
                        name: decodedPayload.name || null,
                        avatarUrl: decodedPayload.avatarUrl || null // <-- FIX: Extract avatarUrl
                    };

                    if (userToLogin.id && userToLogin.email) {
                        // No artificial delay needed here unless testing spinners
                        // await artificialDelay(2000);
                        login(userToLogin, token);
                        navigate('/', { replace: true });
                    } else {
                        throw new Error("Invalid or incomplete token payload.");
                    }
                } catch (error) {
                    console.error("AuthCallbackPage: Error processing token:", error);
                    // await artificialDelay(2000); // Optional delay before error redirect
                    navigate('/login?error=token-processing-failed', { replace: true });
                }
            } else {
                console.error("AuthCallbackPage: No token found in URL.");
                // await artificialDelay(2000); // Optional delay before error redirect
                navigate('/login?error=missing-token', { replace: true });
            }
        };
        processToken();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    return (
        <div className="flex justify-center items-center min-h-screen">
            <Spinner size="lg" />
        </div>
    );
};

export default AuthCallbackPage;
