import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, App as AntApp } from "antd";
import Login from "./pages/Login";
import Register from "./pages/Register";
import WorkspaceListPage from "./pages/WorkspaceListPage";
import BoardPage from "./pages/BoardPage";
import NewBoardPage from "./pages/NewBoardPage";
import AppLayout from "./components/layout/AppLayout";
import { WorkspaceProvider } from "./contexts/WorkspaceContext";

const theme = {
  token: {
    colorPrimary: "#667eea",
    borderRadius: 8,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
};

interface PrivateRouteProps {
  children: React.ReactNode;
}

function PrivateRoute({ children }: PrivateRouteProps) {
  const token = localStorage.getItem("token");
  return token ? <>{children}</> : <Navigate to="/login" />;
}

// Placeholder for pages coming in later PRs
function Placeholder({ text }: { text: string }) {
  return <div style={{ padding: 24, color: "#999" }}>{text}</div>;
}

export default function App() {
  return (
    <ConfigProvider theme={theme}>
      <AntApp>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <WorkspaceProvider>
                    <AppLayout />
                  </WorkspaceProvider>
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/workspaces" replace />} />
              <Route path="workspaces" element={<WorkspaceListPage />} />
              <Route path="workspaces/:workspaceId" element={<Placeholder text="Select a board from the sidebar, or create a new one." />} />
              <Route path="workspaces/:workspaceId/boards/new" element={<NewBoardPage />} />
              <Route path="workspaces/:workspaceId/boards/:boardId" element={<BoardPage />} />
              <Route path="workspaces/:workspaceId/members" element={<Placeholder text="Team management coming soon..." />} />
              <Route path="workspaces/:workspaceId/activity" element={<Placeholder text="Activity feed coming soon..." />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}
