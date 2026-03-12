import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Timeline, Typography, Spin, Card, Button, Empty } from "antd";
import {
  PlusCircleOutlined, SwapOutlined, EditOutlined, DeleteOutlined,
  CommentOutlined, UserAddOutlined, LoginOutlined,
  AppstoreAddOutlined, InsertRowAboveOutlined, CloseSquareOutlined,
} from "@ant-design/icons";
import api from "../api";
import type { Activity } from "../types";

const { Title, Text } = Typography;

const actionConfig: Record<string, { icon: React.ReactNode; color: string; label: (m: Record<string, unknown>) => string }> = {
  card_created: {
    icon: <PlusCircleOutlined />,
    color: "#52c41a",
    label: (m) => `created card "${m.title || ""}" in ${m.column || ""}`,
  },
  card_moved: {
    icon: <SwapOutlined />,
    color: "#1890ff",
    label: (m) => `moved card from "${m.fromColumn || ""}" to "${m.toColumn || ""}"`,
  },
  card_updated: {
    icon: <EditOutlined />,
    color: "#faad14",
    label: (m) => `updated card (${(m.fields as string[])?.join(", ") || "fields"})`,
  },
  card_deleted: {
    icon: <DeleteOutlined />,
    color: "#ff4d4f",
    label: (m) => `deleted card "${m.title || ""}"`,
  },
  comment_added: {
    icon: <CommentOutlined />,
    color: "#722ed1",
    label: (m) => `commented on "${m.cardTitle || ""}"`,
  },
  member_invited: {
    icon: <UserAddOutlined />,
    color: "#13c2c2",
    label: (m) => `invited ${m.email || ""} as ${m.role || "member"}`,
  },
  member_joined: {
    icon: <LoginOutlined />,
    color: "#52c41a",
    label: (m) => `${m.name || ""} joined the workspace`,
  },
  board_created: {
    icon: <AppstoreAddOutlined />,
    color: "#667eea",
    label: (m) => `created board "${m.name || ""}"`,
  },
  column_created: {
    icon: <InsertRowAboveOutlined />,
    color: "#667eea",
    label: (m) => `created column "${m.name || ""}"`,
  },
  column_deleted: {
    icon: <CloseSquareOutlined />,
    color: "#ff4d4f",
    label: (m) => `deleted column "${m.name || ""}"`,
  },
};

interface PaginatedResponse {
  activities: Activity[];
  pagination: { page: number; pages: number; total: number };
}

export default function ActivityPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [workspaceId, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchActivities = async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse>(
        `/workspaces/${workspaceId}/activity?page=${page}&limit=20`
      );
      if (page === 1) {
        setActivities(res.data.activities);
      } else {
        setActivities((prev) => [...prev, ...res.data.activities]);
      }
      setTotalPages(res.data.pagination.pages);
    } catch {
      // silent
    } finally {
      setLoading(false);
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
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <Title level={3}>Activity</Title>

      {loading && activities.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <Spin size="large" />
        </div>
      ) : activities.length === 0 ? (
        <Card>
          <Empty description="No activity yet" />
        </Card>
      ) : (
        <>
          <Timeline
            items={activities.map((activity) => {
              const config = actionConfig[activity.action] || {
                icon: <EditOutlined />,
                color: "#999",
                label: () => activity.action,
              };
              return {
                dot: <span style={{ color: config.color }}>{config.icon}</span>,
                children: (
                  <div>
                    <Text strong>{activity.user.name}</Text>{" "}
                    <Text>{config.label(activity.metadata)}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatTime(activity.createdAt)}
                    </Text>
                  </div>
                ),
              };
            })}
          />

          {page < totalPages && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <Button
                onClick={() => setPage((p) => p + 1)}
                loading={loading}
              >
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
