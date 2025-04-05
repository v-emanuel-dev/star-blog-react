import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import PostForm from "../components/PostForm";
import { createPost } from "../services/api";
import { Post } from "../types";

type PostInput = Omit<
  Post,
  | "id"
  | "author"
  | "likes"
  | "commentCount"
  | "likedByCurrentUser"
  | "createdAt"
  | "updatedAt"
  | "excerpt"
>;

const NewPostPage: FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreatePost = async (postData: PostInput) => {
    setIsLoading(true);
    setError(null);

    try {
      await createPost(postData);
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? `Error creating post: ${err.message}`
          : "An unknown error occurred."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          Create New Post
        </h1>

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
