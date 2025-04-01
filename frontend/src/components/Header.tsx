import React, { FC, useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faBell, faExternalLinkAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

const DefaultAvatar: FC<{ className?: string }> = ({ className = "h-8 w-8 text-gray-400" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
);

const BACKEND_URL = 'http://localhost:4000';

const Header: FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
    const notificationDropdownRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const navigate = useNavigate();
    
    // Get auth context with notifications
    const { 
        user, 
        logout, 
        isLoading, 
        notificationCount, 
        notifications, 
        markNotificationsAsRead,
        isConnected 
    } = useAuth();

    // Debug to console  
    useEffect(() => {
        console.log("[Header] Current notifications:", notifications);
        console.log("[Header] Notification count:", notificationCount);
        console.log("[Header] Socket connected:", isConnected);
    }, [notifications, notificationCount, isConnected]);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    // Format timestamp for notifications
    const formatRelativeTime = (timestamp: string): string => {
        try {
            const now = new Date();
            const notifTime = new Date(timestamp);
            const diffMs = now.getTime() - notifTime.getTime();
            const diffMin = Math.floor(diffMs / 60000);
            
            if (diffMin < 1) return 'just now';
            if (diffMin < 60) return `${diffMin} min ago`;
            
            const diffHours = Math.floor(diffMin / 60);
            if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
            
            const diffDays = Math.floor(diffHours / 24);
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        } catch (e) {
            console.error("Error formatting time:", e);
            return 'unknown time';
        }
    };

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                notificationDropdownRef.current && 
                !notificationDropdownRef.current.contains(event.target as Node)
            ) {
                setIsNotificationDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Close dropdown when navigating
    useEffect(() => {
        setIsNotificationDropdownOpen(false);
    }, [location.pathname]);

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

    const getAvatarSrc = (): string | null => {
        if (!user?.avatarUrl) return null;
        if (user.avatarUrl.startsWith('http://') || user.avatarUrl.startsWith('https://')) {
            return user.avatarUrl;
        }
        return `${BACKEND_URL}${user.avatarUrl}`;
    };

    const avatarSrc = getAvatarSrc();

    const handleBellClick = () => {
        console.log("[Header] Bell clicked, current state:", { isOpen: isNotificationDropdownOpen, count: notificationCount });
        
        // Toggle dropdown state
        setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
        
        // Mark notifications as read if opening the dropdown and there are unread notifications
        if (!isNotificationDropdownOpen && notificationCount > 0) {
            console.log("[Header] Marking notifications as read");
            markNotificationsAsRead();
        }
    };

    // Navigate to the post with the specific comment
    const handleNotificationClick = (postId: number | string, commentId: number) => {
        console.log(`[Header] Notification clicked, navigating to post ${postId}, comment ${commentId}`);
        navigate(`/post/${postId}#comment-${commentId}`);
        setIsNotificationDropdownOpen(false);
    };

    return (
        <nav className="bg-gray-800 shadow-md">
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                <div className="relative flex h-16 items-center justify-between">
                    <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                         <button type="button" onClick={toggleMobileMenu} className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" aria-controls="mobile-menu" aria-expanded={isMobileMenuOpen}>
                           <span className="absolute -inset-0.5"></span><span className="sr-only">Open main menu</span>
                           <svg className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                           <svg className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
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
                                {!isLoading && user && ( <> <Link to="/new-post" className={getLinkClasses('/new-post')}>New Post</Link> <Link to="/profile" className={getLinkClasses('/profile')}>Profile</Link> </> )}
                                {/* Connection status indicator (debugging) */}
                                {!isLoading && user && (
                                    <span className={`text-xs px-2 py-1 rounded ${isConnected ? 'bg-green-700 text-white' : 'bg-red-700 text-white'}`}>
                                        {isConnected ? 'Connected' : 'Disconnected'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                        {isLoading ? ( <Spinner size="sm" color="text-gray-400" /> )
                         : user ? (
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                {/* Notification bell with dropdown */}
                                <div className="relative" ref={notificationDropdownRef}>
                                    <button 
                                        type="button" 
                                        onClick={handleBellClick}
                                        className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                                    >
                                        <span className="sr-only">View notifications</span>
                                        <FontAwesomeIcon icon={faBell} className="h-6 w-6" />
                                        {notificationCount > 0 && (
                                            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                                                {notificationCount > 9 ? '9+' : notificationCount}
                                            </span>
                                        )}
                                    </button>
                                    
                                    {/* Notification dropdown */}
                                    {isNotificationDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden">
                                            <div className="bg-gray-800 text-white px-4 py-2 text-sm font-medium flex justify-between items-center">
                                                <span>Notifications</span>
                                                <span className="text-xs text-gray-400">
                                                    {notifications.length} total
                                                </span>
                                            </div>
                                            <div className="max-h-80 overflow-y-auto">
                                                {!notifications || notifications.length === 0 ? (
                                                    <div className="py-4 px-3 text-center text-gray-500 text-sm">
                                                        <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                                                        No notifications
                                                    </div>
                                                ) : (
                                                    notifications.map(notification => (
                                                        <div 
                                                            key={notification.id} 
                                                            className={`border-b last:border-0 p-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150 ${!notification.read ? 'bg-blue-50' : ''}`}
                                                            onClick={() => handleNotificationClick(notification.postId, notification.commentId)}
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div className="text-sm text-gray-800">
                                                                    {notification.message}
                                                                </div>
                                                                <FontAwesomeIcon icon={faExternalLinkAlt} className="h-3 w-3 text-gray-400 mt-1 ml-2" />
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {formatRelativeTime(notification.timestamp)}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {avatarSrc ? ( <img className="h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-gray-800 ring-white" src={avatarSrc} alt="User avatar" onError={(e) => { const t = e.target as HTMLImageElement; t.onerror=null; t.style.display='none'; }}/> )
                                : (<span className="inline-block h-8 w-8 overflow-hidden rounded-full bg-gray-600 ring-2 ring-offset-2 ring-offset-gray-800 ring-white"><DefaultAvatar className="h-full w-full text-gray-400"/></span>)}
                                <button onClick={handleLogout} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-1 px-2 rounded transition duration-150 ease-in-out">Logout</button>
                            </div>
                         ) : ( <Link to="/login" className={`${getLinkClasses('/login')} whitespace-nowrap`}>Login / Register</Link> )}
                    </div>
                </div>
            </div>
             <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden`} id="mobile-menu">
                 <div className="space-y-1 px-2 pt-2 pb-3">
                    <Link to="/" className={getLinkClasses('/', true)} onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                    <Link to="/about" className={getLinkClasses('/about', true)} onClick={() => setIsMobileMenuOpen(false)}>About</Link>
                    {!isLoading && user && ( <> <Link to="/new-post" className={getLinkClasses('/new-post', true)} onClick={() => setIsMobileMenuOpen(false)}>New Post</Link> <Link to="/profile" className={getLinkClasses('/profile', true)} onClick={() => setIsMobileMenuOpen(false)}>Profile</Link> </> )}
                    {/* Connection status in mobile (debugging) */}
                    {!isLoading && user && (
                        <div className={`mt-2 px-3 py-1 text-center rounded text-xs ${isConnected ? 'bg-green-700 text-white' : 'bg-red-700 text-white'}`}>
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </div>
                    )}
                    {/* Mobile doesn't have bell currently, just login/logout */}
                    {isLoading ? ( <div className="flex justify-center py-2"><Spinner size="sm" color="text-gray-400"/></div> )
                     : user ? ( <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"> Logout </button> )
                     : ( <Link to="/login" className={getLinkClasses('/login', true)} onClick={() => setIsMobileMenuOpen(false)}>Login / Register</Link> )}
                </div>
            </div>
        </nav>
    );
};

export default Header;
