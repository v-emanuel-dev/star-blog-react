import { createContext, useContext, FC, ReactNode, useState, useEffect } from 'react';

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
    const storedFavorites = localStorage.getItem('favorites');
    return storedFavorites ? JSON.parse(storedFavorites) : [];
  });

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = (postId: number): void => {
    if (!favorites.includes(postId)) {
      setFavorites(prev => [...prev, postId]);
    }
  };

  const removeFromFavorites = (postId: number): void => {
    setFavorites(prev => prev.filter(id => id !== postId));
  };

  const isFavorite = (postId: number): boolean => {
    return favorites.includes(postId);
  };

  const value: BlogContextType = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
};

export const useBlog = (): BlogContextType => {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};
