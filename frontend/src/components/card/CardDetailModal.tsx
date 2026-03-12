import { useState, useEffect } from "react";
import { Modal, Input, Typography, Space, Tag, Button, Divider, App as AntApp } from "antd";
import { DeleteOutlined, CheckCircleOutlined } from "@ant-design/icons";
import api from "../../api";
import type { Card } from "../../types";

const { Text, Title } = Typography;

interface CardDetailModalProps {
  card: Card | null;
  boardId: string;
  open: boolean;
  onClose: () => void;
  onUpdate: (card: Card) => void;
  onDelete: (cardId: string) => void;
}

export default function CardDetailModal({
  card, boardId, open, onClose, onUpdate, onDelete,
}: CardDetailModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const { message } = AntApp.useApp();

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || "");
      setEditingTitle(false);
      setEditingDesc(false);
    }
  }, [card]);

  if (!card) return null;

  const saveTitle = async () => {
    if (!title.trim() || title.trim() === card.title) {
      setTitle(card.title);
      setEditingTitle(false);
      return;
    }
    try {
      const res = await api.put<Card>(`/boards/${boardId}/cards/${card._id}`, { title: title.trim() });
      onUpdate(res.data);
      setEditingTitle(false);
    } catch {
      message.error("Failed to update title!");
    }
  };

  const saveDescription = async () => {
    if (description === (card.description || "")) {
      setEditingDesc(false);
      return;
    }
    try {
      const res = await api.put<Card>(`/boards/${boardId}/cards/${card._id}`, { description });
      onUpdate(res.data);
      setEditingDesc(false);
    } catch {
      message.error("Failed to update description!");
    }
  };

  const toggleComplete = async () => {
    try {
      const res = await api.put<Card>(`/boards/${boardId}/cards/${card._id}`, { completed: !card.completed });
      onUpdate(res.data);
    } catch {
      message.error("Failed to update card!");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/boards/${boardId}/cards/${card._id}`);
      onDelete(card._id);
      onClose();
      message.success("Card deleted!");
    } catch {
      message.error("Failed to delete card!");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={560}
      styles={{ body: { padding: "16px 0" } }}
    >
      {/* Title */}
      <div style={{ padding: "0 24px" }}>
        {editingTitle ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onPressEnter={saveTitle}
            autoFocus
            size="large"
            style={{ fontWeight: 600 }}
          />
        ) : (
          <Title
            level={4}
            style={{ margin: 0, cursor: "pointer" }}
            onClick={() => setEditingTitle(true)}
          >
            {card.completed && <CheckCircleOutlined style={{ color: "#52c41a", marginRight: 8 }} />}
            {card.title}
          </Title>
        )}

        <Space style={{ marginTop: 8 }}>
          <Tag color={card.completed ? "success" : "processing"}>
            {card.completed ? "Completed" : "In Progress"}
          </Tag>
          <Button size="small" onClick={toggleComplete}>
            {card.completed ? "Mark Incomplete" : "Mark Complete"}
          </Button>
        </Space>
      </div>

      <Divider />

      {/* Description */}
      <div style={{ padding: "0 24px" }}>
        <Text strong style={{ marginBottom: 8, display: "block" }}>Description</Text>
        {editingDesc ? (
          <div>
            <Input.TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoSize={{ minRows: 3 }}
              autoFocus
              placeholder="Add a description..."
            />
            <Space style={{ marginTop: 8 }}>
              <Button size="small" type="primary" onClick={saveDescription}>Save</Button>
              <Button size="small" onClick={() => { setDescription(card.description || ""); setEditingDesc(false); }}>Cancel</Button>
            </Space>
          </div>
        ) : (
          <div
            onClick={() => setEditingDesc(true)}
            style={{
              padding: "8px 12px",
              background: "#f5f5f5",
              borderRadius: 8,
              cursor: "pointer",
              minHeight: 60,
              color: description ? "#333" : "#bfbfbf",
              whiteSpace: "pre-wrap",
            }}
          >
            {description || "Click to add a description..."}
          </div>
        )}
      </div>

      <Divider />

      {/* Actions */}
      <div style={{ padding: "0 24px", display: "flex", justifyContent: "flex-end" }}>
        <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
          Delete Card
        </Button>
      </div>
    </Modal>
  );
}
