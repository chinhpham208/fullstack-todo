import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await api.get("/todos");
      setTodos(res.data);
    } catch {
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (!newTask.trim()) return;
    try {
      const res = await api.post("/todos", { task: newTask });
      setTodos([res.data, ...todos]);
      setNewTask("");
    } catch (err) {
      alert(err.response?.data?.error || "Error adding todo!");
    }
  };

  const toggleComplete = async (todo) => {
    try {
      const res = await api.put(`/todos/${todo._id}`, { completed: !todo.completed });
      setTodos(todos.map((t) => (t._id === todo._id ? res.data : t)));
    } catch (err) {
      alert("Error updating todo!");
    }
  };

  const deleteTodo = async (id) => {
    try {
      await api.delete(`/todos/${id}`);
      setTodos(todos.filter((t) => t._id !== id));
    } catch (err) {
      alert("Error deleting todo!");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const pendingCount = todos.filter((t) => !t.completed).length;

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>📝 Todo App</h1>
            {user && (
              <p style={styles.greeting}>Hello, <strong>{user.name}</strong>! 👋</p>
            )}
          </div>
          <button onClick={logout} style={styles.logoutButton}>
            Logout
          </button>
        </div>

        {/* Stats */}
        <div style={styles.stats}>
          <div style={styles.statItem}>
            <span style={styles.statNumber}>{todos.length}</span>
            <span style={styles.statLabel}>Total</span>
          </div>
          <div style={styles.statItem}>
            <span style={{ ...styles.statNumber, color: "#e74c3c" }}>{pendingCount}</span>
            <span style={styles.statLabel}>Pending</span>
          </div>
          <div style={styles.statItem}>
            <span style={{ ...styles.statNumber, color: "#2ecc71" }}>{todos.length - pendingCount}</span>
            <span style={styles.statLabel}>Completed</span>
          </div>
        </div>

        {/* Add form */}
        <div style={styles.addForm}>
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="Enter new task... (Press Enter to add)"
            style={styles.input}
          />
          <button onClick={addTodo} style={styles.addButton}>
            + Add
          </button>
        </div>

        {/* Todo list */}
        {loading ? (
          <p style={styles.loadingText}>⏳ Loading...</p>
        ) : todos.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: 48 }}>🎉</p>
            <p>No tasks yet! Add your first one.</p>
          </div>
        ) : (
          <div>
            {todos.map((todo) => (
              <div
                key={todo._id}
                style={{
                  ...styles.todoItem,
                  opacity: todo.completed ? 0.7 : 1,
                  background: todo.completed ? "#f8f9fa" : "white",
                }}
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleComplete(todo)}
                  style={styles.checkbox}
                />
                <span
                  style={{
                    ...styles.taskName,
                    textDecoration: todo.completed ? "line-through" : "none",
                    color: todo.completed ? "#aaa" : "#333",
                  }}
                >
                  {todo.task}
                </span>
                <button
                  onClick={() => deleteTodo(todo._id)}
                  style={styles.deleteButton}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f0f2f5",
    fontFamily: "Arial, sans-serif",
    padding: "20px",
  },
  container: {
    maxWidth: 600,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: "#333",
    margin: 0,
  },
  greeting: {
    color: "#666",
    margin: "4px 0 0 0",
    fontSize: 14,
  },
  logoutButton: {
    padding: "8px 16px",
    background: "white",
    border: "1px solid #ddd",
    borderRadius: 8,
    cursor: "pointer",
    color: "#666",
    fontSize: 14,
  },
  stats: {
    display: "flex",
    gap: 16,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    background: "white",
    borderRadius: 12,
    padding: "16px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  statNumber: {
    display: "block",
    fontSize: 32,
    fontWeight: 700,
    color: "#667eea",
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
  },
  addForm: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    border: "1px solid #ddd",
    borderRadius: 10,
    fontSize: 15,
    outline: "none",
    background: "white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  addButton: {
    padding: "12px 20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  loadingText: {
    textAlign: "center",
    color: "#999",
    padding: 40,
  },
  empty: {
    textAlign: "center",
    color: "#999",
    padding: 40,
    background: "white",
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  todoItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 16px",
    marginBottom: 8,
    borderRadius: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    transition: "all 0.2s",
  },
  checkbox: {
    width: 20,
    height: 20,
    cursor: "pointer",
    accentColor: "#667eea",
  },
  taskName: {
    flex: 1,
    fontSize: 15,
  },
  deleteButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 18,
    padding: "4px",
    borderRadius: 6,
    opacity: 0.6,
    transition: "opacity 0.2s",
  },
};
