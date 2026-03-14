import { useState, useEffect } from "react";
import { List, Avatar, Input, Button, Typography, Space, Popconfirm, App as AntApp } from "antd";
import { SendOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import api from "../../api";
import type { Comment, User } from "../../types";

const { Text } = Typography;

interface CommentSectionProps {
  cardId: string;
}

export default function CommentSection({ cardId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const { message } = AntApp.useApp();

  const currentUser: User | null = (() => {
    const data = localStorage.getItem("user");
    return data ? JSON.parse(data) : null;
  })();

  useEffect(() => {
    fetchComments();
  }, [cardId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchComments = async () => {
    try {
      const res = await api.get<Comment[]>(`/cards/${cardId}/comments`);
      setComments(res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post<Comment>(`/cards/${cardId}/comments`, { content: content.trim() });
      setComments([...comments, res.data]);
      setContent("");
    } catch {
      message.error("Failed to add comment!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;
    try {
      const res = await api.put<Comment>(`/cards/${cardId}/comments/${commentId}`, { content: editContent.trim() });
      setComments(comments.map((c) => c._id === commentId ? res.data : c));
      setEditingId(null);
    } catch {
      message.error("Failed to edit comment!");
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await api.delete(`/cards/${cardId}/comments/${commentId}`);
      setComments(comments.filter((c) => c._id !== commentId));
    } catch {
      message.error("Failed to delete comment!");
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div>
      <Text strong style={{ display: "block", marginBottom: 12 }}>
        Comments ({comments.length})
      </Text>

      <List
        loading={loading}
        dataSource={comments}
        locale={{ emptyText: "No comments yet" }}
        renderItem={(comment) => (
          <List.Item
            style={{ padding: "8px 0", alignItems: "flex-start" }}
            actions={
              currentUser && (currentUser.id === (comment.author.id || comment.author._id))
                ? [
                    <Button
                      key="edit"
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => { setEditingId(comment._id); setEditContent(comment.content); }}
                    />,
                    <Popconfirm
                      key="delete"
                      title="Delete comment?"
                      onConfirm={() => handleDelete(comment._id)}
                    >
                      <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>,
                  ]
                : undefined
            }
          >
            <List.Item.Meta
              avatar={
                <Avatar style={{ backgroundColor: "#667eea" }} size="small">
                  {comment.author.name.charAt(0).toUpperCase()}
                </Avatar>
              }
              title={
                <Space size={8}>
                  <Text strong style={{ fontSize: 13 }}>{comment.author.name}</Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>{formatTime(comment.createdAt)}</Text>
                </Space>
              }
              description={
                editingId === comment._id ? (
                  <div>
                    <Input.TextArea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      autoSize={{ minRows: 1 }}
                      autoFocus
                    />
                    <Space style={{ marginTop: 4 }}>
                      <Button size="small" type="primary" onClick={() => handleEdit(comment._id)}>Save</Button>
                      <Button size="small" onClick={() => setEditingId(null)}>Cancel</Button>
                    </Space>
                  </div>
                ) : (
                  <Text style={{ whiteSpace: "pre-wrap", fontSize: 13 }}>{comment.content}</Text>
                )
              }
            />
          </List.Item>
        )}
      />

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <Input.TextArea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment... (use @name to mention)"
          autoSize={{ minRows: 1, maxRows: 4 }}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSubmit}
          loading={submitting}
          disabled={!content.trim()}
        />
      </div>
    </div>
  );
}
