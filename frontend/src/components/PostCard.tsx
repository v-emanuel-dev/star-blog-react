import React, { FC, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toggleLikePost } from '../services/api';
import Spinner from './Spinner';
import Alert from './Alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp as faThumbsUpSolid } from '@fortawesome/free-solid-svg-icons';
import { faThumbsUp as faThumbsUpRegular } from '@fortawesome/free-regular-svg-icons';
import { formatDisplayDate } from '../utils/dateUtils';
import { faComment } from '@fortawesome/free-regular-svg-icons';
import { User, Post } from '../types'; // Import Post if needed for Omit, or just define props

interface PostCardProps {
  id: number | string;
  title: string;
  content: string;
  date: string;
  author: { id: number | null; name: string | null; } | null;
  categories?: string[]; // Receive as optional array
  likes: number;
  commentCount: number;
  likedByCurrentUser?: boolean;
}

const PostCard: FC<PostCardProps> = ({
  id, title, content, date, author, categories = [], // Default categories to []
  likes: initialLikes, commentCount, likedByCurrentUser = false
}) => {
  const { user: loggedInUser } = useAuth();
  const [displayLikes, setDisplayLikes] = useState<number>(initialLikes);
  const [isLiked, setIsLiked] = useState<boolean>(likedByCurrentUser);
  const [isLiking, setIsLiking] = useState<boolean>(false);
  const [likeError, setLikeError] = useState<string | null>(null);

  useEffect(() => {
      setDisplayLikes(initialLikes);
      setIsLiked(likedByCurrentUser);
  }, [initialLikes, likedByCurrentUser]);

  const handleLikeToggle = async () => {
      if (!loggedInUser) { setLikeError("Please log in to like posts."); return; }
      if (isLiking) return;
      setIsLiking(true); setLikeError(null);
      try {
          const response = await toggleLikePost(id);
          setDisplayLikes(response.likes);
          setIsLiked(response.liked);
      } catch (err) { setLikeError(err instanceof Error ? err.message : "Failed to update like status."); }
      finally { setIsLiking(false); }
  };

  // Sort categories alphabetically before rendering
  const sortedCategories = categories.slice().sort((a, b) => a.localeCompare(b));

  const truncateContent = (text: string | undefined, maxLength: number = 150): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    // Find the last space within the maxLength to avoid cutting words
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 0 ? `${truncated.substring(0, lastSpace)}...` : `${truncated}...`;
  };

  return (
    // Card container: Added slight border, ensure full height for grid alignment
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 border border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Growable content area */}
      <div className="p-6 flex-grow"> {/* Standardized padding */}
        {/* Title */}
        <Link to={`/post/${id}`} className="block mb-2 group">
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-150 ease-in-out">{title}</h2>
            {/* Use text-lg for slightly smaller title, adjust if needed */}
        </Link>
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">{truncateContent(content, 150)}</p>
        {/* Categories */}
        {sortedCategories.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2"> {/* Increased gap */}
              {sortedCategories.map((category, index) => (
                <span key={index} className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-0.5 rounded-full"> {/* Pill shape, adjusted colors */}
                  {category}
                </span>
              ))}
            </div>
        )}
      </div>
      {/* Footer area */}
      <div className="px-6 pt-3 pb-4 bg-gray-50 border-t border-gray-100"> {/* Footer background + padding */}
        {/* Meta: Date & Author */}
        <div className="flex justify-between text-sm text-gray-500 mb-2"> {/* Larger text-sm, smaller margin */}
             <span>{formatDisplayDate(date)}</span>
             <span>By: {author?.name || 'Unknown Author'}</span>
        </div>

        {/* Like Error Alert */}
        {likeError && <Alert message={likeError} type="error" title="Error" onClose={() => setLikeError(null)} className="mb-2 text-xs"/>}

        {/* Actions: Like & Comment Count */}
        <div className="flex items-center justify-between">
            {/* Like Button */}
            <button
                onClick={handleLikeToggle}
                disabled={isLiking || !loggedInUser}
                title={!loggedInUser ? "Log in to like" : (isLiked ? "Unlike post" : "Like post")}
                // Improved styling for like button state/clarity
                className={`flex items-center transition-colors duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed rounded-md px-2 py-1 -ml-2
                    ${ isLiked
                        ? 'text-blue-600 hover:text-blue-800'
                        : 'text-gray-500 hover:text-blue-600'
                    }`}
            >
               {isLiking ? (
                    <Spinner size="sm" className="mr-1.5 w-4 h-4"/> // Adjusted margin
               ) : (
                    <FontAwesomeIcon icon={isLiked ? faThumbsUpSolid : faThumbsUpRegular} className="mr-1.5 h-4 w-4"/> // Adjusted margin
               )}
               <span className="text-sm font-medium">{displayLikes}</span>
               <span className="sr-only">Likes</span> {/* Accessibility */}
            </button>

            {/* Comment Count Link */}
            <Link
                to={`/post/${id}#comments`}
                title="View comments"
                className="flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors duration-150 ease-in-out rounded-md px-2 py-1 -mr-2" // Added padding/rounding for larger click area
            >
                 <FontAwesomeIcon icon={faComment} className="mr-1.5 h-4 w-4" /> {/* Slightly larger icon */}
                 {commentCount}
                 <span className="sr-only">Comments</span> {/* Accessibility */}
            </Link>
        </div>
      </div>
    </div>
  );
  
};

export default PostCard;
