import { useState, useMemo } from "react";
import {
  DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent, type DragOverEvent,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { Button, Input, Space, App as AntApp } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";
import api from "../../api";
import type { Column, Card, BoardDetail } from "../../types";

interface KanbanBoardProps {
  boardId: string;
  workspaceId: string;
  columns: Column[];
  cards: Card[];
  onDataChange: (data: Partial<BoardDetail>) => void;
  onCardClick: (card: Card) => void;
}

export default function KanbanBoard({
  boardId, workspaceId, columns, cards, onDataChange, onCardClick,
}: KanbanBoardProps) {
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const { message } = AntApp.useApp();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Group cards by column
  const cardsByColumn = useMemo(() => {
    const map: Record<string, Card[]> = {};
    columns.forEach((col) => { map[col._id] = []; });
    cards.forEach((card) => {
      if (map[card.column]) {
        map[card.column].push(card);
      }
    });
    // Sort each column's cards by position
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.position - b.position));
    return map;
  }, [columns, cards]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = cards.find((c) => c._id === active.id);
    if (card) setActiveCard(card);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeCardId = active.id as string;
    const overId = over.id as string;

    const activeCard = cards.find((c) => c._id === activeCardId);
    if (!activeCard) return;

    // Determine target column
    let targetColumnId: string;
    const overCard = cards.find((c) => c._id === overId);
    if (overCard) {
      targetColumnId = overCard.column;
    } else {
      // Dropped on column itself
      targetColumnId = overId;
    }

    if (activeCard.column !== targetColumnId) {
      // Move card to new column optimistically
      const updated = cards.map((c) =>
        c._id === activeCardId ? { ...c, column: targetColumnId } : c
      );
      onDataChange({ cards: updated });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const activeCardId = active.id as string;
    const card = cards.find((c) => c._id === activeCardId);
    if (!card) return;

    // Determine target column and position
    let targetColumnId: string;
    const overCard = cards.find((c) => c._id === (over.id as string));
    if (overCard) {
      targetColumnId = overCard.column;
    } else {
      targetColumnId = over.id as string;
    }

    // Calculate new position
    const colCards = cards
      .filter((c) => c.column === targetColumnId && c._id !== activeCardId)
      .sort((a, b) => a.position - b.position);

    let newPosition: number;
    if (overCard && overCard._id !== activeCardId) {
      const overIndex = colCards.findIndex((c) => c._id === overCard._id);
      if (overIndex === 0) {
        newPosition = colCards[0].position / 2;
      } else if (overIndex === colCards.length - 1) {
        newPosition = colCards[colCards.length - 1].position + 1000;
      } else {
        newPosition = (colCards[overIndex - 1].position + colCards[overIndex].position) / 2;
      }
    } else {
      // Dropped on empty column or at end
      newPosition = colCards.length > 0 ? colCards[colCards.length - 1].position + 1000 : 1000;
    }

    // Optimistic update
    const updated = cards.map((c) =>
      c._id === activeCardId ? { ...c, column: targetColumnId, position: newPosition } : c
    );
    onDataChange({ cards: updated });

    // API call
    try {
      await api.put(`/boards/${boardId}/cards/${activeCardId}/move`, {
        columnId: targetColumnId,
        position: Math.round(newPosition),
      });
    } catch {
      message.error("Failed to move card!");
      // Revert by refetching
      const res = await api.get(`/workspaces/${workspaceId}/boards/${boardId}`);
      onDataChange(res.data);
    }
  };

  const handleAddCard = async (columnId: string, title: string) => {
    try {
      const res = await api.post<Card>(`/boards/${boardId}/cards`, {
        title,
        columnId,
      });
      onDataChange({ cards: [...cards, res.data] });
      message.success("Card added!");
    } catch {
      message.error("Failed to add card!");
    }
  };

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) return;
    try {
      const res = await api.post<Column>(`/boards/${boardId}/columns`, {
        name: newColumnName.trim(),
      });
      onDataChange({ columns: [...columns, res.data] });
      setNewColumnName("");
      setAddingColumn(false);
      message.success("Column added!");
    } catch {
      message.error("Failed to add column!");
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div style={{ display: "flex", gap: 16, overflowX: "auto", padding: "4px 0", alignItems: "flex-start" }}>
        <SortableContext items={columns.map((c) => c._id)} strategy={horizontalListSortingStrategy}>
          {columns
            .sort((a, b) => a.position - b.position)
            .map((column) => (
              <KanbanColumn
                key={column._id}
                column={column}
                cards={cardsByColumn[column._id] || []}
                onAddCard={handleAddCard}
                onCardClick={onCardClick}
              />
            ))}
        </SortableContext>

        {/* Add column */}
        <div style={{ minWidth: 280 }}>
          {addingColumn ? (
            <div style={{ background: "#f5f5f5", borderRadius: 12, padding: 12 }}>
              <Input
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Column name..."
                autoFocus
                onPressEnter={handleAddColumn}
                onKeyDown={(e) => { if (e.key === "Escape") setAddingColumn(false); }}
              />
              <Space style={{ marginTop: 8 }}>
                <Button size="small" type="primary" onClick={handleAddColumn}>Add</Button>
                <Button size="small" onClick={() => { setAddingColumn(false); setNewColumnName(""); }}>Cancel</Button>
              </Space>
            </div>
          ) : (
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => setAddingColumn(true)}
              style={{ width: 280, height: 48, borderRadius: 12 }}
            >
              Add Column
            </Button>
          )}
        </div>
      </div>

      <DragOverlay>
        {activeCard ? (
          <KanbanCard card={activeCard} onClick={() => {}} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
