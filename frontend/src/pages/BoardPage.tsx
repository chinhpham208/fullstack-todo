import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Typography, Button, App as AntApp } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import KanbanBoard from "../components/kanban/KanbanBoard";
import CardDetailModal from "../components/card/CardDetailModal";
import { useWorkspace } from "../contexts/WorkspaceContext";
import api from "../api";
import type { Board, Column, Card, BoardDetail } from "../types";

const { Title } = Typography;

export default function BoardPage() {
  const { workspaceId, boardId } = useParams<{ workspaceId: string; boardId: string }>();
  const navigate = useNavigate();
  const { switchBoard } = useWorkspace();
  const { message } = AntApp.useApp();

  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const fetchBoard = useCallback(async () => {
    if (!workspaceId || !boardId) return;
    try {
      const res = await api.get<BoardDetail>(`/workspaces/${workspaceId}/boards/${boardId}`);
      setBoard(res.data.board);
      setColumns(res.data.columns);
      setCards(res.data.cards);
      switchBoard(res.data.board);
    } catch {
      message.error("Failed to load board!");
      navigate(`/workspaces/${workspaceId}`);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, boardId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  const handleDataChange = (data: Partial<BoardDetail>) => {
    if (data.columns) setColumns(data.columns);
    if (data.cards) setCards(data.cards);
    if (data.board) setBoard(data.board);
  };

  const handleCardUpdate = (updatedCard: Card) => {
    setCards((prev) => prev.map((c) => c._id === updatedCard._id ? updatedCard : c));
    if (selectedCard?._id === updatedCard._id) {
      setSelectedCard(updatedCard);
    }
  };

  const handleCardDelete = (cardId: string) => {
    setCards((prev) => prev.filter((c) => c._id !== cardId));
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!board) return null;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/workspaces/${workspaceId}`)}
          type="text"
        />
        <Title level={4} style={{ margin: 0 }}>{board.name}</Title>
      </div>

      <KanbanBoard
        boardId={board._id}
        workspaceId={workspaceId!}
        columns={columns}
        cards={cards}
        onDataChange={handleDataChange}
        onCardClick={(card) => setSelectedCard(card)}
      />

      <CardDetailModal
        card={selectedCard}
        boardId={board._id}
        open={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        onUpdate={handleCardUpdate}
        onDelete={handleCardDelete}
      />
    </div>
  );
}
