import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';
import { useBlog } from '../context/BlogContext';

interface PostCardProps extends Omit<Post, 'content' | 'categories'> {
  content?: string;
  categories?: string[];
  onLike?: (id: number) => void;
}

const PostCard: FC<PostCardProps> = ({ 
  id,
  title, 
  excerpt, 
  date, 
  author, 
  categories = [], 
  onLike 
}) => {
  const [likes, setLikes] = useState<number>(0);
  const { isFavorite, addToFavorites, removeFromFavorites } = useBlog();
  
  const handleLike = () => {
    setLikes(prevLikes => prevLikes + 1);
    if (onLike) {
      onLike(id);
    }
  };

  const handleToggleFavorite = () => {
    if (isFavorite(id)) {
      removeFromFavorites(id);
    } else {
      addToFavorites(id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow">
      <Link to={`/post/${id}`}>
        <h2 className="text-xl font-bold mb-2 text-blue-600 hover:text-blue-800">{title}</h2>
      </Link>
      <p className="text-gray-600 mb-4">{excerpt}</p>
      
      {categories.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {categories.map((category, index) => (
            <span 
              key={index} 
              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
            >
              {category}
            </span>
          ))}
        </div>
      )}
      
      <div className="flex justify-between text-sm text-gray-500">
        <span>{date}</span>
        <span>Por: {author}</span>
      </div>
      <div className="mt-4 border-t pt-3 flex items-center justify-between">
        <button 
          onClick={handleLike}
          className="flex items-center text-blue-500 hover:text-blue-700"
        >
          <span className="mr-1">👍</span> Curtir ({likes})
        </button>
        
        <button
          onClick={handleToggleFavorite}
          className={`flex items-center ${
            isFavorite(id) ? 'text-yellow-500' : 'text-gray-400'
          } hover:text-yellow-500`}
        >
          <span className="mr-1">⭐</span> 
          {isFavorite(id) ? 'Favorito' : 'Favoritar'}
        </button>
      </div>
    </div>
  );
};

export default PostCard;