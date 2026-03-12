import { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { Layout, Menu, Button, Typography, Select, Divider, Space } from "antd";
import {
  AppstoreOutlined, TeamOutlined, HistoryOutlined,
  LogoutOutlined, PlusOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import type { Workspace } from "../../types";

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    workspaces, currentWorkspace, boards, currentBoard,
    switchWorkspace, switchBoard,
  } = useWorkspace();

  const user = (() => {
    const data = localStorage.getItem("user");
    return data ? JSON.parse(data) : null;
  })();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("lastWorkspaceId");
    localStorage.removeItem("lastBoardId");
    navigate("/login");
  };

  const handleWorkspaceChange = (workspaceId: string) => {
    if (workspaceId === "__new__") {
      navigate("/workspaces");
      return;
    }
    const ws = workspaces.find((w) => w._id === workspaceId);
    if (ws) {
      switchWorkspace(ws);
      navigate(`/workspaces/${ws._id}`);
    }
  };

  const handleBoardClick = (board: { _id: string }) => {
    const b = boards.find((bb) => bb._id === board._id);
    if (b && currentWorkspace) {
      switchBoard(b);
      navigate(`/workspaces/${currentWorkspace._id}/boards/${b._id}`);
    }
  };

  const menuItems = [
    ...(currentWorkspace ? [
      {
        key: "boards-header",
        type: "group" as const,
        label: "Boards",
        children: [
          ...boards.map((b) => ({
            key: `board-${b._id}`,
            icon: <AppstoreOutlined />,
            label: b.name,
            onClick: () => handleBoardClick(b),
          })),
          {
            key: "new-board",
            icon: <PlusOutlined />,
            label: "New Board",
            onClick: () => navigate(`/workspaces/${currentWorkspace._id}/boards/new`),
          },
        ],
      },
      { type: "divider" as const, key: "div1" },
      {
        key: "members",
        icon: <TeamOutlined />,
        label: "Members",
        onClick: () => navigate(`/workspaces/${currentWorkspace._id}/members`),
      },
      {
        key: "activity",
        icon: <HistoryOutlined />,
        label: "Activity",
        onClick: () => navigate(`/workspaces/${currentWorkspace._id}/activity`),
      },
    ] : []),
  ];

  // Determine selected key
  const selectedKeys: string[] = [];
  if (currentBoard) selectedKeys.push(`board-${currentBoard._id}`);
  if (location.pathname.includes("/members")) selectedKeys.push("members");
  if (location.pathname.includes("/activity")) selectedKeys.push("activity");

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={240}
        style={{ background: "#fff", borderRight: "1px solid #f0f0f0" }}
      >
        <div style={{ padding: collapsed ? "16px 8px" : "16px" }}>
          <Select
            value={currentWorkspace?._id}
            onChange={handleWorkspaceChange}
            style={{ width: "100%" }}
            size={collapsed ? "small" : "middle"}
            placeholder="Select workspace"
            options={[
              ...workspaces.map((w: Workspace) => ({ label: w.name, value: w._id })),
              { label: "+ New Workspace", value: "__new__" },
            ]}
          />
        </div>

        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          style={{ border: "none" }}
        />
      </Sider>

      <Layout>
        <Header style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
        }}>
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ color: "white", fontSize: 16 }}
            />
            <Text style={{ color: "white", fontSize: 16, fontWeight: 600 }}>
              {currentWorkspace?.name || "TaskFlow"}
            </Text>
          </Space>
          <Space>
            {user && (
              <Text style={{ color: "rgba(255,255,255,0.8)" }}>
                {user.name}
              </Text>
            )}
            <Divider type="vertical" style={{ background: "rgba(255,255,255,0.3)" }} />
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={logout}
              style={{ color: "white" }}
            >
              {collapsed ? "" : "Logout"}
            </Button>
          </Space>
        </Header>

        <Content style={{ padding: 24, background: "#f5f5f5", overflow: "auto" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
