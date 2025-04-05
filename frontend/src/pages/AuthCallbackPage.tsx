import { jwtDecode } from "jwt-decode";
import { FC, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";

interface JwtPayload {
  userId: number;
  email: string;
  name: string | null;
  avatarUrl?: string | null;
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
      const token = params.get("token");

      if (!token) {
        navigate("/login?error=missing-token", { replace: true });
        return;
      }

      try {
        const decodedPayload = jwtDecode<JwtPayload>(token);

        const userToLogin = {
          id: decodedPayload.userId,
          email: decodedPayload.email,
          name: decodedPayload.name || "",
          avatarUrl: decodedPayload.avatarUrl || null,
        };

        if (userToLogin.id && userToLogin.email) {
          login(userToLogin, token);
          navigate("/", { replace: true });
        } else {
          throw new Error("Invalid token payload");
        }
      } catch (error) {
        console.error("AuthCallbackPage: Token processing failed", error);
        navigate("/login?error=token-processing-failed", { replace: true });
      }
    };

    processToken();
  }, [location.search, login, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Spinner size="lg" />
    </div>
  );
};

export default AuthCallbackPage;
