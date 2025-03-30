import React, { FC, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Post } from '../types';
import { getPostById, deletePost } from '../services/api';

interface PostParams {
  id: string;
  [key: string]: string;
}

const PostPage: FC = () => {
  const { id } = useParams<PostParams>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Invalid post ID.");
      setLoading(false);
      return;
    }
    const fetchPost = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const fetchedPost: Post = await getPostById(id);
        setPost(fetchedPost);
      } catch (err) {
        console.error(`Error fetching post ${id}:`, err);
        if (err instanceof Error) {
          setError(`Failed to load post: ${err.message}`);
        } else {
          setError('Failed to load post: Unknown error.');
        }
        setPost(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !post) {
        console.error("Attempt to delete without ID or post loaded.");
        return;
    }

    const confirmDelete = window.confirm(`Are you sure you want to delete the post "${post.title}"? This action cannot be undone.`);

    if (confirmDelete) {
      setIsDeleting(true);
      setError(null);
      try {
        await deletePost(id);
        console.log(`Post ${id} deleted successfully.`);
        navigate('/');
      } catch (err) {
        console.error("Error deleting post:", err);
        if (err instanceof Error) {
          setError(`Error deleting: ${err.message}`);
        } else {
          setError("An unknown error occurred while deleting.");
        }
        setIsDeleting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-center">
        <div className="animate-pulse text-xl text-gray-700">Loading post...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-4 text-center">
        <p className="text-red-600 font-semibold">{error}</p>
        {(post || !error.includes('Post not found')) && (
            <Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">
             Back to homepage
            </Link>
        )}
      </div>
    );
  }

  if (!post) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Post not found</h1>
        <Link to="/" className="text-blue-500 hover:underline">
          Back to homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
      <article className="bg-white rounded-lg shadow-md p-6 relative pb-10">
        <div className="absolute top-4 right-4 flex space-x-2 z-10">
          <Link
            to={`/edit-post/${post.id}`}
            className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold py-1 px-3 rounded transition duration-150 ease-in-out"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-1 px-3 rounded transition duration-150 ease-in-out ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-4 text-gray-900 pr-24">{post.title}</h1>

        {post.categories && post.categories.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1">
            {post.categories.map((category, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {category}
              </span>
            ))}
          </div>
        )}

        <div className="text-gray-500 mb-6">
          <span>{post.date}</span> • <span>By: {post.author}</span>
        </div>

        <div className="prose max-w-none mb-6">
            <p className="text-gray-700">{post.excerpt}</p>
        </div>
        <div className="prose max-w-none">
          {post.content ? (
            <p className="text-gray-700">{post.content}</p>
          ) : (
             <p className="text-gray-500 italic">(Full content not available)</p>
          )}
        </div>

        <div className="mt-8 pt-4 border-t flex justify-between items-center">
          <Link to="/" className="text-blue-500 hover:underline">
            ← Back to posts list
          </Link>
        </div>
      </article>
    </div>
  );
};

export default PostPage;
