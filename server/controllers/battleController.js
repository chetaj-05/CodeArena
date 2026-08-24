import Battle from "../models/Battle.js";
import Problem from "../models/Problem.js";
import User from "../models/User.js";
import generateRoomCode from "../utils/generateRoomCode.js";
import { analyzeCode, generateHint } from "../services/aiJudgeService.js";
import { io } from "../server.js";

// Create battle room
export const createBattle = async (req, res) => {
  try {
    const { difficulty } = req.body;

    let roomCode;
    let exists = true;
    while (exists) {
      roomCode = generateRoomCode();
      exists = await Battle.findOne({ roomCode });
    }

    const filter = difficulty ? { difficulty } : {};
    const count = await Problem.countDocuments(filter);
    const random = Math.floor(Math.random() * count);
    const problem = await Problem.findOne(filter).skip(random);

    const battle = await Battle.create({
      roomCode,
      problem: problem._id,
      players: [{ user: req.user.id, status: "waiting" }],
      status: "waiting",
    });

    await battle.populate("problem");
    await battle.populate("players.user", "name stats");

    res.status(201).json({
      message: "Battle room created",
      roomCode: battle.roomCode,
      battleId: battle._id,
      problem: battle.problem,
    });
  } catch (error) {
    console.error("Create battle error:", error);
    res.status(500).json({ message: "Failed to create battle" });
  }
};

// Join battle room
export const joinBattle = async (req, res) => {
  try {
    const { roomCode } = req.body;

    if (!roomCode) {
      return res.status(400).json({ message: "Room code is required" });
    }

    const battle = await Battle.findOne({
      roomCode: roomCode.toUpperCase(),
    });

    if (!battle) {
      return res.status(404).json({ message: "Battle room not found" });
    }

    if (battle.status === "completed") {
      return res.status(400).json({ message: "Battle already completed" });
    }

    if (battle.status === "active") {
      return res.status(400).json({ message: "Battle already in progress" });
    }

    const alreadyIn = battle.players.find(
      (p) => p.user.toString() === req.user.id,
    );

    if (alreadyIn) {
      return res.status(400).json({ message: "Already in this battle" });
    }

    if (battle.players.length >= 2) {
      return res.status(400).json({ message: "Battle room is full" });
    }

    battle.players.push({ user: req.user.id, status: "waiting" });
    battle.status = "active";
    battle.startedAt = new Date();

    await battle.save();
    await battle.populate("problem");
    await battle.populate("players.user", "name stats");

    res.json({
      message: "Joined successfully",
      roomCode: battle.roomCode,
      battleId: battle._id,
      problem: battle.problem,
    });
  } catch (error) {
    console.error("Join battle error:", error);
    res.status(500).json({ message: "Failed to join battle" });
  }
};

// Submit answer
export const submitAnswer = async (req, res) => {
  try {
    const { battleId, answer } = req.body;

    if (!battleId || !answer?.trim()) {
      return res
        .status(400)
        .json({ message: "Battle ID and answer are required" });
    }

    const battle = await Battle.findById(battleId)
      .populate("problem")
      .populate("players.user", "name");

    if (!battle) {
      return res.status(404).json({ message: "Battle not found" });
    }

    if (battle.status !== "active") {
      return res.status(400).json({ message: "Battle is not active" });
    }

    // Find and update player
    const playerIndex = battle.players.findIndex(
      (p) => p.user._id.toString() === req.user.id,
    );

    if (playerIndex === -1) {
      return res.status(403).json({ message: "You are not in this battle" });
    }

    battle.players[playerIndex].answer = answer;
    battle.players[playerIndex].status = "submitted";
    battle.players[playerIndex].submittedAt = new Date();

    // Notify opponent that this player submitted
    io.to(battle.roomCode).emit("player_submitted", {
      userId: req.user.id,
      message: `${battle.players[playerIndex].user.name} has submitted their answer!`,
    });

    // Check if both players submitted
    const bothSubmitted = battle.players.every((p) => p.status === "submitted");

    if (bothSubmitted) {
      battle.status = "judging";
      await battle.save();

      // Notify both players AI is judging
      io.to(battle.roomCode).emit("judging_started", {
        message: "Both players submitted! AI is evaluating answers...",
      });

      // Run AI judge
      await runAIJudge(battle);
    } else {
      await battle.save();
    }

    res.json({
      message: "Answer submitted successfully",
      waitingForOpponent: !bothSubmitted,
    });
  } catch (error) {
    console.error("Submit answer error:", error);
    res.status(500).json({ message: "Submission failed" });
  }
};

// AI Judge logic
const runAIJudge = async (battle) => {
  try {
    const player1 = battle.players[0];
    const player2 = battle.players[1];

    const result = await judgeAnswers({
      problem: battle.problem,
      player1Answer: player1.answer,
      player2Answer: player2.answer,
      player1Name: player1.user.name,
      player2Name: player2.user.name,
    });

    // Update scores and feedback
    battle.players[0].score = result.player1Score;
    battle.players[1].score = result.player2Score;
    battle.players[0].aiFeedback = result.player1Feedback;
    battle.players[1].aiFeedback = result.player2Feedback;
    battle.aiJudgeSummary = result.judgeSummary;
    battle.status = "completed";
    battle.endedAt = new Date();

    if (result.winner === "draw") {
      battle.isDraw = true;
      battle.players[0].status = "draw";
      battle.players[1].status = "draw";
      await updateUserStats(player1.user._id, "draw");
      await updateUserStats(player2.user._id, "draw");
    } else if (result.winner === "player1") {
      battle.winner = player1.user._id;
      battle.players[0].status = "won";
      battle.players[1].status = "lost";
      await updateUserStats(player1.user._id, "win");
      await updateUserStats(player2.user._id, "loss");
    } else {
      battle.winner = player2.user._id;
      battle.players[0].status = "lost";
      battle.players[1].status = "won";
      await updateUserStats(player2.user._id, "win");
      await updateUserStats(player1.user._id, "loss");
    }

    await battle.save();

    // Emit results to both players
    io.to(battle.roomCode).emit("battle_result", {
      winner: battle.winner,
      isDraw: battle.isDraw,
      player1Score: result.player1Score,
      player2Score: result.player2Score,
      player1Feedback: result.player1Feedback,
      player2Feedback: result.player2Feedback,
      idealAnswerSummary: result.idealAnswerSummary,
      judgeSummary: result.judgeSummary,
      battleId: battle._id,
    });
  } catch (error) {
    console.error("AI Judge error:", error);
    io.to(battle.roomCode).emit("judge_error", {
      message: "AI judging failed. Battle marked as draw.",
    });

    battle.status = "completed";
    battle.isDraw = true;
    await battle.save();
  }
};

// Get hint from AI
export const getHint = async (req, res) => {
  try {
    const { battleId, currentAnswer } = req.body;

    const battle = await Battle.findById(battleId).populate("problem");

    if (!battle) {
      return res.status(404).json({ message: "Battle not found" });
    }

    const hint = await generateHint({
      problem: battle.problem,
      playerAnswer: currentAnswer,
    });

    res.json({ hint });
  } catch (error) {
    console.error("Hint error:", error);
    res.status(500).json({ message: "Failed to generate hint" });
  }
};

// Get battle details
export const getBattle = async (req, res) => {
  try {
    const battle = await Battle.findById(req.params.id)
      .populate("problem")
      .populate("players.user", "name stats")
      .populate("winner", "name");

    if (!battle) {
      return res.status(404).json({ message: "Battle not found" });
    }

    res.json(battle);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get battle by room code
export const getBattleByRoom = async (req, res) => {
  try {
    const battle = await Battle.findOne({
      roomCode: req.params.roomCode.toUpperCase(),
    })
      .populate("problem")
      .populate("players.user", "name stats")
      .populate("winner", "name");

    if (!battle) {
      return res.status(404).json({ message: "Battle not found" });
    }

    res.json(battle);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ "stats.battlesPlayed": { $gt: 0 } })
      .select("name stats createdAt")
      .sort({ "stats.wins": -1, "stats.winRate": -1 })
      .limit(20);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get battle history
export const getBattleHistory = async (req, res) => {
  try {
    const battles = await Battle.find({
      "players.user": req.user.id,
      status: "completed",
    })
      .populate("problem", "title slug difficulty")
      .populate("players.user", "name")
      .populate("winner", "name")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(battles);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update user stats helper
const updateUserStats = async (userId, result) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    user.stats.battlesPlayed += 1;

    if (result === "win") user.stats.wins += 1;
    else if (result === "loss") user.stats.losses += 1;

    user.stats.winRate = Math.round(
      (user.stats.wins / user.stats.battlesPlayed) * 100,
    );

    await user.save();
  } catch (error) {
    console.error("Update stats error:", error);
  }
};
