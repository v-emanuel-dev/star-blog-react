import { Post, User } from '../types';

const API_BASE_URL = 'http://localhost:4000/api';

const artificialDelay = (ms: number): Promise<void> => {
    console.log(`ARTIFICIAL DELAY (API): Waiting ${ms}ms...`);
    return new Promise(resolve => setTimeout(resolve, ms));
};

type PostInputData = Omit<Post, 'id'>;
type RegisterUserData = Pick<User, 'email' | 'name'> & { password: string };
type LoginCredentials = Pick<User, 'email'> & { password: string };
type LoginResponse = { message: string; token: string; user: Pick<User, 'id' | 'email' | 'name'> };


export const getAllPosts = async (): Promise<Post[]> => {
   const response = await fetch(`${API_BASE_URL}/posts`);
   if (!response.ok) {
       throw new Error(`HTTP error! status: ${response.status}`);
   }
   const posts: Post[] = await response.json();
   await artificialDelay(2000); // Added Delay
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
   await artificialDelay(2000); // Added Delay
   return post;
 };

export const createPost = async (postData: PostInputData): Promise<{ insertedId: number }> => {
  const token = localStorage.getItem('authToken');
  const dataToSend = {
    ...postData,
    categories: postData.categories || [],
  };
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
  // No artificial delay added to mutations by default, but could be added here if needed
  return responseBody;
};

export const updatePost = async (id: number | string, postData: PostInputData): Promise<{ post: Post }> => {
  const token = localStorage.getItem('authToken');
  const dataToSend = {
      ...postData,
      categories: postData.categories || [],
  };
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
   // No artificial delay added to mutations by default
  return responseBody;
};

export const deletePost = async (id: number | string): Promise<{ message: string }> => {
  const token = localStorage.getItem('authToken');
  const fetchUrl = `${API_BASE_URL}/posts/${id}`;
  const response = await fetch(fetchUrl, {
    method: 'DELETE',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  });
  const responseBody = await response.json().catch(() => null);
  if (!response.ok) {
      const errorMessage = responseBody?.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
  }
   // No artificial delay added to mutations by default
  return responseBody || { message: "Post deleted successfully!" };
};

export const registerUser = async (formData: FormData): Promise<{ userId: number }> => {
  // When sending FormData, DO NOT set the 'Content-Type' header manually.
  // The browser will automatically set it to 'multipart/form-data'
  // with the correct boundary.
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      // headers: { 'Content-Type': 'application/json' }, // REMOVE THIS HEADER
      body: formData, // Send FormData directly as the body
  });

  // Response handling remains the same, assuming backend still returns JSON
  const responseBody = await response.json().catch(async (err) => {
      // If response is not JSON (e.g., plain text error from server or middleware)
      console.error("Register API response was not JSON:", err);
      const textResponse = await response.text(); // Try to get text response
      return { message: textResponse || "Non-JSON response from server." };
  });

  if (!response.ok) {
      throw new Error(responseBody.message || `HTTP error! status: ${response.status}`);
  }
  return responseBody; // Expects { message: string, userId: number }
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
     // No artificial delay added to mutations by default
    return responseBody;
};
