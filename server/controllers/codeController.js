import Problem from "../models/Problem.js";
import Submission from "../models/Submission.js";
import Battle from "../models/Battle.js";
import { executeCode, runTestCases } from "../services/pistonService.js";

// Run code against visible test cases only (no submission)
export const runCode = async (req, res) => {
  try {
    const { code, language, slug } = req.body;

    if (!code || !language || !slug) {
      return res
        .status(400)
        .json({ message: "Code, language and problem slug are required" });
    }

    const problem = await Problem.findOne({ slug });

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    // Only run visible test cases
    const visibleTestCases = problem.testCases.filter((tc) => !tc.isHidden);
    const result = await runTestCases(code, language, visibleTestCases);

    res.json({
      passed: result.passed,
      total: result.total,
      results: result.results,
      status: result.status,
    });
  } catch (error) {
    console.error("Run code error:", error);
    res.status(500).json({ message: "Execution failed. Try again." });
  }
};

// Submit code against ALL test cases (including hidden)
export const submitCode = async (req, res) => {
  try {
    const { code, language, slug, battleId } = req.body;

    if (!code || !language || !slug || !battleId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const problem = await Problem.findOne({ slug });

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    const battle = await Battle.findById(battleId);

    if (!battle) {
      return res.status(404).json({ message: "Battle not found" });
    }

    if (battle.status !== "active") {
      return res.status(400).json({ message: "Battle is not active" });
    }

    // Run against ALL test cases
    const result = await runTestCases(code, language, problem.testCases);

    // Save submission
    const submission = await Submission.create({
      user: req.user.id,
      battle: battleId,
      problem: problem._id,
      code,
      language,
      status: result.status,
      testCasesPassed: result.passed,
      totalTestCases: result.total,
    });

    // Update player in battle
    const playerIndex = battle.players.findIndex(
      (p) => p.user.toString() === req.user.id,
    );

    if (playerIndex !== -1) {
      battle.players[playerIndex].code = code;
      battle.players[playerIndex].language = language;
      battle.players[playerIndex].testCasesPassed = result.passed;
      battle.players[playerIndex].totalTestCases = result.total;
      battle.players[playerIndex].submittedAt = new Date();

      if (result.status === "accepted") {
        battle.players[playerIndex].status = "won";

        // Set other player as lost
        battle.players.forEach((p, i) => {
          if (i !== playerIndex) {
            p.status = "lost";
          }
        });

        battle.status = "completed";
        battle.winner = req.user.id;
        battle.endedAt = new Date();

        // Update user stats
        await updateUserStats(req.user.id, "win", problem.slug);
        const loserId = battle.players.find(
          (p) => p.user.toString() !== req.user.id,
        )?.user;
        if (loserId) await updateUserStats(loserId, "loss", null);
      } else {
        battle.players[playerIndex].status = "submitted";
      }

      await battle.save();
    }

    // Emit socket event to update both players
    const { io } = await import("../server.js");
    io.to(battle.roomCode).emit("submission_update", {
      userId: req.user.id,
      status: result.status,
      passed: result.passed,
      total: result.total,
      battleStatus: battle.status,
      winner: battle.winner,
    });

    res.json({
      status: result.status,
      passed: result.passed,
      total: result.total,
      results: result.results,
      submissionId: submission._id,
    });
  } catch (error) {
    console.error("Submit error:", error);
    res.status(500).json({ message: "Submission failed. Try again." });
  }
};

const updateUserStats = async (userId, result, problemSlug) => {
  try {
    const User = (await import("../models/User.js")).default;
    const user = await User.findById(userId);

    if (!user) return;

    user.stats.battlesPlayed += 1;

    if (result === "win") {
      user.stats.wins += 1;
      if (problemSlug && !user.stats.problemsSolved.includes(problemSlug)) {
        user.stats.problemsSolved.push(problemSlug);
      }
    } else {
      user.stats.losses += 1;
    }

    user.stats.winRate = Math.round(
      (user.stats.wins / user.stats.battlesPlayed) * 100,
    );

    await user.save();
  } catch (error) {
    console.error("Update stats error:", error);
  }
};
