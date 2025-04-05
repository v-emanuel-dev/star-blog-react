import { FC, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Alert from '../components/Alert';
import PostForm from '../components/PostForm';
import Spinner from '../components/Spinner';
import { getPostById, updatePost } from '../services/api';
import { Post } from '../types';

type PostFormData = Omit<Post, 'id'>;

const EditPostPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
        const fetchedPost = await getPostById(id);
        const initialData: PostFormData = {
          title: fetchedPost.title,
          content: fetchedPost.content || '',
          author: fetchedPost.author || '',
          date: fetchedPost.date || '',
          categories: (fetchedPost.categories || []).join(', '),
        };
        setPost(initialData);
      } catch (err) {
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
      await updatePost(id, postData);
      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        setError(`Error saving changes: ${err.message}`);
      } else {
        setError("An unknown error occurred while saving.");
      }
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }

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
            isLoading={isSaving}
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
