import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Typography, Button, Input, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import KanbanCard from "./KanbanCard";
import type { Column, Card } from "../../types";

const { Text } = Typography;

interface KanbanColumnProps {
  column: Column;
  cards: Card[];
  onAddCard: (columnId: string, title: string) => void;
  onCardClick: (card: Card) => void;
}

export default function KanbanColumn({ column, cards, onAddCard, onCardClick }: KanbanColumnProps) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const { setNodeRef, isOver } = useDroppable({
    id: column._id,
    data: { type: "column", column },
  });

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    onAddCard(column._id, newTitle.trim());
    setNewTitle("");
    setAdding(false);
  };

  return (
    <div
      style={{
        width: 280,
        minWidth: 280,
        background: isOver ? "#e6f4ff" : "#f5f5f5",
        borderRadius: 12,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        maxHeight: "calc(100vh - 180px)",
        transition: "background 0.2s",
      }}
    >
      {/* Column header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Space>
          <Text strong style={{ fontSize: 14 }}>{column.name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{cards.length}</Text>
        </Space>
      </div>

      {/* Cards container */}
      <div
        ref={setNodeRef}
        style={{ flex: 1, overflowY: "auto", minHeight: 40 }}
      >
        <SortableContext
          items={cards.map((c) => c._id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <KanbanCard
              key={card._id}
              card={card}
              onClick={() => onCardClick(card)}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add card */}
      {adding ? (
        <div style={{ marginTop: 8 }}>
          <Input.TextArea
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter card title..."
            autoSize={{ minRows: 2 }}
            autoFocus
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleAdd();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setAdding(false);
            }}
          />
          <Space style={{ marginTop: 8 }}>
            <Button size="small" type="primary" onClick={handleAdd}>
              Add
            </Button>
            <Button size="small" onClick={() => { setAdding(false); setNewTitle(""); }}>
              Cancel
            </Button>
          </Space>
        </div>
      ) : (
        <Button
          type="text"
          icon={<PlusOutlined />}
          onClick={() => setAdding(true)}
          style={{ marginTop: 8, textAlign: "left", color: "#8c8c8c" }}
          block
        >
          Add a card
        </Button>
      )}
    </div>
  );
}
