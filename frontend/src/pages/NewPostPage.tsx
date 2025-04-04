import React, { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostForm from '../components/PostForm';
import { Post } from '../types'; // Only needed for Omit type
import { createPost } from '../services/api';
import Alert from '../components/Alert';

// Type expected by handleCreatePost from PostForm's onSubmit
type CreatePostData = Omit<Post, 'id' | 'author' | 'likes' | 'commentCount' | 'likedByCurrentUser' | 'createdAt' | 'updatedAt' | 'excerpt'>;


const NewPostPage: FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Correctly typed postData matches SubmitPostData from PostForm
    const handleCreatePost = async (postData: CreatePostData) => {
        setIsLoading(true);
        setError(null);
        try {
            // createPost expects PostInputData which matches CreatePostData
            const result = await createPost(postData);
            navigate('/', { replace: true });
        } catch (err) {
            setError(err instanceof Error ? `Error creating post: ${err.message}` : "An unknown error occurred.");
            setIsLoading(false);
        }
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6 text-gray-900">Create New Post</h1>
                {error && (
                    <Alert message={error} type="error" title="Error Creating Post!" onClose={() => setError(null)} />
                )}
                <PostForm
                    onSubmit={handleCreatePost}
                    isLoading={isLoading}
                    submitButtonText="Create Post"
                    // No initialData provided
                />
            </div>
        </div>
    );
};

export default NewPostPage;