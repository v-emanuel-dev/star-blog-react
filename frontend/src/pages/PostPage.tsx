import React, {
  FC,
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  useCallback,
} from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Post, Comment } from "../types";
import {
  getPostById,
  deletePost,
  getCommentsForPost,
  addComment,
  editComment,
  deleteComment,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";
import Spinner from "../components/Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrashAlt,
  faSave,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { formatDisplayDate, formatDisplayDateTime } from "../utils/dateUtils";

const DefaultAvatar: FC<{ className?: string }> = ({
  className = "h-full w-full text-gray-400",
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
    ></path>
  </svg>
);
const BACKEND_URL = "http://localhost:4000";

interface PostParams {
  id: string;
  [key: string]: string;
}

const PostPage: FC = () => {
  const { id } = useParams<PostParams>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: loggedInUser, token } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // For post loading/deleting errors
  const [isDeletingPost, setIsDeletingPost] = useState<boolean>(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(true);
  const [commentsError, setCommentsError] = useState<string | null>(null); // For comment fetch/add/edit/delete errors

  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // State needed for comment editing
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedCommentContent, setEditedCommentContent] = useState<string>("");
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  // State needed for comment deleting
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null
  );

  const getAvatarSrc = useCallback(
    (avatarPath: string | null | undefined): string | null => {
      if (!avatarPath) return null;
      if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://"))
        return avatarPath;
      return `${BACKEND_URL}${avatarPath}`;
    },
    []
  );

  useEffect(() => {
    if (!id) {
      setError("Invalid post ID.");
      setLoading(false);
      return;
    }
    let isMounted = true;
    const fetchPostAndComments = async () => {
      setLoading(true);
      setCommentsLoading(true);
      setError(null);
      setCommentsError(null);
      try {
        const [fetchedPost, fetchedComments] = await Promise.all([
          getPostById(id),
          getCommentsForPost(id),
        ]);
        if (isMounted) {
          setPost(fetchedPost);
          setComments(fetchedComments);
        }
      } catch (err) {
        if (isMounted) {
          const errorMsg =
            err instanceof Error ? err.message : "Unknown error.";
          setError(`Failed to load post or comments: ${errorMsg}`);
          setPost(null);
          setComments([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setCommentsLoading(false);
        }
      }
    };
    fetchPostAndComments();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDeletePost = async () => {
    if (!id || !post) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the post "${post.title}"?`
    );
    if (confirmDelete) {
      setIsDeletingPost(true);
      setError(null);
      try {
        await deletePost(id);
        navigate("/", { replace: true });
      } catch (err) {
        setError(
          err instanceof Error
            ? `Error deleting post: ${err.message}`
            : "Unknown error."
        );
        setIsDeletingPost(false);
      }
    }
  };

  const handleCommentSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id || !newComment.trim() || !token) return;
    setIsSubmittingComment(true);
    setCommentsError(null);
    try {
      const addedComment = await addComment(id, { content: newComment.trim() });
      setComments((prevComments) => [addedComment, ...prevComments]);
      setNewComment("");
    } catch (err) {
      setCommentsError(
        err instanceof Error
          ? `Failed to add comment: ${err.message}`
          : "Unknown error."
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleEditClick = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditedCommentContent(comment.content);
    setCommentsError(null);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedCommentContent("");
  };

  const handleSaveEdit = async (commentId: number) => {
    if (!token || !editedCommentContent.trim()) return;
    setIsSavingEdit(true);
    setCommentsError(null);
    try {
      const result = await editComment(commentId, {
        content: editedCommentContent.trim(),
      });
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? result.comment : c))
      );
      handleCancelEdit();
    } catch (err) {
      setCommentsError(
        err instanceof Error
          ? `Failed to update comment: ${err.message}`
          : "Unknown error."
      );
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!token) return;
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this comment?"
    );
    if (confirmDelete) {
      setDeletingCommentId(commentId);
      setCommentsError(null);
      try {
        await deleteComment(commentId);
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } catch (err) {
        setCommentsError(
          err instanceof Error
            ? `Failed to delete comment: ${err.message}`
            : "Unknown error."
        );
      } finally {
        setDeletingCommentId(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }
  if (error && !post) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-4 text-center">
        <Alert
          message={error}
          type="error"
          title="Error!"
          onClose={() => setError(null)}
        />
        <Link
          to="/"
          className="text-blue-500 hover:underline mt-4 inline-block"
        >
          Back to homepage
        </Link>
      </div>
    );
  }
  if (!post) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">
          Post not found
        </h1>
        <Link to="/" className="text-blue-500 hover:underline">
          Back to homepage
        </Link>
      </div>
    );
  }

  const sortedCategories = (post.categories || [])
    .slice()
    .sort((a, b) => a.localeCompare(b));

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
      <article className="bg-white rounded-lg shadow-md p-6 relative pb-10 mb-8">
        {loggedInUser && post?.author && loggedInUser.id === post.author.id && (
          <div className="sm:absolute sm:top-4 sm:right-4 flex flex-wrap gap-2 mb-4 sm:mb-0 justify-end">
            <Link
              to={`/edit-post/${post.id}`}
              className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold py-1 px-3 rounded transition duration-150 ease-in-out"
            >
              Edit Post
            </Link>
            <button
              onClick={handleDeletePost}
              disabled={isDeletingPost}
              className={`bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-1 px-3 rounded transition duration-150 ease-in-out ${
                isDeletingPost ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isDeletingPost ? "Deleting..." : "Delete Post"}
            </button>
          </div>
        )}
        <h1 className="text-3xl font-bold mb-4 text-gray-900 sm:pr-32">
          {post.title}
        </h1>
        {/* Use sortedCategories here */}
        {sortedCategories.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1">
            {sortedCategories.map((category, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
              >
                {category}
              </span>
            ))}
          </div>
        )}
        <div className="text-gray-500 mb-6">
          <span>{formatDisplayDate(post?.date)}</span> •{" "}
          <span>By: {post.author?.name || "Unknown Author"}</span>
        </div>
        <div className="prose max-w-none">
          {post.content ? (
            <p className="text-gray-700">{post.content}</p>
          ) : (
            <p className="text-gray-500 italic">(Full content not available)</p>
          )}
        </div>
        <div className="mt-8 pt-4 border-t">
          <Link to="/" className="text-blue-500 hover:underline">
            ← Back to posts list
          </Link>
        </div>
      </article>

      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Comments ({comments.length})
        </h2>
        {loggedInUser ? (
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <label
              htmlFor="newComment"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Add a comment:
            </label>
            <textarea
              id="newComment"
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your thoughts..."
              required
              disabled={isSubmittingComment}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50"
            />
            {commentsError && (
              <Alert
                message={commentsError}
                type="error"
                title="Error!"
                onClose={() => setCommentsError(null)}
                className="mt-2 text-xs"
              />
            )}
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingComment || !newComment.trim()}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmittingComment ? (
                  <Spinner size="sm" color="text-white" className="mr-2" />
                ) : null}
                {isSubmittingComment ? "Submitting..." : "Submit Comment"}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-gray-600 mb-6">
            Please{" "}
            <Link
              to="/login"
              state={{ from: location }}
              className="text-indigo-600 hover:underline"
            >
              log in
            </Link>{" "}
            to add a comment.
          </p>
        )}
        <div className="space-y-6">
          {commentsLoading ? (
            <div className="flex justify-center py-6">
              <Spinner size="md" />
            </div>
          ) : commentsError && !isSubmittingComment ? (
            <Alert
              message={commentsError}
              type="error"
              title="Could not load comments"
              onClose={() => setCommentsError(null)}
            />
          ) : comments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Be the first to comment!
            </p>
          ) : (
            comments.map((comment) => {
              const commentAvatarSrc = getAvatarSrc(comment.user?.avatarUrl);
              const isEditingThisComment = editingCommentId === comment.id;
              const isDeletingThisComment = deletingCommentId === comment.id;
              const userCanModify =
                loggedInUser && loggedInUser.id === comment.user?.id;

              return (
                <div
                  key={comment.id}
                  className={`flex space-x-3 border-b border-gray-200 pb-4 last:border-b-0 ${
                    isDeletingThisComment ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex-shrink-0">
                    {commentAvatarSrc ? (
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={commentAvatarSrc}
                        alt={`${comment.user?.name || "User"}'s avatar`}
                      />
                    ) : (
                      <span className="inline-block h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                        <DefaultAvatar className="h-full w-full text-gray-400" />
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {comment.user?.name || "Anonymous"}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {formatDisplayDateTime(comment.createdAt)}
                        </span>
                        {comment.updatedAt &&
                          comment.updatedAt !== comment.createdAt && (
                            <span className="text-xs text-gray-400 italic ml-2">
                              (edited)
                            </span>
                          )}
                      </div>
                      {userCanModify && !isEditingThisComment && (
                        <div className="flex space-x-2 flex-shrink-0 ml-2">
                          <button
                            onClick={() => handleEditClick(comment)}
                            title="Edit comment"
                            className="text-gray-400 hover:text-blue-600 disabled:opacity-50"
                            disabled={isSavingEdit || !!deletingCommentId}
                          >
                            <FontAwesomeIcon
                              icon={faEdit}
                              className="h-3 w-3"
                            />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            title="Delete comment"
                            className="text-gray-400 hover:text-red-600 disabled:opacity-50"
                            disabled={
                              isSavingEdit ||
                              !!deletingCommentId ||
                              isDeletingThisComment
                            }
                          >
                            {isDeletingThisComment ? (
                              <Spinner size="sm" />
                            ) : (
                              <FontAwesomeIcon
                                icon={faTrashAlt}
                                className="h-3 w-3"
                              />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                    {isEditingThisComment ? (
                      <div className="mt-2">
                        <textarea
                          value={editedCommentContent}
                          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                            setEditedCommentContent(e.target.value)
                          }
                          rows={3}
                          disabled={isSavingEdit}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50"
                        />
                        <div className="mt-2 flex justify-end space-x-2">
                          <button
                            onClick={() => handleSaveEdit(comment.id)}
                            disabled={
                              isSavingEdit ||
                              editedCommentContent === comment.content
                            }
                            className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {isSavingEdit ? (
                              <Spinner
                                size="sm"
                                color="text-white"
                                className="mr-1"
                              />
                            ) : (
                              <FontAwesomeIcon
                                icon={faSave}
                                className="h-3 w-3 mr-1"
                              />
                            )}{" "}
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={isSavingEdit}
                            className={`inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50`}
                          >
                            <FontAwesomeIcon
                              icon={faTimes}
                              className="h-3 w-3 mr-1"
                            />{" "}
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
export default PostPage;
