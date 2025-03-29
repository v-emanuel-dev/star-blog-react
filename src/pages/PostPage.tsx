// src/pages/PostPage.tsx
import { FC, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Post } from '../types';
import { posts as postsData } from '../data/posts';

interface PostParams {
  id: string;
  [key: string]: string;
}

const PostPage: FC = () => {
  const { id } = useParams<PostParams>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPost = async (): Promise<void> => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const foundPost = postsData.find(p => p.id === parseInt(id || '0'));
        if (foundPost) {
          setPost(foundPost);
        }
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar post:', error);
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    // CORRIGIDO: Removido 'container mx-auto p-4', adicionado padding e mantido flex
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-center">
        <div className="animate-pulse text-xl text-gray-700">Carregando post...</div>
      </div>
    );
  }

  if (!post) {
    // CORRIGIDO: Removido 'container mx-auto p-4', adicionado padding
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
            <p className="text-gray-700">
              (Conteúdo completo do post iria aqui...)
            </p>
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