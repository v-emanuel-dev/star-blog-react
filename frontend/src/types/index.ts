export interface Post {
  id: number;
  title: string;
  excerpt: string;
  content?: string;
  date: string;
  author: string;
  categories?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface User {
    id: number;
    email: string;
    name: string | null;
    avatarUrl?: string | null;
    created_at?: string;
    updated_at?: string;
}
