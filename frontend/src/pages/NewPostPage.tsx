import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Hook para navegação
import PostForm from '../components/PostForm';
import { Post } from '../types';
import { createPost } from '../services/api'; // Importa a função da API

const NewPostPage: FC = () => {
  const navigate = useNavigate(); // Hook para redirecionar o usuário
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função que será passada para o PostForm
  const handleCreatePost = async (postData: Omit<Post, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      // Chama a função do serviço de API para criar o post
      const result = await createPost(postData);
      console.log('Post criado com ID:', result.insertedId);
      // Redireciona para a página inicial após sucesso
      navigate('/');
    } catch (err) {
      console.error("Erro ao criar post:", err);
      if (err instanceof Error) {
          setError(`Erro ao criar post: ${err.message}`);
      } else {
          setError("Ocorreu um erro desconhecido.");
      }
      setIsLoading(false); // Garante que loading para em caso de erro
    }
    // setIsLoading(false) não é necessário aqui se o redirect acontecer
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Criar Novo Post</h1>
        {/* Exibe mensagem de erro se houver */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <PostForm
          onSubmit={handleCreatePost}
          isLoading={isLoading}
          submitButtonText="Criar Post"
        />
      </div>
    </div>
  );
};

export default NewPostPage;