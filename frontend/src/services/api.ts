// src/services/api.ts
import { Post, User, Comment } from '../types';

const API_BASE_URL = 'http://localhost:4000/api';

type PostInputData = Omit<Post, 'id'>;
type RegisterUserData = Pick<User, 'email' | 'name'> & { password: string };
type LoginCredentials = Pick<User, 'email'> & { password: string };
type LoginResponse = { message: string; token: string; user: User };
type ChangePasswordData = { currentPassword: string; newPassword: string };
type AddCommentData = { content: string };

// Backend Comment response interface (for mapping)
interface BackendComment {
  id: number;
  content: string;
  created_at: string; // Snake case from backend
  user?: {
    id: number;
    name: string;
    avatarUrl?: string | null;
  };
}

export const getAllPosts = async (): Promise<Post[]> => {
   const response = await fetch(`${API_BASE_URL}/posts`);
   if (!response.ok) {
       throw new Error(`HTTP error! status: ${response.status}`);
   }
   const posts: Post[] = await response.json();
   return posts;
}

export const getPostById = async (id: string): Promise<Post> => {
   const fetchUrl = `${API_BASE_URL}/posts/${id}`;
   const response = await fetch(fetchUrl);
   if (!response.ok) {
       if (response.status === 404) throw new Error('Post not found.');
       throw new Error(`HTTP error! status: ${response.status}`);
   }
   const post: Post = await response.json();
   return post;
 };

export const createPost = async (postData: PostInputData): Promise<{ insertedId: number }> => {
  const token = localStorage.getItem('authToken');
  const dataToSend = { ...postData, categories: postData.categories || [] };
  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    body: JSON.stringify(dataToSend),
  });
  const responseBody = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(responseBody.message || `HTTP error! status: ${response.status}`);
  }
  return responseBody;
};

export const updatePost = async (id: number | string, postData: PostInputData): Promise<{ post: Post }> => {
  const token = localStorage.getItem('authToken');
  const dataToSend = { ...postData, categories: postData.categories || [] };
  const fetchUrl = `${API_BASE_URL}/posts/${id}`;
  const response = await fetch(fetchUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    body: JSON.stringify(dataToSend),
  });
  const responseBody = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(responseBody.message || `HTTP error! status: ${response.status}`);
  }
  return responseBody;
};

export const deletePost = async (id: number | string): Promise<{ message: string }> => {
  const token = localStorage.getItem('authToken');
  const fetchUrl = `${API_BASE_URL}/posts/${id}`;
  const response = await fetch(fetchUrl, {
    method: 'DELETE',
    headers: { ...(token && { 'Authorization': `Bearer ${token}` }) }
  });
  const responseBody = await response.json().catch(() => null);
  if (!response.ok) {
      const errorMessage = responseBody?.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
  }
  return responseBody || { message: "Post deleted successfully!" };
};

export const registerUser = async (formData: FormData): Promise<{ userId: number }> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        body: formData,
    });
    const responseBody = await response.json().catch(async () => {
        const textResponse = await response.text();
        return { message: textResponse || "Non-JSON response from server." };
    });
    if (!response.ok) {
        throw new Error(responseBody.message || `HTTP error! status: ${response.status}`);
    }
    return responseBody;
};

export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
    const responseBody = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(responseBody.message || `HTTP error! status: ${response.status}`);
    }
     const backendUser = responseBody.user;
     const mappedUser: User = {
         id: backendUser.id,
         email: backendUser.email,
         name: backendUser.name,
         avatarUrl: backendUser.avatar_url || null,
         created_at: backendUser.created_at,
         updated_at: backendUser.updated_at
     };
    return { ...responseBody, user: mappedUser };
};

export const getCurrentUser = async (): Promise<User> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error("No authentication token found.");

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const responseBody = await response.json().catch(() => null);
    if (!response.ok) throw new Error(responseBody?.message || `HTTP error! status: ${response.status}`);
    if (!responseBody) throw new Error("Received empty response from /auth/me");

    const user: User = {
        id: responseBody.id,
        email: responseBody.email,
        name: responseBody.name,
        avatarUrl: responseBody.avatar_url || null,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at
    };
    return user;
};

export const updateUserProfile = async (formData: FormData): Promise<{ user: User }> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error("No authentication token found.");

    const fetchUrl = `${API_BASE_URL}/users/profile`;
    const response = await fetch(fetchUrl, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });
    const responseBody = await response.json().catch(async () => {
        const textResponse = await response.text();
        return { message: textResponse || "Non-JSON response from server." };
    });
    if (!response.ok) throw new Error(responseBody.message || `HTTP error! status: ${response.status}`);

    const backendUser = responseBody.user;
    const mappedUser: User = {
        id: backendUser.id,
        email: backendUser.email,
        name: backendUser.name,
        avatarUrl: backendUser.avatar_url || null,
        created_at: backendUser.created_at,
        updated_at: backendUser.updated_at
    };
    return { user: mappedUser };
};

export const changePassword = async (passwords: ChangePasswordData): Promise<{ message: string }> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error("No authentication token found.");

  const response = await fetch(`${API_BASE_URL}/users/password`, {
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(passwords)
  });

  const responseBody = await response.json().catch(async () => {
      const textResponse = await response.text();
      return { message: textResponse || "Non-JSON response from server." };
  });

  if (!response.ok) {
      throw new Error(responseBody.message || `HTTP error! status: ${response.status}`);
  }
  return responseBody;
};

export const getCommentsForPost = async (postId: string | number): Promise<Comment[]> => {
  const fetchUrl = `${API_BASE_URL}/posts/${postId}/comments`;
  const response = await fetch(fetchUrl);
  if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
  }
  // Directly assume the response body is an array matching our Comment type
  const comments: Comment[] = await response.json();
  return comments;
};

// POST /api/posts/:postId/comments
export const addComment = async (postId: string | number, commentData: AddCommentData): Promise<Comment> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error("Authentication required to comment.");

  const fetchUrl = `${API_BASE_URL}/posts/${postId}/comments`;
  const response = await fetch(fetchUrl, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(commentData)
  });

  const responseBody = await response.json().catch(async () => { /* ... error handling ... */ });
  if (!response.ok) { throw new Error(responseBody.message || `HTTP error! status: ${response.status}`); }

  // Directly assume the response body matches our Comment type
  return responseBody as Comment;
};