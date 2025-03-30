import React, { FC, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PostForm from '../components/PostForm';
import { Post } from '../types';
import { getPostById, updatePost } from '../services/api';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner'; // Ensure Spinner is imported

type PostFormData = Omit<Post, 'id'>;

const EditPostPage: FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<PostFormData | null>(null);
    const [isLoading, setIsLoading] = useState(true); // For initial fetch
    const [isSaving, setIsSaving] = useState(false); // For submission
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError("Post ID not provided in the URL.");
            setIsLoading(false);
            return;
        }
        const fetchPostData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const fetchedPost: Post = await getPostById(id);
                const initialData: PostFormData = {
                    title: fetchedPost.title,
                    excerpt: fetchedPost.excerpt || '',
                    content: fetchedPost.content || '',
                    author: fetchedPost.author || '',
                    date: fetchedPost.date || '',
                    categories: (fetchedPost.categories || []).join(', '),
                };
                setPost(initialData);
            } catch (err) {
                 console.error("Error fetching post for editing:", err);
                 if (err instanceof Error) {
                    setError(`Error loading post: ${err.message}`);
                 } else {
                    setError("An unknown error occurred while loading the post.");
                 }
                 setPost(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPostData();
    }, [id]);

    const handleUpdatePost = async (postData: PostFormData) => {
        if (!id) {
            setError("Cannot update: Post ID is missing.");
            return;
        }
        setIsSaving(true);
        setError(null);
        try {
            const result = await updatePost(id, postData);
            console.log('Post updated:', result.post);
            navigate('/', { replace: true });
        } catch (err) {
            console.error("Error updating post:", err);
            if (err instanceof Error) {
                setError(`Error saving changes: ${err.message}`);
            } else {
                setError("An unknown error occurred while saving.");
            }
            setIsSaving(false);
        }
    };

    if (isLoading) { // Initial data loading
         return (
             <div className="flex justify-center items-center py-10">
                  <Spinner size="lg" /> {/* Use Spinner */}
             </div>
         );
     }

    // Error during initial load
    if (error && !post && !isSaving) {
        return (
            <div className="px-4 sm:px-6 lg:px-8 py-4 text-center">
                 <Alert
                    message={error}
                    type="error"
                    title="Error Loading!"
                    onClose={() => setError(null)}
                />
                <Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">
                    Back to homepage
                </Link>
            </div>
        );
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6 text-gray-900">Edit Post</h1>
                {/* Saving error display */}
                {error && !isLoading && (
                    <Alert
                        message={error}
                        type="error"
                        title="Error Saving!"
                        onClose={() => setError(null)}
                    />
                )}
                {post ? (
                    <PostForm
                        onSubmit={handleUpdatePost}
                        initialData={post}
                        isLoading={isSaving} // Use isSaving for the button state
                        submitButtonText="Update Post"
                    />
                ) : (
                     !error && <p className="text-center text-gray-500">Post data not available.</p>
                )}
            </div>
        </div>
    );
};
export default EditPostPage;
