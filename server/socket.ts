// server/socket.ts
import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "http://localhost:3000", methods: ["GET","POST"] },
  transports: ["websocket", "polling"],
});

// Rooms: client must send { sessionId }
io.on("connection", (socket) => {
  console.log("socket connected", socket.id);
  socket.on("join", ({ sessionId }) => {
    if (sessionId) {
      socket.join(sessionId);
      console.log(`joined room ${sessionId}`);
    }
  });
  socket.on("disconnect", () => console.log("socket disconnected", socket.id));
});

// Simple relay so Next API routes can emit events
app.post("/emit", (req, res) => {
  const { room, event, payload } = req.body || {};
  if (!room || !event) return res.status(400).json({ ok: false, error: "missing room/event" });
  io.to(room).emit(event, payload);
  res.json({ ok: true });
});

const PORT = Number(process.env.SOCKET_PORT || 3001);
httpServer.listen(PORT, () => {
  console.log(`Socket.IO listening on http://localhost:${PORT}`);
});
