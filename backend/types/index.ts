import { Types } from "mongoose";

// JWT payload
export interface JwtPayload {
  userId: string;
}

// Mongoose document shapes
export interface IUser {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

export interface ITodo {
  task: string;
  completed: boolean;
  owner: Types.ObjectId;
  createdAt: Date;
}

// API response shapes
export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ErrorResponse {
  error: string;
}

export interface MessageResponse {
  message: string;
}
