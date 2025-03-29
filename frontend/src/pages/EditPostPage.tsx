import React, { FC, useState, useEffect } from 'react';
// Certifique-se que useParams, useNavigate, Link estão importados
import { useParams, useNavigate, Link } from 'react-router-dom';
import PostForm from '../components/PostForm';
import { Post } from '../types';
import { getPostById, updatePost } from '../services/api';

// Tipo para os dados do formulário (sem id)
type PostFormData = Omit<Post, 'id'>;

const EditPostPage: FC = () => {
  // GARANTA que a tipagem <{ id: string }> está aqui
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // O estado 'post' armazena os dados do formulário (sem id)
  const [post, setPost] = useState<PostFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Checagem inicial do ID (importante)
    if (!id) {
      setError("ID do post não fornecido na URL.");
      setIsLoading(false);
      return;
    }

    const fetchPostData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Passa 'id' (que deve ser string) para a função
        // Se o erro ts(2345) persistir aqui, o problema está na DEFINIÇÃO de getPostById em api.ts
        const fetchedPost: Post = await getPostById(id);

        // ALTERNATIVA para evitar '_postId' não usado:
        // Crie o objeto initialData manualmente pegando só os campos necessários
        const initialData: PostFormData = {
          title: fetchedPost.title,
          excerpt: fetchedPost.excerpt || '', // Adiciona fallback para garantir string
          content: fetchedPost.content || '', // Adiciona fallback
          author: fetchedPost.author || '', // Adiciona fallback
          date: fetchedPost.date || '', // Adiciona fallback
          // Garante que categories é array (getPostById já deve retornar array)
          categories: fetchedPost.categories || [],
        };

        setPost(initialData);

      } catch (err) {
        console.error("Erro ao buscar post para edição:", err);
        if (err instanceof Error) {
          setError(`Erro ao carregar post: ${err.message}`);
        } else {
          setError("Ocorreu um erro desconhecido ao carregar o post.");
        }
        setPost(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostData();
    // A dependência [id] está correta
  }, [id]);

  // Função handleUpdatePost (sem alterações na lógica principal)
  const handleUpdatePost = async (postData: PostFormData) => {
    if (!id) {
      setError("Não é possível atualizar: ID do post ausente.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const result = await updatePost(id, postData);
      console.log('Post atualizado:', result.post);
      navigate(`/post/${id}`);
    } catch (err) {
      console.error("Erro ao atualizar post:", err);
      if (err instanceof Error) {
        setError(`Erro ao salvar alterações: ${err.message}`);
      } else {
        setError("Ocorreu um erro desconhecido ao salvar.");
      }
      setIsSaving(false);
    }
  };

  // --- JSX para Loading / Error / Form (sem alterações) ---
  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-center">
        <div className="animate-pulse text-xl text-gray-700">Carregando dados do post...</div>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-4 text-center">
        <p className="text-red-600 font-semibold">{error}</p>
        <Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">
          Voltar para a página inicial
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Editar Post</h1>
        {/* Erro de salvamento */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {/* Formulário */}
        {post ? (
          <PostForm
            onSubmit={handleUpdatePost}
            initialData={post}
            isLoading={isSaving}
            submitButtonText="Atualizar Post"
          />
        ) : (
          <p className="text-center text-gray-500">Dados do post não disponíveis.</p>
        )}
      </div>
    </div>
  );
};

export default EditPostPage;