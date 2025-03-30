import { Post, User } from '../types';

const API_BASE_URL = 'http://localhost:4000/api';

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
   return posts;
};

export const getPostById = async (id: string): Promise<Post> => {
   const fetchUrl = `${API_BASE_URL}/posts/${id}`;
   console.log("Fetching post from:", fetchUrl);

   const response = await fetch(fetchUrl);

   if (!response.ok) {
       if (response.status === 404) throw new Error('Post not found.');
       throw new Error(`HTTP error! status: ${response.status}`);
   }
   const post: Post = await response.json();
   return post;
 };

export const createPost = async (postData: PostInputData): Promise<{ insertedId: number }> => {
  const dataToSend = {
    ...postData,
    categories: postData.categories || [],
  };

  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
  const dataToSend = {
      ...postData,
      categories: postData.categories || [],
  };

  const fetchUrl = `${API_BASE_URL}/posts/${id}`;
  console.log("Updating post at:", fetchUrl);

  const response = await fetch(fetchUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
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
  const fetchUrl = `${API_BASE_URL}/posts/${id}`;
  console.log("Trying to delete at:", fetchUrl);

  const response = await fetch(fetchUrl, {
    method: 'DELETE',
  });

  const responseBody = await response.json().catch(() => null);

  if (!response.ok) {
      const errorMessage = responseBody?.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
  }

  return responseBody || { message: "Post deleted successfully!" };
};

export const registerUser = async (userData: RegisterUserData): Promise<{ userId: number }> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });

    const responseBody = await response.json().catch(() => ({}));
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
