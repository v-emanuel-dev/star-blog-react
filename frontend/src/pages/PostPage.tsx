// src/pages/PostPage.tsx
import { FC, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Post } from '../types';
// REMOVE a linha abaixo
// import { posts as postsData } from '../data/posts';

// Reutilizando a URL base
const API_URL = 'http://localhost:3001';

interface PostParams {
  id: string;
  [key: string]: string;
}

const PostPage: FC = () => {
  const { id } = useParams<PostParams>(); // Pega o ID da URL
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // Estado de erro

  useEffect(() => {
    // Garante que só busca se tiver um ID válido
    if (!id) {
        setError("ID do post inválido.");
        setLoading(false);
        return;
    }

    const fetchPost = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        // Busca o post específico usando o ID na URL da API
        const response = await fetch(`${API_URL}/posts/${id}`);

        if (!response.ok) {
          // Se a resposta não for ok (ex: 404 Not Found)
          if (response.status === 404) {
             throw new Error('Post não encontrado.');
          } else {
             throw new Error(`HTTP error! status: ${response.status}`);
          }
        }

        const data: Post = await response.json();
        setPost(data);

      } catch (err) {
        console.error(`Erro ao buscar post ${id}:`, err);
         if (err instanceof Error) {
          setError(`Falha ao carregar o post: ${err.message}`);
        } else {
           setError('Falha ao carregar o post: Erro desconhecido.');
        }
        setPost(null); // Garante que não exibe post antigo em caso de erro
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]); // Dependência: re-executa se o 'id' da URL mudar

  // --- Renderização Condicional ---

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-center">
        <div className="animate-pulse text-xl text-gray-700">Carregando post...</div>
      </div>
    );
  }

  // Prioriza mostrar erro sobre 'post não encontrado' vindo da API
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

  // Se não está carregando, não deu erro, mas o post é null (não deveria acontecer se a API retornou ok)
  // Mas mantemos por segurança. O erro 404 já é tratado no bloco 'error'.
  if (!post) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Post não encontrado</h1>
        <Link to="/" className="text-blue-500 hover:underline">
          Voltar para a página inicial
        </Link>
      </div>
    );
  }

  // Renderização do post encontrado
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
      <article className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">{post.title}</h1>

        {/* ... resto do JSX para exibir categorias, data, autor, excerpt, content ... */}
        {/* (O código JSX interno da article permanece o mesmo de antes) */}

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