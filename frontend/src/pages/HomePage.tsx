import { FC, useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import { Post } from '../types';

const API_BASE_URL = 'http://localhost:4000'; // Or the port defined in your backend .env

const HomePage: FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/posts`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: { id: number; title: string; excerpt: string; date: string; author: string; categories: string | string[] }[] = await response.json();

        const parsedPosts = data.map(post => ({
          ...post,
          categories: (typeof post.categories === 'string') ? JSON.parse(post.categories) : post.categories ?? []
        }));

        setPosts(parsedPosts as Post[]);

      } catch (err) {
        console.error('Error fetching posts:', err);
        if (err instanceof Error) {
          setError(`Failed to load posts: ${err.message}`);
        } else {
          setError('Failed to load posts: Unknown error.');
        }
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-center">
        <div className="animate-pulse text-xl text-gray-700">Loading posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-4 text-center">
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Recent Articles</h1>
      {posts.length === 0 ? (
        <p className="text-gray-600">No posts found.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <PostCard
              key={post.id}
              id={post.id}
              title={post.title}
              excerpt={post.excerpt}
              date={post.date}
              author={post.author}
              categories={post.categories}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
