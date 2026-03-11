import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError("Please fill in all fields!");
      return;
    }
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters!");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address!");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters!");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await api.post("/auth/register", { name, email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <h1 style={styles.logo}>📝 Todo App</h1>
        <h2 style={styles.title}>Register</h2>

        {error && <p style={styles.errorText}>{error}</p>}

        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password (at least 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRegister()}
          style={styles.input}
        />
        <button
          onClick={handleRegister}
          disabled={loading}
          style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p style={styles.link}>
          Already have an account?{" "}
          <Link to="/login" style={styles.linkAnchor}>
            Login
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
