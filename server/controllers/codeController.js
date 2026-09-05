import Problem from "../models/Problem.js";
import Submission from "../models/Submission.js";
import Battle from "../models/Battle.js";
import { runTestCases } from "../services/pistonService.js";
import { analyzeCode } from "../services/aiJudgeService.js";
import { io } from "../server.js";

// Run code against visible test cases only
export const runCode = async (req, res) => {
  try {
    const { code, language, slug } = req.body;

    if (!code || !language || !slug) {
      return res.status(400).json({
        message: "Code, language and problem slug are required",
      });
    }

    const problem = await Problem.findOne({ slug });
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

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

// Submit code against ALL test cases + AI feedback
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

    const battle = await Battle.findById(battleId).populate(
      "players.user",
      "name",
    );
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
      (p) => p.user._id.toString() === req.user.id,
    );

    if (playerIndex !== -1) {
      battle.players[playerIndex].code = code;
      battle.players[playerIndex].language = language;
      battle.players[playerIndex].testCasesPassed = result.passed;
      battle.players[playerIndex].totalTestCases = result.total;
      battle.players[playerIndex].submittedAt = new Date();

      if (result.status === "accepted") {
        // This player won
        battle.players[playerIndex].status = "won";

        // Set other player as lost
        battle.players.forEach((p, i) => {
          if (i !== playerIndex) p.status = "lost";
        });

        battle.status = "judging";
        battle.winner = req.user.id;
        battle.endedAt = new Date();

        await battle.save();

        // Notify both players battle is over
        io.to(battle.roomCode).emit("battle_over", {
          winnerId: req.user.id,
          winnerName: battle.players[playerIndex].user.name,
          passed: result.passed,
          total: result.total,
          battleId: battle._id,
        });

        // Run AI analysis in background
        runAIAnalysis(battle, problem);

        // Update winner stats
        await updateUserStats(req.user.id, "win");
        const loserId = battle.players.find((p, i) => i !== playerIndex)?.user
          ._id;
        if (loserId) await updateUserStats(loserId, "loss");
      } else {
        battle.players[playerIndex].status = "submitted";
        await battle.save();

        // Notify opponent
        io.to(battle.roomCode).emit("opponent_submitted", {
          userId: req.user.id,
          passed: result.passed,
          total: result.total,
          status: result.status,
        });
      }
    }

    res.json({
      status: result.status,
      passed: result.passed,
      total: result.total,
      results: result.results,
      submissionId: submission._id,
    });
  } catch (error) {
    console.error("Submit error full:", error.message);
    console.error("Submit error stack:", error.stack);
    res.status(500).json({
      message: "Submission failed. Try again.",
      error: error.message,
    });
  }
};

// Run AI analysis after battle ends
// Run AI analysis after battle ends
export const runAIAnalysis = async (battle, problem) => {
  try {
    const p1 = battle.players[0];
    const p2 = battle.players[1];

    // Run AI even if only winner submitted
    const player1Code = p1?.code || "No solution submitted";
    const player2Code = p2?.code || "No solution submitted";

    const analysis = await analyzeCode({
      problem,
      player1Code,
      player2Code,
      player1Name: p1?.user?.name || "Player 1",
      player2Name: p2?.user?.name || "Player 2",
      player1Language: p1?.language || "python",
      player2Language: p2?.language || "python",
    });

    battle.players[0].aiFeedback = analysis.player1Feedback;
    battle.players[1].aiFeedback = analysis.player2Feedback;
    battle.aiJudgeSummary = analysis.summary;
    battle.status = "completed";
    await battle.save();

    io.to(battle.roomCode).emit("ai_feedback_ready", {
      player1Feedback: analysis.player1Feedback,
      player2Feedback: analysis.player2Feedback,
      idealSolution: analysis.idealSolution,
      summary: analysis.summary,
      battleId: battle._id,
    });
  } catch (error) {
    console.error("AI analysis error:", error.message);
    battle.status = "completed";
    await battle.save();

    // Still redirect even if AI fails
    io.to(battle.roomCode).emit("ai_feedback_ready", {
      player1Feedback: "AI analysis unavailable.",
      player2Feedback: "AI analysis unavailable.",
      idealSolution: "Please review the problem solution manually.",
      summary: "Battle completed.",
      battleId: battle._id,
    });
  }
};
// Change this to a standard async function so it hoists correctly
async function updateUserStats(userId, result) {
  try {
    const User = (await import("../models/User.js")).default;
    const user = await User.findById(userId);
    if (!user) return;

    user.stats.battlesPlayed += 1;
    if (result === "win") user.stats.wins += 1;
    else user.stats.losses += 1;

    user.stats.winRate = Math.round(
      (user.stats.wins / user.stats.battlesPlayed) * 100,
    );

    await user.save();
  } catch (error) {
    console.error("Update stats error:", error);
  }
}
