import React, { FC, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

const DefaultAvatar: FC<{ className?: string }> = ({ className = "h-8 w-8 text-gray-400" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
);

const BACKEND_URL = 'http://localhost:4000';

const Header: FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, isLoading } = useAuth();

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

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
    };

    // Function to determine the correct avatar source URL
    const getAvatarSrc = (): string | null => {
        if (!user?.avatarUrl) {
            return null; // No specific avatar, will use default component
        }
        // Check if it's a full URL (like Google's)
        if (user.avatarUrl.startsWith('http://') || user.avatarUrl.startsWith('https://')) {
            return user.avatarUrl;
        }
        // Otherwise, assume it's a relative path from our backend
        return `${BACKEND_URL}${user.avatarUrl}`;
    };

    const avatarSrc = getAvatarSrc();

    return (
        <nav className="bg-gray-800 shadow-md">
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                <div className="relative flex h-16 items-center justify-between">
                    {/* Mobile Menu Button */}
                    <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                         <button type="button" onClick={toggleMobileMenu} className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" aria-controls="mobile-menu" aria-expanded={isMobileMenuOpen}>
                           <span className="absolute -inset-0.5"></span><span className="sr-only">Open main menu</span>
                           <svg className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                           <svg className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                         </button>
                    </div>
                    {/* Logo & Desktop Links */}
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
                    {/* Right side: Auth Info */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                        {isLoading ? (
                            <Spinner size="sm" color="text-gray-400" />
                        ) : user ? (
                            <div className="flex items-center space-x-3">
                                {/* Conditionally render img or default avatar */}
                                {avatarSrc ? (
                                    <img
                                        className="h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-gray-800 ring-white"
                                        src={avatarSrc} // Use the determined src
                                        alt="User avatar"
                                        onError={(e) => { // Basic error handling for images
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            console.warn(`Failed to load avatar: ${target.src}`);
                                            // Optional: replace with default SVG via state update if needed
                                            target.style.display = 'none'; // Hide broken image
                                            // Maybe show a placeholder sibling element?
                                         }}
                                    />
                                ) : (
                                    // Render default avatar if avatarSrc is null
                                    <span className="inline-block h-8 w-8 overflow-hidden rounded-full bg-gray-600 ring-2 ring-offset-2 ring-offset-gray-800 ring-white">
                                        <DefaultAvatar className="h-full w-full text-gray-400"/>
                                    </span>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-1 px-2 rounded transition duration-150 ease-in-out"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className={`${getLinkClasses('/login')} whitespace-nowrap`}>
                                Login / Register
                            </Link>
                        )}
                    </div>
                </div>
            </div>
            {/* Mobile Menu */}
            <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden`} id="mobile-menu">
                {/* ... mobile menu links (no avatar shown here currently) ... */}
                 <div className="space-y-1 px-2 pt-2 pb-3">
                    <Link to="/" className={getLinkClasses('/', true)} onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                    <Link to="/about" className={getLinkClasses('/about', true)} onClick={() => setIsMobileMenuOpen(false)}>About</Link>
                    {!isLoading && user && (
                        <Link to="/new-post" className={getLinkClasses('/new-post', true)} onClick={() => setIsMobileMenuOpen(false)}>New Post</Link>
                    )}
                    {isLoading ? (
                        <div className="flex justify-center py-2"><Spinner size="sm" color="text-gray-400"/></div>
                     ) : user ? (
                        <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
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
