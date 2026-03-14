import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api";
import type { Workspace, Board, MemberRole } from "../types";

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  boards: Board[];
  currentBoard: Board | null;
  userRole: MemberRole | null;
  loading: boolean;
  switchWorkspace: (workspace: Workspace) => void;
  switchBoard: (board: Board) => void;
  refreshWorkspaces: () => Promise<Workspace[]>;
  refreshBoards: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [userRole, setUserRole] = useState<MemberRole | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshWorkspaces = useCallback(async () => {
    try {
      const res = await api.get<Workspace[]>("/workspaces");
      setWorkspaces(res.data);
      return res.data;
    } catch {
      setWorkspaces([]);
      return [];
    }
  }, []);

  const refreshBoards = useCallback(async () => {
    if (!currentWorkspace) {
      setBoards([]);
      return;
    }
    try {
      const res = await api.get<Board[]>(`/workspaces/${currentWorkspace._id}/boards`);
      setBoards(res.data);
    } catch {
      setBoards([]);
    }
  }, [currentWorkspace]);

  const switchWorkspace = useCallback((workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    setCurrentBoard(null);
    setBoards([]);
    localStorage.setItem("lastWorkspaceId", workspace._id);

    // Determine user role
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      const member = workspace.members.find(
        (m) => (m.user as unknown as { _id: string })._id === user.id || m.user.toString() === user.id
      );
      setUserRole(member?.role ?? null);
    }
  }, []);

  const switchBoard = useCallback((board: Board) => {
    setCurrentBoard(board);
    localStorage.setItem("lastBoardId", board._id);
  }, []);

  // Load workspaces on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      const ws = await refreshWorkspaces();
      if (ws.length > 0) {
        const lastId = localStorage.getItem("lastWorkspaceId");
        const target = ws.find((w) => w._id === lastId) || ws[0];
        switchWorkspace(target);
      }
      setLoading(false);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load boards when workspace changes
  useEffect(() => {
    if (currentWorkspace) {
      refreshBoards();
    }
  }, [currentWorkspace, refreshBoards]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        boards,
        currentBoard,
        userRole,
        loading,
        switchWorkspace,
        switchBoard,
        refreshWorkspaces,
        refreshBoards,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
