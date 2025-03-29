import { FC } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header"; // Nossa Navbar atual
import Footer from "./components/Footer"; // <-- 1. Importar o Footer
import HomePage from "./pages/HomePage";
import PostPage from "./pages/PostPage";
import AboutPage from "./pages/AboutPage";
import { BlogProvider } from "./context/BlogContext";

const App: FC = () => {
  return (
    <BlogProvider>
      <BrowserRouter>
        {/* Envolvemos tudo em um flex container para empurrar o footer para baixo */}
        <div className="flex flex-col min-h-screen bg-gray-100">
          <Header /> {/* Renderiza o Header/Navbar */}
          {/* A área principal cresce para preencher o espaço disponível */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/post/:id" element={<PostPage />} />
              <Route
                path="*"
                element={
                  // Substituído container mx-auto por padding
                  <div className="px-4 sm:px-6 lg:px-8 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                      Página não encontrada
                    </h1>
                    {/* Adicionei um H1 e cor escura */}
                  </div>
                }
              />
            </Routes>
          </main>
          <Footer /> {/* <-- 2. Renderizar o Footer aqui */}
        </div>
      </BrowserRouter>
    </BlogProvider>
  );
};

export default App;
