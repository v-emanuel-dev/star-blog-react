import React, { FC, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Alert from "../components/Alert";
import PostCard from "../components/PostCard";
import Spinner from "../components/Spinner";
import { getAllPosts } from "../services/api";
import { Post } from "../types";

const HomePage: FC = () => {
  const location = useLocation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      setSearchTerm("");
      try {
        const fetchedPosts = await getAllPosts();
        setPosts(fetchedPosts);
        setFilteredPosts(fetchedPosts);
      } catch (err) {
        setError(
          err instanceof Error
            ? `Failed to load posts: ${err.message}`
            : "Unknown error."
        );
        setPosts([]);
        setFilteredPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [location]);

  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      setFilteredPosts(posts);
      return;
    }

    const filtered = posts.filter((post) => {
      const titleMatch = post.title.toLowerCase().includes(term);
      const contentMatch = post.content?.toLowerCase().includes(term) || false;
      const categoryMatch = post.categories?.some((c) =>
        c.toLowerCase().includes(term)
      );
      return titleMatch || contentMatch || categoryMatch;
    });

    setFilteredPosts(filtered);
  }, [searchTerm, posts]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-4 text-center">
        <Alert
          message={error}
          type="error"
          title="Error Loading Posts!"
          onClose={() => setError(null)}
        />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">Recent Articles</h1>
      <div className="mb-6">
        <label htmlFor="search" className="sr-only">
          Search Posts
        </label>
        <input
          type="search"
          id="search"
          name="search"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by title, content or category..."
          className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {posts.length > 0 &&
      filteredPosts.length === 0 &&
      searchTerm.trim() !== "" ? (
        <p className="text-gray-600 text-center py-4">
          No posts found matching your search '{searchTerm}'.
        </p>
      ) : posts.length === 0 && !loading ? (
        <p className="text-gray-600 text-center py-4">
          No posts available. Why not create one?
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              title={post.title}
              content={post.content}
              date={post.date}
              author={post.author}
              categories={post.categories}
              likes={post.likes}
              commentCount={post.commentCount}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
