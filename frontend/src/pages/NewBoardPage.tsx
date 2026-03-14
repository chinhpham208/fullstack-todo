import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Input, Button, Typography, Form, App as AntApp } from "antd";
import { useWorkspace } from "../contexts/WorkspaceContext";
import api from "../api";
import type { Board } from "../types";

const { Title } = Typography;

export default function NewBoardPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { refreshBoards, switchBoard } = useWorkspace();
  const { message } = AntApp.useApp();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !workspaceId) return;
    setCreating(true);
    try {
      const res = await api.post<Board>(`/workspaces/${workspaceId}/boards`, { name: name.trim() });
      await refreshBoards();
      switchBoard(res.data);
      navigate(`/workspaces/${workspaceId}/boards/${res.data._id}`);
      message.success("Board created!");
    } catch {
      message.error("Failed to create board!");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", paddingTop: 40 }}>
      <Title level={3}>Create Board</Title>
      <Card>
        <Form layout="vertical" onFinish={handleCreate}>
          <Form.Item label="Board Name" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sprint 1, Marketing Campaign..."
              maxLength={100}
              size="large"
              autoFocus
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={creating}
            disabled={!name.trim()}
            size="large"
          >
            Create Board
          </Button>
        </Form>
      </Card>
    </div>
  );
}
