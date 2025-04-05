// src/App.tsx
import { FC } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Footer from "./components/Footer";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";

import AboutPage from "./pages/AboutPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import EditPostPage from "./pages/EditPostPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NewPostPage from "./pages/NewPostPage";
import PostPage from "./pages/PostPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";

import { AuthProvider } from "./context/AuthContext";
import { BlogProvider } from "./context/BlogContext";
import { NotificationProvider } from "./context/NotificationContext";

const App: FC = () => (
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
                  <Route path="/profile" element={<ProfilePage />} />
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

export default App;
