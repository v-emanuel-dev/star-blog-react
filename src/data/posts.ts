// src/data/posts.ts
import { Post } from '../types';

export const posts: Post[] = [
  {
    id: 1,
    title: "Começando com React e TypeScript",
    excerpt: "Um guia completo para iniciantes sobre como começar com React e TypeScript em 2025.",
    content: "Conteúdo completo do post aqui...",
    date: "25 Mar 2025",
    author: "Maria Silva",
    categories: ["React", "TypeScript", "Frontend"]
  },
  {
    id: 2,
    title: "Dominando Hooks do React com TypeScript",
    excerpt: "Aprenda a usar os Hooks mais importantes do React com tipagem correta em TypeScript.",
    date: "20 Mar 2025",
    author: "João Santos",
    categories: ["React", "Hooks", "TypeScript"]
  },
  {
    id: 3,
    title: "CSS-in-JS vs Tailwind com TypeScript",
    excerpt: "Uma comparação detalhada entre diferentes abordagens de estilização no React com TypeScript.",
    date: "15 Mar 2025",
    author: "Ana Oliveira",
    categories: ["CSS", "Tailwind", "Estilização"]
  }
];