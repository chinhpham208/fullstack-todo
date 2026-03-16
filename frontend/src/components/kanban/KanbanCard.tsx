import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card as AntCard, Typography, Avatar, Tooltip, Space, Popover, Button } from "antd";
import { CheckCircleFilled, MessageOutlined, SmileOutlined } from "@ant-design/icons";
import type { Card } from "../../types";
import api from "../../api";

const { Text } = Typography;

const EMOJI_LIST = ["✅", "🔥", "🤔", "👀", "💭", "🚀", "👍", "👎"];

interface KanbanCardProps {
  card: Card;
  onClick: () => void;
  onUpdate: (card: Card) => void;
}

export default function KanbanCard({ card, onClick, onUpdate }: KanbanCardProps) {
  const [loading, setLoading] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card._id, data: { type: "card", card } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  };

  const handleReaction = async (emoji: string) => {
    setLoading(true);
    try {
      const res = await api.post<Card>(`/boards/${card.board}/cards/${card._id}/reactions`, { emoji });
      onUpdate(res.data);
    } catch (err) {
      console.error("Failed to add reaction:", err);
    } finally {
      setLoading(false);
    }
  };

  const reactionContent = (
    <Space size={4}>
      {EMOJI_LIST.map((emoji) => (
        <Button
          key={emoji}
          type="text"
          size="small"
          onClick={() => handleReaction(emoji)}
          loading={loading}
          style={{ fontSize: 16, padding: "2px 6px" }}
        >
          {emoji}
        </Button>
      ))}
    </Space>
  );

  // Group reactions by emoji
  const groupedReactions = card.reactions?.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <AntCard
        size="small"
        style={{
          marginBottom: 8,
          borderRadius: 8,
          border: card.completed ? "1px solid #b7eb8f" : "1px solid #f0f0f0",
          background: card.completed ? "#f6ffed" : "white",
        }}
        bodyStyle={{ padding: "10px 12px" }}
        onClick={onClick}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          {card.completed && (
            <CheckCircleFilled style={{ color: "#52c41a", marginTop: 3 }} />
          )}
          <Text
            style={{ flex: 1, fontSize: 13 }}
            delete={card.completed}
            type={card.completed ? "secondary" : undefined}
          >
            {card.title}
          </Text>
        </div>

        <Space style={{ marginTop: 8 }} size={4}>
          {card.description && (
            <MessageOutlined style={{ fontSize: 12, color: "#bfbfbf" }} />
          )}
          <Avatar.Group size="small" max={{ count: 3 }}>
            {card.assignees.map((a) => (
              <Tooltip key={a.id || a._id} title={a.name}>
                <Avatar size="small" style={{ backgroundColor: "#667eea", fontSize: 10 }}>
                  {a.name.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
            ))}
          </Avatar.Group>
        </Space>

        {/* Reactions display */}
        {Object.keys(groupedReactions).length > 0 && (
          <Space style={{ marginTop: 6 }} size={4}>
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <Tooltip key={emoji} title={`${count} reaction${count > 1 ? "s" : ""}`}>
                <span
                  style={{
                    fontSize: 12,
                    background: "#f5f5f5",
                    padding: "2px 6px",
                    borderRadius: 10,
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReaction(emoji);
                  }}
                >
                  {emoji} {count}
                </span>
              </Tooltip>
            ))}
          </Space>
        )}

        {/* Add reaction button */}
        <Popover content={reactionContent} trigger="click" placement="bottom">
          <Button
            type="text"
            size="small"
            icon={<SmileOutlined />}
            style={{
              marginTop: 6,
              fontSize: 12,
              color: "#bfbfbf",
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </Popover>
      </AntCard>
    </div>
  );
}
