import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { signup, login, googleLogin } from "./controllers/authController.js";
import { chatWithAI } from "./controllers/chatController.js";
import adminRoutes from "./routes/admin.js";
import upload from "./middleware/upload.js";

import opportunitiesRoutes from "./routes/opportunities.js";
import applicationsRoutes from "./routes/applications.js";
import savedRoutes from "./routes/saved.js";
import userRoutes from "./routes/users.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/campusbridge";


app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(path.dirname(__dirname), "uploads")));



app.use("/api/opportunities", opportunitiesRoutes);
app.use("/api/applications", applicationsRoutes);
app.use("/api/saved", savedRoutes);
app.use("/api/users", userRoutes);

// Chat route
app.options("/api/chat", cors());
app.post("/api/chat", chatWithAI);

// Shortcut: /api/me -> /api/users/me
app.use("/api/me", (req, res, next) => {
  req.url = "/me" + req.url;
  userRoutes(req, res, next);
});


mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.error("MongoDB Connection error:", err));

app.get("/", (req, res) => {
  res.send("CampusBridge Backend Running");
});


app.post("/signup", upload.single("profilePicture"), signup);
app.post("/login", login);
app.post("/google-login", googleLogin);


app.use("/api/admin", adminRoutes);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});