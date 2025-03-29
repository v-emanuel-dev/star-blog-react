// src/types/index.ts
export interface Post {
    id: number;
    title: string;
    excerpt: string;
    content?: string;
    date: string;
    author: string;
    categories?: string[];
  }