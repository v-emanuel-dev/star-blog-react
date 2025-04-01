// src/App.tsx
import { FC } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import PostPage from "./pages/PostPage";
import AboutPage from "./pages/AboutPage";
import NewPostPage from "./pages/NewPostPage";
import EditPostPage from "./pages/EditPostPage";
import LoginPage from "./pages/LoginPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage"; // Import ProfilePage
import { BlogProvider } from "./context/BlogContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { NotificationProvider } from "./context/NotificationContext"; // Import NotificationProvider

const App: FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BlogProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen bg-gray-100">
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/post/:id" element={<PostPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/auth/callback" element={<AuthCallbackPage />} />

                  <Route element={<ProtectedRoute />}>
                    <Route path="/new-post" element={<NewPostPage />} />
                    <Route path="/edit-post/:id" element={<EditPostPage />} />
                    <Route path="/profile" element={<ProfilePage />} />{" "}
                  </Route>

                  <Route
                    path="*"
                    element={
                      <div className="px-4 sm:px-6 lg:px-8 py-4">
                        <h1 className="text-2xl font-bold text-gray-900">
                          Ops! Page not found.
                        </h1>
                      </div>
                    }
                  />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </BlogProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
