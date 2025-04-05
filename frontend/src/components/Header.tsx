import { faBell, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "./Spinner";

const DefaultAvatar: FC<{ className?: string }> = ({
  className = "h-8 w-8 text-gray-400",
}) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
      clipRule="evenodd"
    />
  </svg>
);

const BACKEND_URL = "http://localhost:4000";

const Header: FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const {
    user,
    logout,
    isLoading,
    notificationCount,
    notifications,
    markNotificationsAsRead,
    isConnected,
  } = useAuth();

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const toggleUserMenu = () => setIsUserMenuOpen((prev) => !prev);

  const formatRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now.getTime() - notifTime.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin} min ago`;

    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24)
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target as Node)
      ) {
        setIsNotificationDropdownOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsNotificationDropdownOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  const getLinkClasses = (path: string, isMobile = false) => {
    const base = isMobile
      ? "block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150"
      : "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150";

    return location.pathname === path
      ? `${base} bg-gray-900 text-white`
      : `${base} text-gray-300 hover:bg-gray-700 hover:text-white`;
  };

  const getAvatarSrc = () => {
    if (!user?.avatarUrl) return null;
    return user.avatarUrl.startsWith("http")
      ? user.avatarUrl
      : `${BACKEND_URL}${user.avatarUrl}`;
  };

  const avatarSrc = getAvatarSrc();

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleBellClick = () => {
    const opening = !isNotificationDropdownOpen;
    setIsNotificationDropdownOpen(opening);
    if (opening && notificationCount > 0) markNotificationsAsRead();
  };

  const handleNotificationClick = (
    postId: number | string,
    commentId: number
  ) => {
    navigate(`/post/${postId}#comment-${commentId}`);
    setIsNotificationDropdownOpen(false);
  };

  return (
    <nav className="bg-gray-800 shadow-md">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Toggle menu</span>
              <svg
                className={`${isMobileMenuOpen ? "hidden" : "block"} h-6 w-6`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
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
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <Link
              to="/"
              className="flex items-center text-white hover:text-gray-300"
            >
              <FontAwesomeIcon icon={faStar} size="2x" />
              <span className="ml-3 text-xl font-bold hidden sm:inline">
                Star Blog
              </span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex space-x-4 items-center">
              <Link to="/" className={getLinkClasses("/")}>
                Home
              </Link>
              <Link to="/about" className={getLinkClasses("/about")}>
                About
              </Link>
              {!isLoading && user && (
                <>
                  <Link to="/profile" className={getLinkClasses("/profile")}>
                    Profile
                  </Link>
                  <Link to="/new-post" className={getLinkClasses("/new-post")}>
                    New Post
                  </Link>
                </>
              )}
              {!isLoading && user && (
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    isConnected ? "bg-green-700" : "bg-red-700"
                  } text-white`}
                >
                  {isConnected ? "Live" : "Offline"}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4 pr-2">
            {isLoading ? (
              <Spinner size="sm" color="text-gray-400" />
            ) : user ? (
              <>
                <div className="relative" ref={notificationDropdownRef}>
                  <button
                    onClick={handleBellClick}
                    className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    <span className="sr-only">View notifications</span>
                    <FontAwesomeIcon icon={faBell} className="h-6 w-6" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-bold text-red-100 bg-red-600 rounded-full">
                        {notificationCount > 9 ? "9+" : notificationCount}
                      </span>
                    )}
                  </button>
                  {isNotificationDropdownOpen && (
                    <div className="absolute right-0 z-10 mt-2 w-72 origin-top-right rounded-md bg-white py-1 shadow-lg">
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="px-4 py-3 text-center text-sm text-gray-500">
                            No new notifications
                          </p>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() =>
                                handleNotificationClick(
                                  notification.postId,
                                  notification.commentId
                                )
                              }
                              className="block px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100"
                            >
                              <p className="truncate">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {formatRelativeTime(notification.timestamp)}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    <span className="sr-only">Open user menu</span>
                    {avatarSrc ? (
                      <img
                        className="h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-gray-800 ring-white"
                        src={avatarSrc}
                        alt="User avatar"
                        onError={(e) => {
                          const t = e.target as HTMLImageElement;
                          t.onerror = null;
                          t.style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="inline-block h-8 w-8 overflow-hidden rounded-full bg-gray-600 ring-2 ring-offset-2 ring-offset-gray-800 ring-white">
                        <DefaultAvatar />
                      </span>
                    )}
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg">
                      <div className="px-4 py-3 text-sm text-gray-900">
                        <div>{user.name || "User"}</div>
                        <div className="truncate font-medium text-gray-500">
                          {user.email || ""}
                        </div>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
