import "dotenv/config";
import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import problemRoutes from "./routes/problemRoutes.js";
import codeRoutes from "./routes/codeRoutes.js";
import battleRoutes from "./routes/battleRoutes.js";
import battleSocket from "./socket/battleSocket.js";

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: ["http://localhost:5173", "https://code-arena-gules.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "CodeArena API running 🚀" }));
app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/code", codeRoutes);
app.use("/api/battles", battleRoutes);

battleSocket(io);

export { io };

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
