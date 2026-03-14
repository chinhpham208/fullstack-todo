import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes";
import todoRoutes from "./routes/todoRoutes";
import workspaceRoutes from "./routes/workspaceRoutes";
import boardRoutes from "./routes/boardRoutes";
import columnRoutes from "./routes/columnRoutes";
import cardRoutes from "./routes/cardRoutes";
import commentRoutes from "./routes/commentRoutes";
import activityRoutes from "./routes/activityRoutes";
import invitationRoutes from "./routes/invitationRoutes";

// Validate required env vars on startup
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET"];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

const app = express();

// Security headers
app.use(helmet());

// Logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? [...process.env.ALLOWED_ORIGINS.split(","), "http://localhost:5173"]
  : ["http://localhost:5173"];

app.use(cors({ origin: allowedOrigins, credentials: true }));

// Body parser with size limit
app.use(express.json({ limit: "10kb" }));

// Rate limiting on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many requests, please try again later." },
});

// Routes
app.use("/auth", authLimiter, authRoutes);
app.use("/todos", todoRoutes);
app.use("/workspaces", workspaceRoutes);
app.use("/workspaces/:workspaceId/boards", boardRoutes);
app.use("/workspaces/:workspaceId/activity", activityRoutes);
app.use("/boards/:boardId/columns", columnRoutes);
app.use("/boards/:boardId/cards", cardRoutes);
app.use("/cards/:cardId/comments", commentRoutes);
app.use("/invitations", invitationRoutes);

// Connect MongoDB
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => console.log("✅ MongoDB connected!"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// Health check
app.get("/ping", (_req, res) => {
  res.json({ message: "Server is running! 🚀" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
