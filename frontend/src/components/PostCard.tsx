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
// Optional: Icon for comments
import { faComment } from '@fortawesome/free-regular-svg-icons';


interface PostCardProps {
  id: number | string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  categories?: string[];
  likes: number;
  commentCount: number; // Add commentCount prop
  likedByCurrentUser?: boolean;
}

const PostCard: FC<PostCardProps> = ({
  id, title, excerpt, date, author, categories = [],
  likes: initialLikes,
  commentCount, // Receive commentCount
  likedByCurrentUser = false
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow flex flex-col h-full">
      <div className="flex-grow">
        <Link to={`/post/${id}`}>
            <h2 className="text-xl font-bold mb-2 text-blue-600 hover:text-blue-800">{title}</h2>
        </Link>
        <p className="text-gray-700 mb-4 text-sm">{excerpt}</p>
        {categories.length > 0 && ( <div className="mb-3 flex flex-wrap gap-1">{categories.map((category, index) => (<span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{category}</span>))}</div> )}
      </div>
      <div className="mt-auto">
        <div className="flex justify-between text-xs text-gray-500 mb-3">
             <span>{formatDisplayDate(date)}</span>
             <span>By: {author}</span>
        </div>
        {likeError && <Alert message={likeError} type="error" title="Error" onClose={() => setLikeError(null)} className="mb-2 text-xs"/>}
        <div className="border-t pt-3 flex items-center justify-between"> {/* This div uses justify-between */}
            {/* Like Button */}
            <button onClick={handleLikeToggle} disabled={isLiking || !loggedInUser} title={!loggedInUser ? "Log in to like" : (isLiked ? "Unlike post" : "Like post")} className={`flex items-center transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed ${ isLiked ? 'text-blue-600 hover:text-blue-800' : 'text-gray-500 hover:text-blue-600' }`}>
               {isLiking ? (<Spinner size="sm" className="mr-1 w-4 h-4"/>) : (<FontAwesomeIcon icon={isLiked ? faThumbsUpSolid : faThumbsUpRegular} className="mr-1 h-4 w-4"/>)}
               <span className="text-sm font-medium">Like ({displayLikes})</span>
            </button>

            {/* Comment Count Display */}
            <Link to={`/post/${id}#comments`} // Optional: Link directly to comments section
                 title="View comments"
                 className="flex items-center text-xs text-gray-500 hover:text-indigo-600">
                 <FontAwesomeIcon icon={faComment} className="mr-1 h-3 w-3" />
                 Comments ({commentCount})
            </Link>
        </div>
      </div>
    </div>
  );
};

export default PostCard;