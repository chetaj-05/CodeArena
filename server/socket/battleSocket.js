import Battle from "../models/Battle.js";

const connectedUsers = new Map();
const roomUsers = new Map();

const battleSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("user_connected", (userId) => {
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;
    });

    socket.on("join_room", async ({ roomCode, userId }) => {
      try {
        socket.join(roomCode);

        if (!roomUsers.has(roomCode)) {
          roomUsers.set(roomCode, new Set());
        }
        roomUsers.get(roomCode).add(socket.id);

        const battle = await Battle.findOne({ roomCode })
          .populate("problem")
          .populate("players.user", "name stats");

        if (!battle) {
          socket.emit("error", { message: "Battle not found" });
          return;
        }

        io.to(roomCode).emit("player_joined", {
          players: battle.players,
          battleStatus: battle.status,
          problem: battle.problem,
        });

        // Replace the join_room handler's countdown section with this:

        const usersInRoom = roomUsers.get(roomCode)?.size || 0;
        if (battle.status === "active" && usersInRoom >= 2) {
          // Prevent multiple countdowns for same room
          if (!global.activeCountdowns) global.activeCountdowns = new Set();
          if (global.activeCountdowns.has(roomCode)) return;
          global.activeCountdowns.add(roomCode);

          io.to(roomCode).emit("battle_starting", { countdown: 3 });

          let count = 3;
          const interval = setInterval(() => {
            count--;
            if (count > 0) {
              io.to(roomCode).emit("countdown", { count });
            } else {
              clearInterval(interval);
              global.activeCountdowns.delete(roomCode);
              io.to(roomCode).emit("battle_started", {
                startedAt: new Date(),
              });
            }
          }, 1000);
        }
      } catch (error) {
        console.error("Join room error:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    socket.on("coding_update", ({ roomCode, userId, linesOfCode }) => {
      socket.to(roomCode).emit("opponent_coding", { userId, linesOfCode });
    });

    socket.on("code_ran", ({ roomCode, userId, passed, total }) => {
      socket.to(roomCode).emit("opponent_ran_code", { userId, passed, total });
    });

    socket.on(
      "player_submitted",
      ({ roomCode, userId, status, passed, total }) => {
        socket
          .to(roomCode)
          .emit("opponent_submitted", { userId, status, passed, total });
      },
    );

    socket.on("battle_timeout", async ({ roomCode }) => {
      try {
        const battle = await Battle.findOne({ roomCode });
        if (!battle || battle.status !== "active") return;

        battle.status = "completed";
        battle.endedAt = new Date();

        const sorted = [...battle.players].sort(
          (a, b) => b.testCasesPassed - a.testCasesPassed,
        );
        if (sorted[0]?.testCasesPassed > (sorted[1]?.testCasesPassed || 0)) {
          battle.winner = sorted[0].user;
          sorted[0].status = "won";
          if (sorted[1]) sorted[1].status = "lost";
        }

        await battle.save();
        io.to(roomCode).emit("battle_ended", {
          winner: battle.winner,
          reason: "timeout",
        });
      } catch (error) {
        console.error("Timeout error:", error);
      }
    });

    socket.on("send_message", ({ roomCode, userId, userName, message }) => {
      io.to(roomCode).emit("new_message", {
        userId,
        userName,
        message,
        timestamp: new Date(),
      });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
      if (socket.userId) connectedUsers.delete(socket.userId);

      roomUsers.forEach((sockets, roomCode) => {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          io.to(roomCode).emit("player_disconnected", {
            socketId: socket.id,
            userId: socket.userId,
          });
        }
      });
    });
  });
};

export default battleSocket;
