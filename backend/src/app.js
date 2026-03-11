import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { signup, login } from "./controllers/authController.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();
const mongoUri = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.error("MongoDB Connection error:", err));

// Routes
app.get("/", (req, res) => {
  res.send("CampusBridge Backend Running");
});

// Auth routes
app.post("/signup", signup);
app.post("/login", login);

// Admin routes
app.use("/api/admin", adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});