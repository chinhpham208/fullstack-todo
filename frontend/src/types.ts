// Domain types (matching backend API JSON responses)
export interface User {
  id: string;
  _id?: string;
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

export type MemberRole = "owner" | "admin" | "member";

export interface WorkspaceMember {
  user: User;
  role: MemberRole;
  joinedAt: string;
}

export interface Workspace {
  _id: string;
  name: string;
  description: string;
  owner: string;
  members: WorkspaceMember[];
  createdAt: string;
}

export interface Board {
  _id: string;
  name: string;
  workspace: string;
  createdBy: string;
  createdAt: string;
}

export interface Column {
  _id: string;
  name: string;
  board: string;
  position: number;
  createdAt: string;
}

export interface Card {
  _id: string;
  title: string;
  description: string;
  column: string;
  board: string;
  position: number;
  assignees: User[];
  createdBy: User;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  card: string;
  author: User;
  mentions: User[];
  createdAt: string;
  updatedAt: string;
}

export type ActivityAction =
  | "card_created"
  | "card_moved"
  | "card_updated"
  | "card_deleted"
  | "comment_added"
  | "member_invited"
  | "member_joined"
  | "column_created"
  | "column_deleted"
  | "board_created";

export interface Activity {
  _id: string;
  workspace: string;
  board?: string;
  card?: string;
  user: User;
  action: ActivityAction;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface Invitation {
  _id: string;
  workspace: Workspace;
  email: string;
  invitedBy: User;
  role: MemberRole;
  status: "pending" | "accepted" | "declined";
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface BoardDetail {
  board: Board;
  columns: Column[];
  cards: Card[];
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
