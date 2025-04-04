import React, { useState, useEffect, FC, ChangeEvent, FormEvent } from 'react';
import { Post } from '../types';
import Spinner from './Spinner'; // Import Spinner for button

// Interface for the form's internal state
interface PostFormData {
  title: string;
  content: string;
  date: string;
  categories: string; // Form state uses string
}

// Data structure expected by onSubmit prop (excludes fields not in form)
type SubmitPostData = Omit<Post, 'id' | 'author' | 'likes' | 'commentCount' | 'likedByCurrentUser' | 'createdAt' | 'updatedAt' | 'created_at' | 'updated_at'>;

// Type for initialData prop (categories received as string from EditPostPage)
type InitialPostData = Partial<Omit<Post, 'id' | 'categories'>> & { categories?: string } | null;

interface PostFormProps {
  onSubmit: (postData: SubmitPostData) => void;
  initialData?: InitialPostData;
  isLoading?: boolean;
  submitButtonText?: string;
}

const defaultFormData: PostFormData = {
  title: '', content: '',
  date: new Date().toISOString().slice(0, 10),
  categories: '',
};

const PostForm: FC<PostFormProps> = ({
  onSubmit, initialData = null, isLoading = false, submitButtonText = 'Save Post'
}) => {
  const [formData, setFormData] = useState<PostFormData>(defaultFormData);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        date: initialData.date || new Date().toISOString().slice(0, 10),
        // Correctly uses the string passed in initialData
        categories: initialData.categories || '',
      });
    } else {
      // Reset to default when no initialData (e.g., for NewPostPage)
      setFormData(defaultFormData);
    }
  }, [initialData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Convert comma-separated string back to array for submission
    const categoriesArray = formData.categories.split(',').map(cat => cat.trim()).filter(cat => cat !== '');
    const dataToSubmit: SubmitPostData = {
      title: formData.title,
      content: formData.content,
      date: formData.date,
      categories: categoriesArray,
    };
    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title:</label>
        <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required disabled={isLoading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content:</label>
        <textarea id="content" name="content" value={formData.content} onChange={handleChange} rows={10} disabled={isLoading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
      </div>
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date (YYYY-MM-DD):</label>
        <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} disabled={isLoading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
      </div>
      <div>
        <label htmlFor="categories" className="block text-sm font-medium text-gray-700">Categories (comma-separated):</label>
        <input type="text" id="categories" name="categories" value={formData.categories} onChange={handleChange} disabled={isLoading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
      </div>
      <div>
        <button type="submit" disabled={isLoading} className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {isLoading ? (<><Spinner size="sm" color="text-white" className="mr-2"/>Saving...</>) : submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default PostForm;