import {
  faComment,
  faThumbsUp as faThumbsUpRegular,
} from "@fortawesome/free-regular-svg-icons";
import { faThumbsUp as faThumbsUpSolid } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toggleLikePost } from "../services/api";
import { formatDisplayDate } from "../utils/dateUtils";
import Alert from "./Alert";
import Spinner from "./Spinner";

interface PostCardProps {
  id: number | string;
  title: string;
  content: string;
  date: string;
  author: { id: number | null; name: string | null } | null;
  categories?: string[];
  likes: number;
  commentCount: number;
  likedByCurrentUser?: boolean;
}

const PostCard: FC<PostCardProps> = ({
  id,
  title,
  content,
  date,
  author,
  categories = [],
  likes: initialLikes,
  commentCount,
  likedByCurrentUser = false,
}) => {
  const { user: loggedInUser } = useAuth();
  const [displayLikes, setDisplayLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(likedByCurrentUser);
  const [isLiking, setIsLiking] = useState(false);
  const [likeError, setLikeError] = useState<string | null>(null);

  useEffect(() => {
    setDisplayLikes(initialLikes);
    setIsLiked(likedByCurrentUser);
  }, [initialLikes, likedByCurrentUser]);

  const handleLikeToggle = async () => {
    if (!loggedInUser) {
      setLikeError("Please log in to like posts.");
      return;
    }
    if (isLiking) return;
    setIsLiking(true);
    setLikeError(null);
    try {
      const response = await toggleLikePost(id);
      setDisplayLikes(response.likes);
      setIsLiked(response.liked);
    } catch (err) {
      setLikeError(
        err instanceof Error ? err.message : "Failed to update like status."
      );
    } finally {
      setIsLiking(false);
    }
  };

  const sortedCategories = categories
    .slice()
    .sort((a, b) => a.localeCompare(b));

  const truncateContent = (text?: string, maxLength: number = 150): string => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");
    return lastSpace > 0
      ? `${truncated.substring(0, lastSpace)}...`
      : `${truncated}...`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 border border-gray-200 flex flex-col h-full overflow-hidden">
      <div className="p-6 flex-grow">
        <Link to={`/post/${id}`} className="block mb-2 group">
          <h2 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-150 ease-in-out">
            {title}
          </h2>
        </Link>
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
          {truncateContent(content)}
        </p>
        {sortedCategories.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {sortedCategories.map((category, index) => (
              <span
                key={index}
                className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-0.5 rounded-full"
              >
                {category}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="px-6 pt-3 pb-4 bg-gray-50 border-t border-gray-100">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>{formatDisplayDate(date)}</span>
          <span>By: {author?.name || "Unknown Author"}</span>
        </div>
        {likeError && (
          <Alert
            message={likeError}
            type="error"
            title="Error"
            onClose={() => setLikeError(null)}
            className="mb-2 text-xs"
          />
        )}
        <div className="flex items-center justify-between">
          <button
            onClick={handleLikeToggle}
            disabled={isLiking || !loggedInUser}
            title={
              !loggedInUser
                ? "Log in to like"
                : isLiked
                ? "Unlike post"
                : "Like post"
            }
            className={`flex items-center transition-colors duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed rounded-md px-2 py-1 -ml-2 ${
              isLiked
                ? "text-blue-600 hover:text-blue-800"
                : "text-gray-500 hover:text-blue-600"
            }`}
          >
            {isLiking ? (
              <Spinner size="sm" className="mr-1.5 w-4 h-4" />
            ) : (
              <FontAwesomeIcon
                icon={isLiked ? faThumbsUpSolid : faThumbsUpRegular}
                className="mr-1.5 h-4 w-4"
              />
            )}
            <span className="text-sm font-medium">{displayLikes}</span>
            <span className="sr-only">Likes</span>
          </button>
          <Link
            to={`/post/${id}#comments`}
            title="View comments"
            className="flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors duration-150 ease-in-out rounded-md px-2 py-1 -mr-2"
          >
            <FontAwesomeIcon icon={faComment} className="mr-1.5 h-4 w-4" />
            {commentCount}
            <span className="sr-only">Comments</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
