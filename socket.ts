// server/socket.ts
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "http://localhost:3000", methods: ["GET","POST"] },
});

io.on("connection", (socket) => {
  socket.on("join", ({ sessionId }) => {
    if (sessionId) socket.join(sessionId);
  });
});

httpServer.listen(3001, () => {
  console.log("Socket.IO server listening on http://localhost:3001");
});
