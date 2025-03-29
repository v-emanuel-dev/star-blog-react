// src/pages/HomePage.tsx
import { FC, useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import { Post } from '../types';
import { posts as postsData } from '../data/posts';

const HomePage: FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPosts = async (): Promise<void> => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPosts(postsData);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar posts:', error);
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) {
    // CORRIGIDO: Removido 'container mx-auto p-4', adicionado padding e mantido flex
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-center"> {/* <-- Adicione bg-yellow-300 aqui */}
        <div className="animate-pulse text-xl text-gray-700">Carregando posts...</div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Artigos Recentes</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <PostCard
            key={post.id}
            id={post.id}
            title={post.title}
            excerpt={post.excerpt}
            date={post.date}
            author={post.author}
            categories={post.categories}
          />
        ))}
      </div>
    </div>
  );
};

export default HomePage;