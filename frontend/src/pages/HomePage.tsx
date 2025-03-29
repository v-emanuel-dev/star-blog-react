// src/pages/HomePage.tsx
import { FC, useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import { Post } from '../types';

// NOVA URL BASE apontando para o nosso backend Node.js/Express
const API_BASE_URL = 'http://localhost:4000'; // Ou a porta que você definiu no .env do backend

const HomePage: FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        // Atualiza a URL do fetch para usar a nova base e o caminho da API
        const response = await fetch(`${API_BASE_URL}/api/posts`); // <-- MUDANÇA AQUI

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: { id: number; title: string; excerpt: string; date: string; author: string; categories: string | string[] }[] = await response.json(); // Define a estrutura esperada

        // **IMPORTANTE: Parse do JSON de 'categories'**
        // O MySQL retorna colunas JSON como strings. Precisamos converter de volta para array.
        const parsedPosts = data.map(post => ({
            ...post,
            categories: (typeof post.categories === 'string') ? JSON.parse(post.categories) : post.categories ?? []
            // Tenta fazer o parse se for string, senão usa o valor que veio ou um array vazio
        }));

        setPosts(parsedPosts as Post[]); // Define o estado com os posts parseados

      } catch (err) {
        console.error('Erro ao buscar posts:', err);
        if (err instanceof Error) {
          setError(`Falha ao carregar posts: ${err.message}`);
        } else {
           setError('Falha ao carregar posts: Erro desconhecido.');
        }
         setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // --- Renderização (sem alterações no JSX) ---
  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-center">
        <div className="animate-pulse text-xl text-gray-700">Carregando posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-4 text-center">
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Artigos Recentes</h1>
      {posts.length === 0 ? (
          <p className="text-gray-600">Nenhum post encontrado.</p>
      ) : (
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
             {posts.map(post => (
               <PostCard
                 key={post.id}
                 id={post.id}
                 title={post.title}
                 excerpt={post.excerpt}
                 date={post.date}
                 author={post.author}
                 categories={post.categories} // Agora deve ser um array
               />
             ))}
           </div>
      )}
    </div>
  );
};

export default HomePage;