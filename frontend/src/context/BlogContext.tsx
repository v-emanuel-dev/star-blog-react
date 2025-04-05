import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

interface BlogContextType {
  favorites: number[];
  addToFavorites: (postId: number) => void;
  removeFromFavorites: (postId: number) => void;
  isFavorite: (postId: number) => boolean;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

interface BlogProviderProps {
  children: ReactNode;
}

export const BlogProvider: FC<BlogProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('favorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = useCallback((postId: number) => {
    setFavorites(prev => (prev.includes(postId) ? prev : [...prev, postId]));
  }, []);

  const removeFromFavorites = useCallback((postId: number) => {
    setFavorites(prev => prev.filter(id => id !== postId));
  }, []);

  const isFavorite = useCallback(
    (postId: number) => favorites.includes(postId),
    [favorites]
  );

  const value = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
};

export const useBlog = (): BlogContextType => {
  const context = useContext(BlogContext);
  if (!context) throw new Error('useBlog must be used within a BlogProvider');
  return context;
};
