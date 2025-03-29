import { createContext, useContext, FC, ReactNode, useState } from 'react';

// Definindo a estrutura do nosso contexto
interface BlogContextType {
  favorites: number[];
  addToFavorites: (postId: number) => void;
  removeFromFavorites: (postId: number) => void;
  isFavorite: (postId: number) => boolean;
}

// Criando o contexto com um valor padrão
const BlogContext = createContext<BlogContextType | undefined>(undefined);

// Props para o provider
interface BlogProviderProps {
  children: ReactNode;
}

// Provider component
export const BlogProvider: FC<BlogProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<number[]>([]);

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

  // Valor que será disponibilizado para os componentes filhos
  const value: BlogContextType = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
};

// Hook personalizado para usar o contexto
export const useBlog = (): BlogContextType => {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlog deve ser usado dentro de um BlogProvider');
  }
  return context;
};