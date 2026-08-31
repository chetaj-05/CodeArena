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
const runAIAnalysis = async (battle, problem) => {
  try {
    const player1 = battle.players[0];
    const player2 = battle.players[1];

    // FIX 1: Don't exit if a player hasn't submitted code.
    // Give the AI a fallback string instead so it can still evaluate the winner.
    const p1Code = player1?.code || "# No code submitted by this player";
    const p2Code = player2?.code || "# No code submitted by this player";

    const analysis = await analyzeCode({
      problem,
      player1Code: p1Code,
      player2Code: p2Code,
      player1Name: player1.user.name,
      player2Name: player2.user.name,
      // Provide fallback languages just in case
      player1Language: player1.language || "python",
      player2Language: player2.language || "python",
    });

    // Save AI feedback to battle
    battle.players[0].aiFeedback = analysis.player1Feedback;
    battle.players[1].aiFeedback = analysis.player2Feedback;
    battle.aiJudgeSummary = analysis.summary;
    battle.status = "completed";

    await battle.save();

    // Send AI feedback to both players
    io.to(battle.roomCode).emit("ai_feedback_ready", {
      player1Feedback: analysis.player1Feedback,
      player2Feedback: analysis.player2Feedback,
      idealSolution: analysis.idealSolution,
      summary: analysis.summary,
      battleId: battle._id,
    });
  } catch (error) {
    console.error("AI analysis error:", error);
    battle.status = "completed";
    await battle.save();

    // FIX 2: If the AI API fails, we MUST tell the frontend so it doesn't load forever!
    io.to(battle.roomCode).emit("ai_feedback_ready", {
      player1Feedback: "AI analysis failed due to a server error.",
      player2Feedback: "AI analysis failed due to a server error.",
      idealSolution: "Not available.",
      summary:
        "There was an error generating the AI summary. The battle is over, but feedback could not be generated.",
      battleId: battle._id,
    });
  }
};
