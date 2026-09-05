import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  createBattle,
  joinBattle,
  submitAnswer,
  getHint,
  getBattle,
  getBattleByRoom,
  getLeaderboard,
  getBattleHistory,
} from "../controllers/battleController.js";
import { surrenderBattle } from "../controllers/battleController.js";
const router = express.Router();
router.post("/surrender", protect, surrenderBattle);

router.post("/create", protect, createBattle);
router.post("/join", protect, joinBattle);
router.post("/submit", protect, submitAnswer);
router.post("/hint", protect, getHint);
router.get("/leaderboard", protect, getLeaderboard);
router.get("/history", protect, getBattleHistory);
router.get("/room/:roomCode", protect, getBattleByRoom);
router.get("/:id", protect, getBattle);

export default router;
