import React, { FC, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { Post } from '../types';
import { getAllPosts } from '../services/api';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

const HomePage: FC = () => {
    const location = useLocation();

    // State for the original list of posts from API
    const [posts, setPosts] = useState<Post[]>([]);
    // State for the posts actually displayed (filtered)
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
    // State for the search input value
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Loading and error states for fetching
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Effect 1: Fetch all posts when the component mounts or location changes
    useEffect(() => {
        const fetchPosts = async (): Promise<void> => {
            setLoading(true); setError(null); setSearchTerm(''); // Reset search on page load/nav
            try {
                const fetchedPosts = await getAllPosts();
                setPosts(fetchedPosts);
                setFilteredPosts(fetchedPosts); // Initialize filtered list with all posts
            } catch (err) {
                 setError(err instanceof Error ? `Failed to load posts: ${err.message}` : 'Unknown error.');
                 setPosts([]); setFilteredPosts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [location]); // Refetch if location changes (e.g., navigation back here)


    // Effect 2: Filter posts whenever the searchTerm or the original posts list changes
    useEffect(() => {
        // Start with all posts
        let currentFiltered = posts;

        // Apply filter only if searchTerm is not empty
        if (searchTerm.trim() !== '') {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            currentFiltered = posts.filter(post => {
                const titleMatch = post.title.toLowerCase().includes(lowerCaseSearchTerm);
                const excerptMatch = post.excerpt.toLowerCase().includes(lowerCaseSearchTerm);
                // Check if any category matches
                const categoryMatch = post.categories?.some(category =>
                    category.toLowerCase().includes(lowerCaseSearchTerm)
                );
                // Return true if any field matches
                return titleMatch || excerptMatch || categoryMatch;
            });
        }
        // Update the state holding the posts to be displayed
        setFilteredPosts(currentFiltered);

    }, [searchTerm, posts]); // Re-run this effect if search term or original posts change


    // Handler for the search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };


    // --- Render Logic ---

    if (loading) {
        return ( <div className="flex justify-center items-center py-10"> <Spinner size="lg" /> </div> );
    }

    if (error) {
        return ( <div className="px-4 sm:px-6 lg:px-8 py-4 text-center"> <Alert message={error} type="error" title="Error Loading Posts!" onClose={() => setError(null)} /> </div> );
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-3xl font-bold mb-4 text-gray-900">Recent Articles</h1>

            {/* Search Input */}
            <div className="mb-6">
                <label htmlFor="search" className="sr-only">Search Posts</label>
                <input
                    type="search"
                    id="search"
                    name="search"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search by title, excerpt, or category..."
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>

             {/* Conditional Display based on filtering */}
             {posts.length > 0 && filteredPosts.length === 0 && searchTerm.trim() !== '' ? (
                 // Show message if search yielded no results
                 <p className="text-gray-600 text-center py-4">No posts found matching your search '{searchTerm}'.</p>
             ) : posts.length === 0 && !loading ? (
                 // Show message if no posts loaded initially
                  <p className="text-gray-600 text-center py-4">No posts available. Why not create one?</p>
             ) : (
                 // Display the filtered posts grid
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {filteredPosts.map(post => (
                         <PostCard
                             key={post.id}
                             id={post.id}
                             title={post.title}
                             excerpt={post.excerpt}
                             date={post.date}
                             author={post.author}
                             categories={post.categories}
                             likes={post.likes}
                             commentCount={post.commentCount}
                             // likedByCurrentUser={false} // Not available in list view
                         />
                     ))}
                 </div>
             )}
        </div>
    );
};

export default HomePage;