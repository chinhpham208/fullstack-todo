import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AxiosError } from "axios";
import api from "../api";
import type { AuthResponse, RegisterFormData } from "../types";

const schema = yup.object({
  name: yup.string().trim().min(2, "Name must be at least 2 characters!").required("Name is required!"),
  email: yup.string().email("Please enter a valid email address!").required("Email is required!"),
  password: yup.string().min(6, "Password must be at least 6 characters!").required("Password is required!"),
});

export default function Register() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ resolver: yupResolver(schema) });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const res = await api.post<AuthResponse>("/auth/register", data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      const axiosErr = err as AxiosError<{ error: string }>;
      setError("root", { message: axiosErr.response?.data?.error || "Registration failed!" });
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <h1 style={styles.logo}>📝 Todo App</h1>
        <h2 style={styles.title}>Register</h2>

        {errors.root && <p style={styles.errorText}>{errors.root.message}</p>}

        <input
          type="text"
          placeholder="Full name"
          {...register("name")}
          style={{ ...styles.input, border: errors.name ? "1px solid #e74c3c" : "1px solid #ddd" }}
        />
        {errors.name && <p style={styles.fieldError}>{errors.name.message}</p>}

        <input
          type="email"
          placeholder="Email"
          {...register("email")}
          style={{ ...styles.input, border: errors.email ? "1px solid #e74c3c" : "1px solid #ddd" }}
        />
        {errors.email && <p style={styles.fieldError}>{errors.email.message}</p>}

        <input
          type="password"
          placeholder="Password (at least 6 characters)"
          {...register("password")}
          style={{ ...styles.input, border: errors.password ? "1px solid #e74c3c" : "1px solid #ddd" }}
        />
        {errors.password && <p style={styles.fieldError}>{errors.password.message}</p>}

        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          style={{ ...styles.button, opacity: isSubmitting ? 0.7 : 1 }}
        >
          {isSubmitting ? "Registering..." : "Register"}
        </button>

        <p style={styles.link}>
          Already have an account?{" "}
          <Link to="/login" style={styles.linkAnchor}>Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
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
  logo: { textAlign: "center", fontSize: 32, marginBottom: 8 },
  title: { textAlign: "center", color: "#333", marginBottom: 24, fontWeight: 600 },
  errorText: {
    color: "#e74c3c",
    background: "#fde8e8",
    padding: "10px 14px",
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
  },
  fieldError: { color: "#e74c3c", fontSize: 12, marginTop: -8, marginBottom: 8 },
  input: {
    display: "block",
    width: "100%",
    padding: "12px 14px",
    marginBottom: 4,
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
    marginTop: 12,
  },
  link: { textAlign: "center", marginTop: 20, color: "#666", fontSize: 14 },
  linkAnchor: { color: "#667eea", fontWeight: 600 },
};
