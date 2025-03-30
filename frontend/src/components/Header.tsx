import { FC, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const Header: FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getLinkClasses = (path: string, isMobile: boolean = false): string => {
    const baseClassesDesktop = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150";
    const baseClassesMobile = "block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150";
    const baseClasses = isMobile ? baseClassesMobile : baseClassesDesktop;

    if (location.pathname === path) {
      return `${baseClasses} bg-gray-900 text-white`;
    } else {
      return `${baseClasses} text-gray-300 hover:bg-gray-700 hover:text-white`;
    }
  };

  const handleLogout = () => {
      logout();
      navigate('/login');
      setIsMobileMenuOpen(false);
  }

  return (
    <nav className="bg-gray-800 shadow-md">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
             <button type="button" onClick={toggleMobileMenu}>
               <span className="sr-only">Open main menu</span>
               <svg className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`} />
               <svg className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`} />
              </button>
          </div>

          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
             <div className="flex flex-shrink-0 items-center">
                <Link to="/" className="flex items-center text-white hover:text-gray-300 transition-colors duration-150">
                  <FontAwesomeIcon icon={faStar} size="2x" />
                  <span className="ml-3 text-xl font-bold">Star Blog</span>
                </Link>
              </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4 items-center">
                <Link to="/" className={getLinkClasses('/')}>Home</Link>
                <Link to="/about" className={getLinkClasses('/about')}>About</Link>
                {!isLoading && user && (
                    <Link to="/new-post" className={getLinkClasses('/new-post')}>New Post</Link>
                )}
              </div>
            </div>
          </div>

          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
             {isLoading ? (
                 <span className="text-gray-400 text-sm animate-pulse">Loading...</span>
             ) : user ? (
                 <div className="flex items-center space-x-3">
                     <span className="text-gray-300 text-sm font-medium hidden sm:inline">
                        Hello, {user.name || user.email}
                     </span>
                     <button
                         onClick={handleLogout}
                         className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-1 px-2 rounded transition duration-150 ease-in-out"
                     >
                         Logout
                     </button>
                 </div>
             ) : (
                 <Link to="/login" className={`${getLinkClasses('/login')} whitespace-nowrap`}>
                     Login
                 </Link>
             )}
          </div>

        </div>
      </div>

      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden`} id="mobile-menu">
        <div className="space-y-1 px-2 pt-2 pb-3">
          <Link to="/" className={getLinkClasses('/', true)} onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link to="/about" className={getLinkClasses('/about', true)} onClick={() => setIsMobileMenuOpen(false)}>About</Link>
          {!isLoading && user && (
              <Link to="/new-post" className={getLinkClasses('/new-post', true)} onClick={() => setIsMobileMenuOpen(false)}>New Post</Link>
          )}
          {isLoading ? (
               <span className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 animate-pulse">Loading...</span>
           ) : user ? (
              <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                  Logout
              </button>
          ) : (
              <Link to="/login" className={getLinkClasses('/login', true)} onClick={() => setIsMobileMenuOpen(false)}>Login / Register</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
