import express from "express";
import {
  getProblems,
  getProblem,
  getRandomProblem,
} from "../controllers/problemController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getProblems);
router.get("/random", protect, getRandomProblem);
router.get("/:slug", protect, getProblem);

export default router;
