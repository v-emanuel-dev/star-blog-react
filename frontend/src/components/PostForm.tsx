import { ChangeEvent, FC, FormEvent, useEffect, useState } from "react";
import { Post } from "../types";
import Spinner from "./Spinner";

interface PostFormData {
  title: string;
  content: string;
  date: string;
  categories: string;
}

type SubmitPostData = Omit<
  Post,
  | "id"
  | "author"
  | "likes"
  | "commentCount"
  | "likedByCurrentUser"
  | "createdAt"
  | "updatedAt"
  | "created_at"
  | "updated_at"
>;

type InitialPostData =
  | (Partial<Omit<Post, "id" | "categories">> & { categories?: string })
  | null;

interface PostFormProps {
  onSubmit: (postData: SubmitPostData) => void;
  initialData?: InitialPostData;
  isLoading?: boolean;
  submitButtonText?: string;
}

const defaultFormData: PostFormData = {
  title: "",
  content: "",
  date: new Date().toISOString().slice(0, 10),
  categories: "",
};

const PostForm: FC<PostFormProps> = ({
  onSubmit,
  initialData = null,
  isLoading = false,
  submitButtonText = "Save Post",
}) => {
  const [formData, setFormData] = useState<PostFormData>(defaultFormData);

  useEffect(() => {
    setFormData({
      title: initialData?.title || "",
      content: initialData?.content || "",
      date: initialData?.date || new Date().toISOString().slice(0, 10),
      categories: initialData?.categories || "",
    });
  }, [initialData]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const categoriesArray = formData.categories
      .split(",")
      .map((cat) => cat.trim())
      .filter(Boolean);

    const dataToSubmit: SubmitPostData = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      date: formData.date,
      categories: categoriesArray,
    };

    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Title:
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700"
        >
          Content:
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          rows={10}
          disabled={isLoading}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700"
        >
          Date:
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          disabled={isLoading}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="categories"
          className="block text-sm font-medium text-gray-700"
        >
          Categories (comma-separated):
        </label>
        <input
          type="text"
          id="categories"
          name="categories"
          value={formData.categories}
          onChange={handleChange}
          disabled={isLoading}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? (
            <>
              <Spinner size="sm" color="text-white" className="mr-2" />
              Saving...
            </>
          ) : (
            submitButtonText
          )}
        </button>
      </div>
    </form>
  );
};

export default PostForm;
