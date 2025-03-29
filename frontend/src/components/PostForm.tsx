import React, { useState, useEffect, FC } from 'react';
import { Post } from '../types'; // O tipo Post ainda é usado nas props

// 1. DEFINIR UMA INTERFACE PARA O ESTADO DO FORMULÁRIO
interface PostFormData {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string; // Mantém como string para o input type="date"
  categories: string; // Define categories como string aqui
}

// Define as props que o formulário receberá (sem alterações aqui)
interface PostFormProps {
  onSubmit: (postData: Omit<Post, 'id'>) => void; // Espera categories: string[]
  initialData?: Omit<Post, 'id'> | null;       // Fornece categories: string[] | undefined
  isLoading?: boolean;
  submitButtonText?: string;
}

// 2. USAR A NOVA INTERFACE PARA O ESTADO INICIAL
const defaultFormData: PostFormData = {
  title: '',
  excerpt: '',
  content: '',
  author: '',
  date: new Date().toISOString().slice(0, 10),
  categories: '', // Agora 'string' é compatível com PostFormData.categories
};

const PostForm: FC<PostFormProps> = ({
  onSubmit,
  initialData = null,
  isLoading = false,
  submitButtonText = 'Salvar Post'
}) => {
  // 3. USAR A NOVA INTERFACE NO useState
  const [formData, setFormData] = useState<PostFormData>(defaultFormData);

  // Efeito para preencher o formulário (lógica interna correta)
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        excerpt: initialData.excerpt || '',
        content: initialData.content || '',
        author: initialData.author || '',
        date: initialData.date || new Date().toISOString().slice(0, 10),
        // Converte array (string[] | undefined) para string (ok)
        categories: initialData.categories?.join(', ') || '',
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [initialData]);

  // Manipulador de mudança (sem alterações)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Manipulador de submit (lógica interna correta)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Converte a string (formData.categories) para array (string[]) (ok)
    const categoriesArray = formData.categories
                              .split(',')
                              .map(cat => cat.trim())
                              .filter(cat => cat !== '');

    // Prepara os dados para enviar (ok)
    const dataToSubmit: Omit<Post, 'id'> = {
      ...formData,
      categories: categoriesArray, // Envia 'categories' como array string[]
    };

    onSubmit(dataToSubmit); // Chama a prop onSubmit, que espera Omit<Post, 'id'>
  };

  return (
    // O JSX do formulário permanece o mesmo
    <form onSubmit={handleSubmit} className="space-y-4">
       <div>
         <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título:</label>
         <input
           type="text" id="title" name="title" value={formData.title} onChange={handleChange} required
           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
         />
       </div>
       <div>
         <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">Resumo (Excerpt):</label>
         <textarea
           id="excerpt" name="excerpt" value={formData.excerpt} onChange={handleChange} rows={3}
           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
         />
       </div>
       <div>
         <label htmlFor="content" className="block text-sm font-medium text-gray-700">Conteúdo:</label>
         <textarea
           id="content" name="content" value={formData.content} onChange={handleChange} rows={10}
           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
         />
       </div>
        <div>
         <label htmlFor="author" className="block text-sm font-medium text-gray-700">Autor:</label>
         <input
           type="text" id="author" name="author" value={formData.author} onChange={handleChange}
           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
         />
       </div>
        <div>
         <label htmlFor="date" className="block text-sm font-medium text-gray-700">Data (YYYY-MM-DD):</label>
         <input
           type="date" id="date" name="date" value={formData.date} onChange={handleChange}
           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
         />
       </div>
        <div>
         <label htmlFor="categories" className="block text-sm font-medium text-gray-700">Categorias (separadas por vírgula):</label>
         <input
           type="text" id="categories" name="categories" value={formData.categories} onChange={handleChange}
           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
         />
       </div>
       <div>
         <button type="submit" disabled={isLoading}
           className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
         >
           {isLoading ? 'Salvando...' : submitButtonText}
         </button>
       </div>
     </form>
  );
};

export default PostForm;