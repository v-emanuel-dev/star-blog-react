import React, { FC, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { Post } from '../types';
import { getAllPosts } from '../services/api';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner'; // Ensure Spinner is imported

const HomePage: FC = () => {
    const location = useLocation();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPosts = async (): Promise<void> => {
            setLoading(true);
            setError(null);
            try {
                const fetchedPosts = await getAllPosts();
                setPosts(fetchedPosts);
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
    }, [location]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <Spinner size="lg" /> {/* Use Spinner */}
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
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Recent Articles</h1>
            {posts.length === 0 ? (
                <p className="text-gray-600">No posts found. Why not create one?</p>
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
                            likes={post.likes}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default HomePage;
