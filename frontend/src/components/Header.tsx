import { FC, useState } from "react";
import { Link, useLocation } from "react-router-dom";
// 1. Importar FontAwesomeIcon e o ícone de ESTRELA (faStar)
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons"; // Ícone de Estrela

const Header: FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getLinkClasses = (path: string, isMobile: boolean = false): string => {
    const baseClassesDesktop =
      "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150";
    const baseClassesMobile =
      "block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150";
    const baseClasses = isMobile ? baseClassesMobile : baseClassesDesktop;

    if (location.pathname === path) {
      return `${baseClasses} bg-gray-900 text-white`;
    } else {
      return `${baseClasses} text-gray-300 hover:bg-gray-700 hover:text-white`;
    }
  };

  return (
    <nav className="bg-gray-800 shadow-md">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* --- Botão do Menu Mobile --- */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Botão Mobile */}
            <button
              type="button"
              className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              onClick={toggleMobileMenu}
            >
              <span className="absolute -inset-0.5"></span>
              <span className="sr-only">Abrir menu principal</span>
              {/* Icons Hamburguer/X */}
              <svg
                className={`${isMobileMenuOpen ? "hidden" : "block"} h-6 w-6`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
              <svg
                className={`${isMobileMenuOpen ? "block" : "hidden"} h-6 w-6`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* --- Logo e Links Desktop --- */}
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            {/* Logo com Ícone Estrela + Texto */}
            <div className="flex flex-shrink-0 items-center">
              <Link
                to="/"
                className="flex items-center text-white hover:text-gray-300 transition-colors duration-150"
              >
                {/* 2. Usar o ícone faStar e a prop size="2x" */}
                <FontAwesomeIcon icon={faStar} size="2x" />
                {/* 3. Adicionar o Span com o nome do blog e estilos */}
                <span className="ml-3 text-xl font-bold">Star Blog</span>
              </Link>
            </div>
            {/* Links Desktop */}
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4 items-center">
                {" "}
                {/* Adicionado items-center para alinhar links com o logo maior */}
                <Link
                  to="/"
                  className={getLinkClasses("/")}
                  aria-current={location.pathname === "/" ? "page" : undefined}
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  className={getLinkClasses("/about")}
                  aria-current={
                    location.pathname === "/about" ? "page" : undefined
                  }
                >
                  Sobre
                </Link>
                <Link
                  to="/new-post"
                  className={getLinkClasses("/new-post")}
                  aria-current={
                    location.pathname === "/new-post" ? "page" : undefined
                  }
                >
                  Novo Post
                </Link>
              </div>
            </div>
          </div>

          {/* --- Ícones da Direita (Vazio) --- */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0"></div>
        </div>
      </div>

      {/* --- Painel do Menu Mobile --- */}
      <div
        className={`${isMobileMenuOpen ? "block" : "hidden"} sm:hidden`}
        id="mobile-menu"
      >
        <div className="space-y-1 px-2 pt-2 pb-3">
          <Link
            to="/"
            className={getLinkClasses("/", true)}
            aria-current={location.pathname === "/" ? "page" : undefined}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={getLinkClasses("/about", true)}
            aria-current={location.pathname === "/about" ? "page" : undefined}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Sobre
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Header;
