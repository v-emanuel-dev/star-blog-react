import React, { FC, useState, useEffect } from 'react'; // Import React
// Importar hooks e Link do react-router-dom
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Post } from '../types';
// Importar funções da API, incluindo deletePost
import { getPostById, deletePost } from '../services/api';

// Mantém a URL base (embora não seja usada diretamente aqui, é usada em api.ts)
// const API_BASE_URL = 'http://localhost:4000';

interface PostParams {
  id: string;
  [key: string]: string;
}

const PostPage: FC = () => {
  const { id } = useParams<PostParams>();
  const navigate = useNavigate(); // Hook para navegação programática
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Loading da busca inicial
  const [isDeleting, setIsDeleting] = useState<boolean>(false); // Estado para loading do delete
  const [error, setError] = useState<string | null>(null);

  // useEffect para buscar o post (sem alterações)
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
        const fetchedPost: Post = await getPostById(id); // Usa a função da API
        setPost(fetchedPost);
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


  // --- FUNÇÃO PARA DELETAR ---
  const handleDelete = async () => {
    if (!id || !post) {
        console.error("Tentativa de deletar sem ID ou post carregado.");
        return;
    }

    const confirmDelete = window.confirm(`Tem certeza que deseja deletar o post "${post.title}"? Esta ação não pode ser desfeita.`);

    if (confirmDelete) {
      setIsDeleting(true); // Inicia o estado de "deletando"
      setError(null);
      try {
        await deletePost(id); // Chama a função da API para deletar
        console.log(`Post ${id} deletado com sucesso.`);
        navigate('/'); // Redireciona para a página inicial após deletar
      } catch (err) {
        console.error("Erro ao deletar post:", err);
        if (err instanceof Error) {
          setError(`Erro ao deletar: ${err.message}`); // Mostra erro na página
        } else {
          setError("Ocorreu um erro desconhecido ao deletar.");
        }
        setIsDeleting(false); // Reabilita o botão se deu erro
      }
      // Não precisa de finally aqui, pois ou navegamos ou já tratamos o erro
    }
  };


  // --- RENDERIZAÇÃO CONDICIONAL ---

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-center">
        <div className="animate-pulse text-xl text-gray-700">Carregando post...</div>
      </div>
    );
  }

  // Mostra erro (seja de carregamento ou de delete)
  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-4 text-center">
        <p className="text-red-600 font-semibold">{error}</p>
        {/* Mostra link para voltar apenas se não for um erro 404 inicial */}
        {(post || !error.includes('Post não encontrado')) && (
            <Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">
             Voltar para a página inicial
            </Link>
        )}
      </div>
    );
  }

  // Se !post e não há erro/loading (não deveria acontecer, mas por segurança)
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

  // --- RENDERIZAÇÃO PRINCIPAL DO POST ---
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
      {/* Adicionado 'pb-10' para dar espaço extra embaixo caso os botões fiquem sobrepostos */}
      <article className="bg-white rounded-lg shadow-md p-6 relative pb-10">

        {/* Botões Editar e Deletar */}
        <div className="absolute top-4 right-4 flex space-x-2 z-10"> {/* z-10 pode ajudar com sobreposição */}
          <Link
            to={`/edit-post/${post.id}`}
            className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold py-1 px-3 rounded transition duration-150 ease-in-out"
          >
            Editar
          </Link>
          {/* Botão Deletar Adicionado */}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-1 px-3 rounded transition duration-150 ease-in-out ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isDeleting ? 'Deletando...' : 'Deletar'}
          </button>
        </div>


        <h1 className="text-3xl font-bold mb-4 text-gray-900 pr-24">{post.title}</h1> {/* Adicionado pr para evitar sobrepor botões */}

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

        <div className="mt-8 pt-4 border-t flex justify-between items-center">
          <Link to="/" className="text-blue-500 hover:underline">
            ← Voltar para a lista de posts
          </Link>
           {/* Poderia adicionar os botões aqui embaixo também, se preferir */}
        </div>
      </article>
    </div>
  );
};

export default PostPage;
