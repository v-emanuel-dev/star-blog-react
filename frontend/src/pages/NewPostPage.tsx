import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostForm from '../components/PostForm';
import { Post } from '../types';
import { createPost } from '../services/api';

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
      navigate('/');
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
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
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
