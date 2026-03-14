import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card as AntCard, Typography, Avatar, Tooltip, Space } from "antd";
import { CheckCircleFilled, MessageOutlined } from "@ant-design/icons";
import type { Card } from "../../types";

const { Text } = Typography;

interface KanbanCardProps {
  card: Card;
  onClick: () => void;
}

export default function KanbanCard({ card, onClick }: KanbanCardProps) {
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

        {(card.assignees.length > 0 || card.description) && (
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
        )}
      </AntCard>
    </div>
  );
}
