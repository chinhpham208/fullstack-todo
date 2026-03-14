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

export type MemberRole = "owner" | "admin" | "member";

export interface IWorkspaceMember {
  user: Types.ObjectId;
  role: MemberRole;
  joinedAt: Date;
}

export interface IWorkspace {
  name: string;
  description: string;
  owner: Types.ObjectId;
  members: IWorkspaceMember[];
  createdAt: Date;
}

export interface IBoard {
  name: string;
  workspace: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

export interface IColumn {
  name: string;
  board: Types.ObjectId;
  position: number;
  createdAt: Date;
}

export interface ICard {
  title: string;
  description: string;
  column: Types.ObjectId;
  board: Types.ObjectId;
  position: number;
  assignees: Types.ObjectId[];
  createdBy: Types.ObjectId;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment {
  content: string;
  card: Types.ObjectId;
  author: Types.ObjectId;
  mentions: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
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

export interface IActivity {
  workspace: Types.ObjectId;
  board?: Types.ObjectId;
  card?: Types.ObjectId;
  user: Types.ObjectId;
  action: ActivityAction;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export type InvitationStatus = "pending" | "accepted" | "declined";

export interface IInvitation {
  workspace: Types.ObjectId;
  email: string;
  invitedBy: Types.ObjectId;
  role: MemberRole;
  status: InvitationStatus;
  token: string;
  expiresAt: Date;
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
