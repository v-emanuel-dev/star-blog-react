import React, { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostForm from '../components/PostForm';
import { Post } from '../types';
import { createPost } from '../services/api';
import Alert from '../components/Alert'; // Import Alert

const NewPostPage: FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreatePost = async (postData: Omit<Post, 'id'>) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await createPost(postData);
            console.log('Post created with ID:', result.insertedId);
            navigate('/', { replace: true });
        } catch (err) {
            console.error("Error creating post:", err);
            if (err instanceof Error) {
                setError(`Error creating post: ${err.message}`);
            } else {
                setError("An unknown error occurred.");
            }
            setIsLoading(false);
        }
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6 text-gray-900">Create New Post</h1>
                {error && (
                    <Alert
                        message={error}
                        type="error"
                        title="Error Creating Post!"
                        onClose={() => setError(null)}
                    />
                )}
                <PostForm
                    onSubmit={handleCreatePost}
                    isLoading={isLoading}
                    submitButtonText="Create Post"
                />
            </div>
        </div>
    );
};

export default NewPostPage;
