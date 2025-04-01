import React, { useState, useEffect, FC, ChangeEvent, FormEvent } from 'react';
import { Post } from '../types'; // Assuming Post type still needed for Omit

// Interface for the form's internal state (NO author field)
interface PostFormData {
  title: string;
  excerpt: string;
  content: string;
  // Removed author: string;
  date: string;
  categories: string; // Still string for comma-separated input
}

// Type for the data structure expected by onSubmit (NO author field)
// Omit id AND author from the base Post type
type SubmitPostData = Omit<Post, 'id' | 'author'>;

// Type for initialData prop (author still received as object, but not used for a form field)
type InitialPostData = Omit<Post, 'id'> | null;


interface PostFormProps {
  onSubmit: (postData: SubmitPostData) => void;
  initialData?: InitialPostData; // Contains author object, but we won't use it for an input
  isLoading?: boolean;
  submitButtonText?: string;
}

// Default state without author
const defaultFormData: PostFormData = {
  title: '',
  excerpt: '',
  content: '',
  date: new Date().toISOString().slice(0, 10),
  categories: '',
};

const PostForm: FC<PostFormProps> = ({
  onSubmit,
  initialData = null,
  isLoading = false,
  submitButtonText = 'Save Post'
}) => {
  const [formData, setFormData] = useState<PostFormData>(defaultFormData);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        excerpt: initialData.excerpt || '',
        content: initialData.content || '',
        date: initialData.date || new Date().toISOString().slice(0, 10),
        // Convert categories array to string, author is ignored here
        categories: (initialData.categories || []).join(', '),
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [initialData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value, }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const categoriesArray = formData.categories.split(',').map(cat => cat.trim()).filter(cat => cat !== '');
    // Prepare data for submission (matches SubmitPostData type)
    const dataToSubmit: SubmitPostData = {
      title: formData.title,
      excerpt: formData.excerpt,
      content: formData.content,
      date: formData.date,
      categories: categoriesArray,
      // Author is NOT included here, backend uses logged-in user
      // Also removed likes, commentCount, createdAt etc. as they aren't submitted
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
        <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">Excerpt:</label>
        <textarea id="excerpt" name="excerpt" value={formData.excerpt} onChange={handleChange} rows={3} disabled={isLoading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content:</label>
        <textarea id="content" name="content" value={formData.content} onChange={handleChange} rows={10} disabled={isLoading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
      </div>
      {/* REMOVED Author Input Field Div */}
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
          {isLoading ? 'Saving...' : submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default PostForm;
