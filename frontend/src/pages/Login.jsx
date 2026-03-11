import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields!");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address!");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <h1 style={styles.logo}>📝 Todo App</h1>
        <h2 style={styles.title}>Login</h2>

        {error && <p style={styles.errorText}>{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          style={styles.input}
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={styles.link}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.linkAnchor}>
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial, sans-serif",
  },
  box: {
    background: "white",
    borderRadius: 16,
    padding: "40px",
    width: "100%",
    maxWidth: 400,
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },
  logo: {
    textAlign: "center",
    fontSize: 32,
    marginBottom: 8,
  },
  title: {
    textAlign: "center",
    color: "#333",
    marginBottom: 24,
    fontWeight: 600,
  },
  errorText: {
    color: "#e74c3c",
    background: "#fde8e8",
    padding: "10px 14px",
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
  },
  input: {
    display: "block",
    width: "100%",
    padding: "12px 14px",
    marginBottom: 12,
    border: "1px solid #ddd",
    borderRadius: 8,
    fontSize: 16,
    boxSizing: "border-box",
    outline: "none",
  },
  button: {
    display: "block",
    width: "100%",
    padding: 14,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    cursor: "pointer",
    fontWeight: 600,
    marginTop: 8,
  },
  link: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
    fontSize: 14,
  },
  linkAnchor: {
    color: "#667eea",
    fontWeight: 600,
  },
};
