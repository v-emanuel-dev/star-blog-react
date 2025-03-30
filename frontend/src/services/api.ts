// src/services/api.ts
import { Post, User } from '../types';

const API_BASE_URL = 'http://localhost:4000/api';

const artificialDelay = (ms: number): Promise<void> => {
    console.log(`ARTIFICIAL DELAY (API): Waiting ${ms}ms...`);
    return new Promise(resolve => setTimeout(resolve, ms));
};

type PostInputData = Omit<Post, 'id'>;
type RegisterUserData = Pick<User, 'email' | 'name'> & { password: string };
type LoginCredentials = Pick<User, 'email'> & { password: string };
type LoginResponse = { message: string; token: string; user: User };


export const getAllPosts = async (): Promise<Post[]> => {
   const response = await fetch(`${API_BASE_URL}/posts`);
   if (!response.ok) {
       throw new Error(`HTTP error! status: ${response.status}`);
   }
   const posts: Post[] = await response.json();
   // await artificialDelay(2000); // Keep or remove delay
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
   // await artificialDelay(2000); // Keep or remove delay
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
    return responseBody;
};

export const getCurrentUser = async (): Promise<User> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
      throw new Error("No authentication token found.");
  }
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
  });
  const responseBody = await response.json().catch(() => null);
  if (!response.ok) {
      throw new Error(responseBody?.message || `HTTP error! status: ${response.status}`);
  }
  if (!responseBody) throw new Error("Received empty response from /auth/me");

  // Map snake_case from backend to camelCase for frontend User type
  const user: User = {
      id: responseBody.id,
      email: responseBody.email,
      name: responseBody.name,
      avatarUrl: responseBody.avatar_url || null, // Mapping happening here
      created_at: responseBody.created_at,
      updated_at: responseBody.updated_at // Assuming backend sends these too
  };
  // Optional: Remove delay if testing is done
  // await artificialDelay(2000);
  return user; // Return the mapped User object
};

export const updateUserProfile = async (formData: FormData): Promise<{ user: User }> => {
  try {
    const response = await fetch('http://localhost:4000/api/profile', {
      method: 'PUT',
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });

    const responseBody = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(responseBody?.message || 'Failed to update profile');
    }

    // Map the returned user object
    const backendUser = responseBody.user;
    const mappedUser: User = {
      id: backendUser.id,
      email: backendUser.email,
      name: backendUser.name,
      avatarUrl: backendUser.avatar_url || null, // Mapping
      created_at: backendUser.created_at,
      updated_at: backendUser.updated_at
    };

    return { user: mappedUser };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

