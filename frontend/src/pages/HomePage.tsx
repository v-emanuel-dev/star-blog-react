// src/pages/HomePage.tsx
import { FC, useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import { Post } from '../types';
// REMOVE a linha abaixo - não vamos mais importar os dados mockados
// import { posts as postsData } from '../data/posts';

// Definindo a URL base da nossa API falsa
const API_URL = 'http://localhost:3001';

const HomePage: FC = () => {
  // Os estados permanecem os mesmos
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // Estado para guardar mensagens de erro

  useEffect(() => {
    // Função assíncrona para buscar os posts
    const fetchPosts = async (): Promise<void> => {
      // Reinicia o estado de erro e loading
      setLoading(true);
      setError(null);
      try {
        // Faz a requisição GET para a API do json-server
        const response = await fetch(`${API_URL}/posts`);

        // Verifica se a resposta da rede foi bem-sucedida (status 2xx)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Converte a resposta para JSON
        const data: Post[] = await response.json();

        // Atualiza o estado com os posts recebidos
        setPosts(data);

      } catch (err) {
        // Se ocorrer um erro na requisição ou processamento
        console.error('Erro ao buscar posts:', err);
        if (err instanceof Error) {
          setError(`Falha ao carregar posts: ${err.message}`);
        } else {
           setError('Falha ao carregar posts: Erro desconhecido.');
        }
         setPosts([]); // Limpa posts antigos em caso de erro
      } finally {
        // Garante que o loading seja desativado, ocorrendo erro ou não
        setLoading(false);
      }
    };

    fetchPosts(); // Chama a função de busca ao montar o componente
  }, []); // Array de dependências vazio, executa apenas uma vez

  // --- Renderização Condicional ---

  if (loading) {
    // Mantém o estado de loading como antes
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-center">
        <div className="animate-pulse text-xl text-gray-700">Carregando posts...</div>
      </div>
    );
  }

  if (error) {
    // Mostra uma mensagem de erro se a busca falhar
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
                 categories={post.categories}
               />
             ))}
           </div>
      )}
    </div>
  );
};

export default HomePage;