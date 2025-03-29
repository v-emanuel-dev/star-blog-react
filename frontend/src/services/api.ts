import { Post } from '../types'; // Importa nosso tipo Post

// Define a URL base do nosso backend Node.js
const API_BASE_URL = 'http://localhost:4000/api'; // Verifique a porta

// Tipo para os dados que enviaremos para criar/atualizar (sem o ID)
type PostInputData = Omit<Post, 'id'>;

// Função para CRIAR um novo post (POST)
export const createPost = async (postData: PostInputData): Promise<{ insertedId: number }> => {
  const dataToSend = {
    ...postData,
    categories: postData.categories || [],
  };

  // URL construída corretamente (pode ser aspas ou crases aqui pois não há variável)
  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dataToSend),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

// Função para ATUALIZAR um post existente (PUT)
export const updatePost = async (id: number | string, postData: PostInputData): Promise<{ post: Post }> => {
  const dataToSend = {
      ...postData,
      categories: postData.categories || [],
  };

  // CORRIGIDO: URL construída com CRASES (`) e ${}
  const fetchUrl = `${API_BASE_URL}/posts/${id}`;
  console.log("Updating post at:", fetchUrl); // Log para verificar

  const response = await fetch(fetchUrl, { // Usa a variável fetchUrl
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dataToSend),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

// Função para BUSCAR TODOS os posts (GET)
export const getAllPosts = async (): Promise<Post[]> => {
   // URL construída corretamente (pode ser aspas ou crases aqui)
   const response = await fetch(`${API_BASE_URL}/posts`);
   if (!response.ok) {
       throw new Error(`HTTP error! status: ${response.status}`);
   }
   const posts: Post[] = await response.json();
   // Backend já retorna 'categories' como array
   return posts;
}

// Função para BUSCAR UM post por ID (GET)
 export const getPostById = async (id: string): Promise<Post> => {
   // CORRIGIDO: URL construída com CRASES (`) e ${}
   const fetchUrl = `${API_BASE_URL}/posts/${id}`;
   console.log("Fetching post from:", fetchUrl); // Log corrigido

   const response = await fetch(fetchUrl); // Usa a variável fetchUrl

   if (!response.ok) {
       if (response.status === 404) throw new Error('Post não encontrado.');
       throw new Error(`HTTP error! status: ${response.status}`);
   }
   const post: Post = await response.json();
    // Backend já retorna 'categories' como array
   return post;
 };

// Função para DELETAR um post (DELETE)
export const deletePost = async (id: number | string): Promise<{ message: string }> => {
  const fetchUrl = `${API_BASE_URL}/posts/${id}`;
    console.log("Deleting post at:", fetchUrl);
  
    const response = await fetch(fetchUrl, {
      method: 'DELETE', // Método HTTP DELETE
    });
  
    if (!response.ok) {
      // Se não for OK (ex: 404 Not Found se o post já foi deletado)
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  
    // Se for 204 No Content (comum para DELETE), pode não ter corpo JSON
    if (response.status === 204) {
        return { message: "Post deletado com sucesso!" }; // Retorna uma mensagem padrão
    }
  
    // Se for 200 OK (como configuramos no backend), esperamos um JSON
    return await response.json(); // Retorna a mensagem do backend { message: "..." }
  };