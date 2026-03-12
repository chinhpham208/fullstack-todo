import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card, Button, Input, Typography, Row, Col, Empty, Space, Modal, Form, App as AntApp,
} from "antd";
import {
  PlusOutlined, TeamOutlined,
} from "@ant-design/icons";
import { useWorkspace } from "../contexts/WorkspaceContext";
import api from "../api";
import type { Workspace } from "../types";

const { Title, Text } = Typography;

export default function WorkspaceListPage() {
  const { workspaces, switchWorkspace, refreshWorkspaces } = useWorkspace();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const { message } = AntApp.useApp();

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await api.post<Workspace>("/workspaces", {
        name: name.trim(),
        description: description.trim(),
      });
      await refreshWorkspaces();
      switchWorkspace(res.data);
      navigate(`/workspaces/${res.data._id}`);
      setModalOpen(false);
      setName("");
      setDescription("");
      message.success("Workspace created!");
    } catch {
      message.error("Failed to create workspace!");
    } finally {
      setCreating(false);
    }
  };

  const handleSelectWorkspace = (ws: Workspace) => {
    switchWorkspace(ws);
    navigate(`/workspaces/${ws._id}`);
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Workspaces</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          New Workspace
        </Button>
      </div>

      {workspaces.length === 0 ? (
        <Card>
          <Empty description="No workspaces yet. Create your first one!">
            <Button type="primary" onClick={() => setModalOpen(true)}>
              Create Workspace
            </Button>
          </Empty>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {workspaces.map((ws) => (
            <Col xs={24} sm={12} md={8} key={ws._id}>
              <Card
                hoverable
                onClick={() => handleSelectWorkspace(ws)}
                style={{ height: "100%" }}
              >
                <Title level={5} style={{ margin: 0 }}>{ws.name}</Title>
                {ws.description && (
                  <Text type="secondary" style={{ display: "block", marginTop: 4 }}>
                    {ws.description}
                  </Text>
                )}
                <Space style={{ marginTop: 12 }}>
                  <TeamOutlined />
                  <Text type="secondary">{ws.members.length} member{ws.members.length !== 1 ? "s" : ""}</Text>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title="Create Workspace"
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => setModalOpen(false)}
        okText="Create"
        okButtonProps={{ loading: creating, disabled: !name.trim() }}
      >
        <Form layout="vertical">
          <Form.Item label="Name" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Workspace"
              maxLength={100}
              onPressEnter={handleCreate}
            />
          </Form.Item>
          <Form.Item label="Description">
            <Input.TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this workspace for?"
              maxLength={500}
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
