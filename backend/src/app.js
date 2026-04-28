import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { signup, login } from "./controllers/authController.js";
import adminRoutes from "./routes/admin.js";

import opportunitiesRoutes from "./routes/opportunities.js";
import applicationsRoutes from "./routes/applications.js";
import savedRoutes from "./routes/saved.js";
import activityRoutes from "./routes/activity.js";

dotenv.config();

const app = express();
const mongoUri = process.env.MONGO_URI;

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5175', 'http://127.0.0.1:5175'],
  credentials: true
}));
app.use(express.json());

app.use("/api/admin", adminRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .catch((err) => console.error("MongoDB Connection error:", err));

app.get("/", (req, res) => {
  res.send("CampusBridge Backend Running");
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is healthy",
    timestamp: new Date().toISOString()
  });
});

app.get("/force-login", (req, res) => {
  res.json({
    success: true,
    message: "Please login again",
    action: "CLEAR_TOKENS_AND_LOGIN",
    timestamp: new Date().toISOString()
  });
});

app.post("/signup", signup);
app.post("/login", login);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  // Server running on port ${PORT}
});