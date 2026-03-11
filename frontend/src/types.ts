// Domain types (matching backend API JSON responses)
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Todo {
  _id: string;
  task: string;
  completed: boolean;
  owner: string;
  createdAt: string;
}

// API response shapes
export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// Form input shapes
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}
