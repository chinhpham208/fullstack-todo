import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout, Typography, Button, Input, Card, Checkbox, Statistic,
  Row, Col, Space, Empty, Spin, App as AntApp,
} from "antd";
import {
  PlusOutlined, DeleteOutlined, LogoutOutlined,
  CheckCircleOutlined, ClockCircleOutlined, UnorderedListOutlined,
} from "@ant-design/icons";
import api from "../api";
import type { Todo, User } from "../types";
import type { AxiosError } from "axios";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState("");
  const [taskError, setTaskError] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { message } = AntApp.useApp();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData) as User);
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await api.get<Todo[]>("/todos");
      setTodos(res.data);
    } catch {
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (!newTask.trim()) {
      setTaskError("Task cannot be empty!");
      return;
    }
    if (newTask.trim().length > 200) {
      setTaskError("Task must be under 200 characters!");
      return;
    }
    setTaskError("");
    try {
      const res = await api.post<Todo>("/todos", { task: newTask.trim() });
      setTodos([res.data, ...todos]);
      setNewTask("");
      message.success("Task added!");
    } catch (err) {
      const axiosErr = err as AxiosError<{ error: string }>;
      setTaskError(axiosErr.response?.data?.error ?? "Error adding todo!");
    }
  };

  const toggleComplete = async (todo: Todo) => {
    try {
      const res = await api.put<Todo>(`/todos/${todo._id}`, { completed: !todo.completed });
      setTodos(todos.map((t) => (t._id === todo._id ? res.data : t)));
    } catch {
      message.error("Error updating todo!");
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await api.delete(`/todos/${id}`);
      setTodos(todos.filter((t) => t._id !== id));
      message.success("Task deleted!");
    } catch {
      message.error("Error deleting todo!");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const pendingCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.length - pendingCount;

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <Header style={styles.header}>
        <div>
          <Title level={4} style={{ color: "white", margin: 0 }}>
            Todo App
          </Title>
          {user && (
            <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>
              Hello, {user.name}
            </Text>
          )}
        </div>
        <Button icon={<LogoutOutlined />} onClick={logout} ghost>
          Logout
        </Button>
      </Header>

      <Content style={{ padding: "24px 16px", maxWidth: 640, margin: "0 auto", width: "100%" }}>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="Total"
                value={todos.length}
                prefix={<UnorderedListOutlined />}
                valueStyle={{ color: "#667eea" }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="Pending"
                value={pendingCount}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="Completed"
                value={completedCount}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
        </Row>

        <Space.Compact style={{ width: "100%", marginBottom: 24 }}>
          <Input
            size="large"
            value={newTask}
            onChange={(e) => { setNewTask(e.target.value); setTaskError(""); }}
            onPressEnter={addTodo}
            placeholder="Enter new task..."
            status={taskError ? "error" : ""}
          />
          <Button size="large" type="primary" icon={<PlusOutlined />} onClick={addTodo}>
            Add
          </Button>
        </Space.Compact>
        {taskError && (
          <Text type="danger" style={{ display: "block", marginTop: -16, marginBottom: 16, fontSize: 13 }}>
            {taskError}
          </Text>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <Spin size="large" />
          </div>
        ) : todos.length === 0 ? (
          <Card>
            <Empty description="No tasks yet! Add your first one." />
          </Card>
        ) : (
          <Space direction="vertical" style={{ width: "100%" }} size={8}>
            {todos.map((todo) => (
              <Card
                key={todo._id}
                size="small"
                style={{
                  opacity: todo.completed ? 0.65 : 1,
                  background: todo.completed ? "#fafafa" : "white",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Checkbox
                    checked={todo.completed}
                    onChange={() => toggleComplete(todo)}
                  />
                  <Text
                    style={{ flex: 1 }}
                    delete={todo.completed}
                    type={todo.completed ? "secondary" : undefined}
                  >
                    {todo.task}
                  </Text>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteTodo(todo._id)}
                    size="small"
                  />
                </div>
              </Card>
            ))}
          </Space>
        )}
      </Content>
    </Layout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "0 24px",
  },
};
