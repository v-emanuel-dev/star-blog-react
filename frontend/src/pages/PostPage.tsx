// src/pages/PostPage.tsx
import { FC, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Post } from '../types';

// NOVA URL BASE
const API_BASE_URL = 'http://localhost:4000';

interface PostParams {
  id: string;
  [key: string]: string;
}

const PostPage: FC = () => {
  const { id } = useParams<PostParams>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
        setError("ID do post inválido.");
        setLoading(false);
        return;
    }

    const fetchPost = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        // Atualiza a URL do fetch
        const response = await fetch(`${API_BASE_URL}/api/posts/${id}`); // <-- MUDANÇA AQUI

        if (!response.ok) {
          if (response.status === 404) {
             throw new Error('Post não encontrado.');
          } else {
             throw new Error(`HTTP error! status: ${response.status}`);
          }
        }

        const data: Post = await response.json(); // Esperamos um objeto do tipo Post

         // **IMPORTANTE: Parse do JSON de 'categories' para o post único**
         const parsedPost = {
            ...data,
            categories: (typeof data.categories === 'string') ? JSON.parse(data.categories) : data.categories ?? []
         };

        setPost(parsedPost as Post); // Define o estado com o post parseado

      } catch (err) {
        console.error(`Erro ao buscar post ${id}:`, err);
         if (err instanceof Error) {
          setError(`Falha ao carregar o post: ${err.message}`);
        } else {
           setError('Falha ao carregar o post: Erro desconhecido.');
        }
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // --- Renderização (sem alterações no JSX principal) ---

  if (loading) {
    return (
       <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-center">
         <div className="animate-pulse text-xl text-gray-700">Carregando post...</div>
       </div>
     );
   }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-4 text-center">
        <p className="text-red-600 font-semibold">{error}</p>
        <Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">
          Voltar para a página inicial
        </Link>
      </div>
     );
   }

  if (!post) {
     // Este estado é menos provável agora que tratamos 404 e erro explicitamente
     return (
       <div className="px-4 sm:px-6 lg:px-8 py-4">
         <h1 className="text-2xl font-bold mb-4 text-gray-900">Post não encontrado</h1>
         <Link to="/" className="text-blue-500 hover:underline">
           Voltar para a página inicial
         </Link>
       </div>
     );
   }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
      <article className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">{post.title}</h1>

         {/* Categories devem funcionar pois fizemos o parse */}
         {post.categories && post.categories.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1">
            {post.categories.map((category, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {category}
              </span>
            ))}
          </div>
        )}

        <div className="text-gray-500 mb-6">
          <span>{post.date}</span> • <span>Por: {post.author}</span>
        </div>

        <div className="prose max-w-none mb-6">
            <p className="text-gray-700">{post.excerpt}</p>
        </div>
        <div className="prose max-w-none">
          {post.content ? (
            <p className="text-gray-700">{post.content}</p>
          ) : (
             <p className="text-gray-500 italic">(Conteúdo completo não disponível)</p>
          )}
        </div>

        <div className="mt-8 pt-4 border-t">
          <Link to="/" className="text-blue-500 hover:underline">
            ← Voltar para a lista de posts
          </Link>
        </div>
      </article>
    </div>
  );
};

export default PostPage;