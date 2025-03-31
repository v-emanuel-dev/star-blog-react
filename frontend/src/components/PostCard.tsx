// src/components/PostCard.tsx
import React, { FC, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toggleLikePost } from '../services/api'; // Import new function
import Spinner from './Spinner';
import Alert from './Alert';
// Import FontAwesome components and specific icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp as faThumbsUpSolid } from '@fortawesome/free-solid-svg-icons'; // Solid thumb
import { faThumbsUp as faThumbsUpRegular } from '@fortawesome/free-regular-svg-icons'; // Regular (outline) thumb


interface PostCardProps {
  id: number | string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  categories?: string[];
  likes: number; // Initial total likes
  likedByCurrentUser?: boolean; // Optional: If current user liked it initially
}

const PostCard: FC<PostCardProps> = ({
  id,
  title,
  excerpt,
  date,
  author,
  categories = [],
  likes: initialLikes,
  likedByCurrentUser = false // Default to false if not provided
}) => {
  const { user: loggedInUser } = useAuth();

  // State for UI display
  const [displayLikes, setDisplayLikes] = useState<number>(initialLikes);
  const [isLiked, setIsLiked] = useState<boolean>(likedByCurrentUser);
  const [isLiking, setIsLiking] = useState<boolean>(false); // Loading state for the action
  const [likeError, setLikeError] = useState<string | null>(null);

  // Effect to sync state if props change from parent
  useEffect(() => {
      setDisplayLikes(initialLikes);
      setIsLiked(likedByCurrentUser);
  }, [initialLikes, likedByCurrentUser]);

  // Handle Like/Unlike button click
  const handleLikeToggle = async () => {
      if (!loggedInUser) {
          setLikeError("Please log in to like posts.");
          return;
      }
      if (isLiking) return; // Prevent multiple clicks

      setIsLiking(true);
      setLikeError(null);

      try {
          // Call the toggle API function
          const response = await toggleLikePost(id);
          // Update local state based on the API response
          setDisplayLikes(response.likes);
          setIsLiked(response.liked);
      } catch (err) {
           console.error("Error toggling like:", err);
           setLikeError(err instanceof Error ? err.message : "Failed to update like status.");
           // Optionally revert state here, but might cause flicker.
           // Relying on next refresh might be simpler for now if error is temporary.
      } finally {
          setIsLiking(false);
      }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow flex flex-col h-full">
      {/* Make content area grow */}
      <div className="flex-grow">
        <Link to={`/post/${id}`}>
            <h2 className="text-xl font-bold mb-2 text-blue-600 hover:text-blue-800">{title}</h2>
        </Link>
        <p className="text-gray-700 mb-4 text-sm">{excerpt}</p>

        {categories.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
            {categories.map((category, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {category}
                </span>
            ))}
            </div>
        )}
      </div>

      {/* Footer section of card */}
      <div className="mt-auto">
        <div className="flex justify-between text-xs text-gray-500 mb-3">
            <span>{date}</span>
            <span>By: {author}</span>
        </div>

        {likeError && <Alert message={likeError} type="error" title="Error" onClose={() => setLikeError(null)} className="mb-2 text-xs"/>}

        <div className="border-t pt-3 flex items-center justify-between">
            <button
                onClick={handleLikeToggle}
                disabled={isLiking || !loggedInUser}
                title={!loggedInUser ? "Log in to like" : (isLiked ? "Unlike post" : "Like post")}
                className={`flex items-center transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed ${
                    isLiked
                    ? 'text-blue-600 hover:text-blue-800' // Liked state color
                    : 'text-gray-500 hover:text-blue-600' // Not liked state color
                }`}
            >
                {isLiking ? (
                    <Spinner size="sm" className="mr-1 w-4 h-4"/> // Smaller spinner
                ) : (
                     // Show solid thumb if liked, regular if not
                     <FontAwesomeIcon icon={isLiked ? faThumbsUpSolid : faThumbsUpRegular} className="mr-1 h-4 w-4"/>
                )}
                <span className="text-sm font-medium">Like ({displayLikes})</span>
            </button>

            {/* Potential placeholder for other actions like comments count or share */}
             {/* <span className="text-xs text-gray-400">Comments: ?</span> */}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
