// src/types/index.ts

export interface User {
  id: number;
  email: string;
  name: string;
  avatarUrl: string | null;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: number | string;
  title: string;
  excerpt: string;
  content?: string;
  author: string;
  date: string;
  categories: string[];
  likes: number;
  likedByCurrentUser?: boolean;
  commentCount: number;
  created_at?: string;
  updated_at?: string;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    avatarUrl?: string | null;
  };
}