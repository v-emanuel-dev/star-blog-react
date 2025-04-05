// src/services/api.ts
import { Comment, Post, User } from "../types";

const API_BASE_URL = "http://localhost:4000/api";

type PostInputData = Omit<Post, "id">;
type RegisterUserData = Pick<User, "email" | "name"> & { password: string };
type LoginCredentials = Pick<User, "email"> & { password: string };
type LoginResponse = { message: string; token: string; user: User };
type ChangePasswordData = { currentPassword: string; newPassword: string };
type AddCommentData = { content: string };
type EditCommentData = { content: string };
type LikeToggleResponse = { message: string; liked: boolean; likes: number };

async function safeResponseJson(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const getAllPosts = async (): Promise<Post[]> => {
  const response = await fetch(`${API_BASE_URL}/posts`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const getPostById = async (id: string): Promise<Post> => {
  const response = await fetch(`${API_BASE_URL}/posts/${id}`);
  if (!response.ok) {
    if (response.status === 404) throw new Error("Post not found.");
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const createPost = async (
  postData: PostInputData
): Promise<{ insertedId: number }> => {
  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      ...postData,
      categories: postData.categories || [],
    }),
  });
  const body = await safeResponseJson(response);
  if (!response.ok)
    throw new Error(body?.message || `HTTP error! status: ${response.status}`);
  return body;
};

export const updatePost = async (
  id: string | number,
  postData: PostInputData
): Promise<{ post: Post }> => {
  const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      ...postData,
      categories: postData.categories || [],
    }),
  });
  const body = await safeResponseJson(response);
  if (!response.ok)
    throw new Error(body?.message || `HTTP error! status: ${response.status}`);
  return body;
};

export const deletePost = async (
  id: string | number
): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const body = await safeResponseJson(response);
  if (!response.ok)
    throw new Error(body?.message || `HTTP error! status: ${response.status}`);
  return body || { message: "Post deleted successfully!" };
};

export const registerUser = async (
  formData: FormData
): Promise<{ userId: number }> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    body: formData,
  });
  const body = await safeResponseJson(response);
  if (!response.ok)
    throw new Error(body?.message || `HTTP error! status: ${response.status}`);
  return body;
};

export const loginUser = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const body = await safeResponseJson(response);
  if (!response.ok)
    throw new Error(body?.message || `HTTP error! status: ${response.status}`);
  return body;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const body = await safeResponseJson(response);
  if (!response.ok)
    throw new Error(body?.message || `HTTP error! status: ${response.status}`);
  return {
    id: body.id,
    email: body.email,
    name: body.name,
    avatarUrl: body.avatar_url || null,
    created_at: body.created_at,
    updated_at: body.updated_at,
  };
};

export const updateUserProfile = async (
  formData: FormData
): Promise<{ user: User }> => {
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: formData,
  });
  const body = await safeResponseJson(response);
  if (!response.ok)
    throw new Error(body?.message || `HTTP error! status: ${response.status}`);
  return {
    user: {
      id: body.user.id,
      email: body.user.email,
      name: body.user.name,
      avatarUrl: body.user.avatar_url || null,
      created_at: body.user.created_at,
      updated_at: body.user.updated_at,
    },
  };
};

export const changePassword = async (
  passwords: ChangePasswordData
): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/users/password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(passwords),
  });
  const body = await safeResponseJson(response);
  if (!response.ok)
    throw new Error(body?.message || `HTTP error! status: ${response.status}`);
  return body;
};

export const getCommentsForPost = async (
  postId: string | number
): Promise<Comment[]> => {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const addComment = async (
  postId: string | number,
  commentData: AddCommentData
): Promise<Comment> => {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(commentData),
  });
  const body = await safeResponseJson(response);
  if (!response.ok)
    throw new Error(body?.message || `HTTP error! status: ${response.status}`);
  return body;
};

export const editComment = async (
  commentId: number,
  commentData: EditCommentData
): Promise<{ comment: Comment }> => {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(commentData),
  });
  const body = await safeResponseJson(response);
  if (!response.ok)
    throw new Error(body?.message || `HTTP error! status: ${response.status}`);
  return body;
};

export const deleteComment = async (
  commentId: number
): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const body = await safeResponseJson(response);
  if (!response.ok)
    throw new Error(body?.message || `HTTP error! status: ${response.status}`);
  return body || { message: "Comment deleted successfully!" };
};

export const toggleLikePost = async (
  postId: number | string
): Promise<LikeToggleResponse> => {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const body = await safeResponseJson(response);
  if (!response.ok)
    throw new Error(body?.message || `HTTP error! status: ${response.status}`);
  return body;
};
