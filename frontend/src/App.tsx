import { FC } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import PostPage from "./pages/PostPage";
import AboutPage from "./pages/AboutPage";
import NewPostPage from "./pages/NewPostPage"; // <-- Importar
import EditPostPage from './pages/EditPostPage'; // <-- Adicionaremos depois
import { BlogProvider } from "./context/BlogContext";

const App: FC = () => {
  return (
    <BlogProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-gray-100">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/post/:id" element={<PostPage />} />
              <Route path="/new-post" element={<NewPostPage />} />
              <Route path="/edit-post/:id" element={<EditPostPage />} />{" "}
              {/* <-- Nova Rota */}
              <Route
                path="*"
                element={
                  <div className="px-4 sm:px-6 lg:px-8 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                      Página não encontrada
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
  );
};
export default App;
