import React, { useState, useEffect, FC } from 'react';
import { Post } from '../types';

interface PostFormData {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  categories: string;
}

interface PostFormProps {
  onSubmit: (postData: Omit<Post, 'id'>) => void;
  initialData?: Omit<Post, 'id'> | null;
  isLoading?: boolean;
  submitButtonText?: string;
}

const defaultFormData: PostFormData = {
  title: '',
  excerpt: '',
  content: '',
  author: '',
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
        author: initialData.author || '',
        date: initialData.date || new Date().toISOString().slice(0, 10),
        categories: initialData.categories?.join(', ') || '',
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const categoriesArray = formData.categories
      .split(',')
      .map(cat => cat.trim())
      .filter(cat => cat !== '');

    const dataToSubmit: Omit<Post, 'id'> = {
      ...formData,
      categories: categoriesArray,
    };

    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title:</label>
        <input
          type="text" id="title" name="title" value={formData.title} onChange={handleChange} required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">Excerpt:</label>
        <textarea
          id="excerpt" name="excerpt" value={formData.excerpt} onChange={handleChange} rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content:</label>
        <textarea
          id="content" name="content" value={formData.content} onChange={handleChange} rows={10}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="author" className="block text-sm font-medium text-gray-700">Author:</label>
        <input
          type="text" id="author" name="author" value={formData.author} onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date (YYYY-MM-DD):</label>
        <input
          type="date" id="date" name="date" value={formData.date} onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="categories" className="block text-sm font-medium text-gray-700">Categories (comma-separated):</label>
        <input
          type="text" id="categories" name="categories" value={formData.categories} onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <button type="submit" disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Saving...' : submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default PostForm;
