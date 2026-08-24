import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { getBattleByRoom } from "../services/battleService";
import { runCode, submitCode } from "../services/codeService";
import toast from "react-hot-toast";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
];

const STARTER_CODE = {
  javascript: "// Write your solution here\n\n",
  python: "# Write your solution here\n\n",
};

function BattleRoom() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [battle, setBattle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState(STARTER_CODE.javascript);
  const [language, setLanguage] = useState("javascript");
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [battleStarted, setBattleStarted] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [opponentStatus, setOpponentStatus] = useState({
    status: "waiting",
    passed: 0,
    total: 0,
    linesOfCode: 0,
  });
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [battleEnded, setBattleEnded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [showAiFeedback, setShowAiFeedback] = useState(false);
  const [hint, setHint] = useState(null);
  const [gettingHint, setGettingHint] = useState(false);
  const [activeTab, setActiveTab] = useState("results");
  const timerRef = useRef(null);

  useEffect(() => {
    fetchBattle();
  }, [roomCode]);

  useEffect(() => {
    if (!socket || !battle) return;

    socket.emit("join_room", { roomCode, userId: user?.id });

    socket.on("player_joined", ({ players, battleStatus }) => {
      setBattle((prev) =>
        prev ? { ...prev, players, status: battleStatus } : prev,
      );
      if (battleStatus === "active") {
        toast.success("Opponent joined! Get ready...");
      }
    });

    socket.on("battle_starting", () => setCountdown(3));
    socket.on("countdown", ({ count }) => setCountdown(count));

    socket.on("battle_started", () => {
      setCountdown(null);
      setBattleStarted(true);
      startTimer();
      toast.success("Battle started! Good luck! 🚀");
    });

    socket.on("opponent_coding", ({ linesOfCode }) => {
      setOpponentStatus((prev) => ({ ...prev, linesOfCode, status: "coding" }));
    });

    socket.on("opponent_ran_code", ({ passed, total }) => {
      setOpponentStatus((prev) => ({ ...prev, passed, total }));
      toast(`Opponent ran code: ${passed}/${total} passed`, { icon: "⚡" });
    });

    socket.on("opponent_submitted", ({ passed, total, status }) => {
      setOpponentStatus((prev) => ({
        ...prev,
        status: "submitted",
        passed,
        total,
      }));
      toast(
        status === "accepted"
          ? "Opponent passed all test cases! 😱"
          : `Opponent submitted: ${passed}/${total} passed`,
        { icon: "📊" },
      );
    });

    socket.on("battle_over", ({ winnerId, winnerName, passed, total }) => {
      setBattleEnded(true);
      clearInterval(timerRef.current);
      const isWinner = winnerId === user?.id;
      toast(
        isWinner
          ? "🎉 You won! AI feedback coming..."
          : `${winnerName} won! AI feedback coming...`,
        { duration: 4000 },
      );
    });

    socket.on("ai_feedback_ready", (data) => {
      setAiFeedback(data);
      setShowAiFeedback(true);
      setActiveTab("feedback");
      toast.success("AI feedback is ready! 🤖");
      setTimeout(() => navigate(`/battle/result/${battle._id}`), 8000);
    });

    socket.on("battle_ended", ({ reason }) => {
      setBattleEnded(true);
      clearInterval(timerRef.current);
      if (reason === "timeout") toast.error("Time's up!");
      setTimeout(() => navigate(`/battle/result/${battle._id}`), 3000);
    });

    socket.on("player_disconnected", ({ userId: disconnectedId }) => {
      if (disconnectedId !== user?.id) {
        toast.error("Opponent disconnected!");
        setOpponentStatus((prev) => ({ ...prev, status: "disconnected" }));
      }
    });

    socket.on("new_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("player_joined");
      socket.off("battle_starting");
      socket.off("countdown");
      socket.off("battle_started");
      socket.off("opponent_coding");
      socket.off("opponent_ran_code");
      socket.off("opponent_submitted");
      socket.off("battle_over");
      socket.off("ai_feedback_ready");
      socket.off("battle_ended");
      socket.off("player_disconnected");
      socket.off("new_message");
    };
  }, [socket, battle, roomCode]);

  const fetchBattle = async () => {
    try {
      const data = await getBattleByRoom(roomCode);
      setBattle(data);

      if (data.status === "active") {
        setBattleStarted(true);
        startTimer();
      }

      if (data.problem?.starterCode?.javascript) {
        setCode(data.problem.starterCode.javascript);
      }
    } catch (error) {
      toast.error("Battle not found");
      navigate("/battle");
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          socket?.emit("battle_timeout", { roomCode });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleEditorChange = (value) => {
    setCode(value || "");
    const lines = (value || "").split("\n").length;
    socket?.emit("coding_update", {
      roomCode,
      userId: user?.id,
      linesOfCode: lines,
    });
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    if (battle?.problem?.starterCode?.[lang]) {
      setCode(battle.problem.starterCode[lang]);
    } else {
      setCode(STARTER_CODE[lang]);
    }
  };

  const handleRun = async () => {
    if (!code.trim()) {
      toast.error("Write some code first");
      return;
    }
    setRunning(true);
    setRunResult(null);
    setActiveTab("results");
    try {
      const result = await runCode({
        code,
        language,
        slug: battle.problem.slug,
      });
      setRunResult(result);
      socket?.emit("code_ran", {
        roomCode,
        userId: user?.id,
        passed: result.passed,
        total: result.total,
      });
      if (result.status === "accepted") {
        toast.success(`All ${result.passed} visible test cases passed! ✅`);
      } else {
        toast.error(`${result.passed}/${result.total} test cases passed`);
      }
    } catch (error) {
      toast.error("Execution failed. Try again.");
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error("Write some code first");
      return;
    }
    if (!confirm("Submit your final solution? This cannot be undone.")) return;

    setSubmitting(true);
    try {
      const result = await submitCode({
        code,
        language,
        slug: battle.problem.slug,
        battleId: battle._id,
      });

      setSubmitted(true);
      setRunResult(result);
      setActiveTab("results");

      socket?.emit("player_submitted", {
        roomCode,
        userId: user?.id,
        status: result.status,
        passed: result.passed,
        total: result.total,
      });

      if (result.status === "accepted") {
        toast.success("🎉 All test cases passed! Waiting for AI feedback...");
        setBattleEnded(true);
      } else {
        toast.error(`${result.passed}/${result.total} passed. Keep trying!`);
        setSubmitted(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Submission failed");
      setSubmitted(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGetHint = async () => {
    setGettingHint(true);
    try {
      const res = await fetch("/api/battles/hint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          battleId: battle._id,
          currentCode: code,
          language,
        }),
      });
      const data = await res.json();
      setHint(data.hint);
      setActiveTab("hint");
      toast.success("Hint generated! 💡");
    } catch (error) {
      toast.error("Failed to get hint");
    } finally {
      setGettingHint(false);
    }
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    socket?.emit("send_message", {
      roomCode,
      userId: user?.id,
      userName: user?.name,
      message: chatInput,
    });
    setChatInput("");
  };

  const opponent = battle?.players?.find(
    (p) => p.user._id !== user?.id && p.user._id?.toString() !== user?.id,
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading battle room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Top bar */}
      <div className="bg-[#0f0f1a] border-b border-white/5 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">CA</span>
            </div>
            <span className="text-white font-bold text-sm hidden sm:block">
              Code<span className="text-violet-400">Arena</span>
            </span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Room</span>
            <span className="text-xs font-mono font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded">
              {roomCode}
            </span>
          </div>
        </div>

        {/* Timer */}
        <div
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border ${
            timeLeft < 300
              ? "bg-red-500/10 border-red-500/30 text-red-400"
              : "bg-white/5 border-white/10 text-white"
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" d="M12 6v6l4 2" />
          </svg>
          <span className="font-mono font-bold text-sm">
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Players */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-xs text-white hidden sm:block">
              {user?.name?.split(" ")[0]}
            </span>
          </div>
          <span className="text-gray-600 text-xs font-bold">VS</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden sm:block">
              {opponent?.user?.name?.split(" ")[0] || "Waiting..."}
            </span>
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                opponent ? "bg-pink-600" : "bg-white/10"
              }`}
            >
              {opponent ? opponent.user?.name?.[0]?.toUpperCase() : "?"}
            </div>
          </div>
        </div>
      </div>

      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-4">Battle starting in</p>
            <p className="text-8xl font-bold text-violet-400">{countdown}</p>
          </div>
        </div>
      )}

      {/* Battle ended overlay */}
      {battleEnded && !aiFeedback && (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center">
          <div className="text-center bg-[#13131f] border border-white/10 rounded-2xl p-10">
            <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xl font-bold text-white mb-2">Battle Over!</p>
            <p className="text-gray-400 text-sm">
              🤖 AI is analyzing both solutions...
            </p>
          </div>
        </div>
      )}

      {/* Waiting overlay */}
      {!battleStarted && (
        <div className="fixed inset-0 bg-black/80 z-40 flex items-center justify-center">
          <div className="text-center bg-[#13131f] border border-white/10 rounded-2xl p-10">
            <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xl font-bold text-white mb-2">
              Waiting for opponent
            </p>
            <p className="text-gray-400 text-sm mb-4">Share this room code</p>
            <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl px-6 py-3">
              <p className="text-3xl font-mono font-bold text-violet-400 tracking-widest">
                {roomCode}
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(roomCode);
                toast.success("Room code copied!");
              }}
              className="mt-4 text-xs text-gray-500 hover:text-violet-400 transition-colors"
            >
              Click to copy
            </button>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left — Problem panel */}
        <div className="w-full lg:w-2/5 border-r border-white/5 flex flex-col overflow-hidden">
          {/* Opponent status bar */}
          <div className="px-4 py-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  opponentStatus.status === "coding"
                    ? "bg-green-400 animate-pulse"
                    : opponentStatus.status === "submitted"
                      ? "bg-yellow-400"
                      : opponentStatus.status === "disconnected"
                        ? "bg-red-500"
                        : "bg-gray-600"
                }`}
              />
              <span className="text-xs text-gray-400">
                Opponent:{" "}
                <span className="text-white font-medium capitalize">
                  {opponentStatus.status === "coding"
                    ? `coding (${opponentStatus.linesOfCode} lines)`
                    : opponentStatus.status}
                </span>
              </span>
            </div>
            {opponentStatus.total > 0 && (
              <span className="text-xs font-semibold text-amber-400">
                {opponentStatus.passed}/{opponentStatus.total} passed
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/5 bg-[#0f0f1a]">
            {["problem", "results", "hint", "feedback"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-xs font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? "text-violet-400 border-b-2 border-violet-400"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab === "feedback" && aiFeedback ? "🤖 " : ""}
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* Problem tab */}
            {activeTab === "problem" && battle?.problem && (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-bold text-white">
                    {battle.problem.title}
                  </h2>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 capitalize ${
                      battle.problem.difficulty === "easy"
                        ? "bg-green-500/10 text-green-400"
                        : battle.problem.difficulty === "medium"
                          ? "bg-yellow-500/10 text-yellow-400"
                          : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {battle.problem.difficulty}
                  </span>
                </div>

                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                  {battle.problem.description}
                </p>

                {battle.problem.constraints && (
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-400 mb-2">
                      Constraints
                    </p>
                    <p className="text-xs text-gray-400 font-mono whitespace-pre-line">
                      {battle.problem.constraints}
                    </p>
                  </div>
                )}

                {battle.problem.examples?.map((ex, i) => (
                  <div key={i} className="space-y-2">
                    <p className="text-xs font-semibold text-gray-400">
                      Example {i + 1}
                    </p>
                    <div className="bg-white/5 rounded-xl p-4 space-y-2 font-mono">
                      <p className="text-xs text-gray-400">
                        <span className="text-gray-500">Input: </span>
                        {ex.input}
                      </p>
                      <p className="text-xs text-gray-400">
                        <span className="text-gray-500">Output: </span>
                        {ex.output}
                      </p>
                      {ex.explanation && (
                        <p className="text-xs text-gray-500">
                          {ex.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Results tab */}
            {activeTab === "results" && (
              <div>
                {!runResult ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <p className="text-3xl mb-3">▶️</p>
                    <p className="text-gray-400 text-sm font-medium">
                      Run your code to see results
                    </p>
                    <p className="text-gray-600 text-xs mt-1">
                      Click Run to test against visible cases
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold text-white">
                        Test Results
                      </p>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          runResult.status === "accepted"
                            ? "bg-green-500/10 text-green-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {runResult.passed}/{runResult.total} passed
                      </span>
                    </div>
                    {runResult.results?.map((r, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-xl text-xs font-mono space-y-1.5 ${
                          r.passed
                            ? "bg-green-500/10 border border-green-500/20"
                            : "bg-red-500/10 border border-red-500/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={
                              r.passed
                                ? "text-green-400 font-semibold"
                                : "text-red-400 font-semibold"
                            }
                          >
                            {r.passed ? "✓ Passed" : "✗ Failed"}
                          </span>
                          {r.isHidden && (
                            <span className="text-gray-600">Hidden</span>
                          )}
                        </div>
                        {!r.isHidden && (
                          <>
                            <p className="text-gray-500">
                              Input:{" "}
                              <span className="text-gray-300">{r.input}</span>
                            </p>
                            <p className="text-gray-500">
                              Expected:{" "}
                              <span className="text-gray-300">
                                {r.expectedOutput}
                              </span>
                            </p>
                            {!r.passed && (
                              <p className="text-gray-500">
                                Got:{" "}
                                <span className="text-red-300">
                                  {r.actualOutput}
                                </span>
                              </p>
                            )}
                            {r.error && (
                              <p className="text-red-400 text-xs mt-1">
                                {r.error}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Hint tab */}
            {activeTab === "hint" && (
              <div>
                {!hint ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <p className="text-3xl mb-3">💡</p>
                    <p className="text-gray-400 text-sm font-medium mb-4">
                      Need a nudge in the right direction?
                    </p>
                    <button
                      onClick={handleGetHint}
                      disabled={gettingHint || !battleStarted}
                      className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 flex items-center gap-2"
                    >
                      {gettingHint ? (
                        <>
                          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                          Getting hint...
                        </>
                      ) : (
                        "💡 Get AI Hint"
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                      <p className="text-xs font-semibold text-amber-400 mb-2">
                        💡 AI Hint
                      </p>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {hint}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setHint(null);
                      }}
                      className="text-xs text-gray-500 hover:text-amber-400 transition-colors"
                    >
                      Get another hint
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* AI Feedback tab */}
            {activeTab === "feedback" && (
              <div>
                {!aiFeedback ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <p className="text-3xl mb-3">🤖</p>
                    <p className="text-gray-400 text-sm font-medium">
                      AI feedback appears here after battle ends
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
                      <p className="text-xs font-semibold text-violet-400 mb-2">
                        🤖 Battle Summary
                      </p>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {aiFeedback.summary}
                      </p>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                      <p className="text-xs font-semibold text-blue-400 mb-2">
                        Your Feedback
                      </p>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {user?.id === battle?.players[0]?.user?._id
                          ? aiFeedback.player1Feedback
                          : aiFeedback.player2Feedback}
                      </p>
                    </div>

                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                      <p className="text-xs font-semibold text-green-400 mb-2">
                        ✅ Ideal Approach
                      </p>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {aiFeedback.idealSolution}
                      </p>
                    </div>

                    <p className="text-xs text-gray-600 text-center">
                      Redirecting to full results in a moment...
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right — Editor */}
        <div className="hidden lg:flex lg:w-3/5 flex-col">
          {/* Editor toolbar */}
          <div className="px-4 py-2 border-b border-white/5 bg-[#0f0f1a] flex items-center justify-between">
            <div className="flex gap-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => handleLanguageChange(lang.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    language === lang.value
                      ? "bg-violet-600 text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGetHint}
                disabled={gettingHint || !battleStarted || battleEnded}
                className="text-xs bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-lg font-medium transition-all disabled:opacity-40"
              >
                {gettingHint ? "..." : "💡 Hint"}
              </button>
              <button
                onClick={handleRun}
                disabled={
                  running || submitting || !battleStarted || battleEnded
                }
                className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 border border-white/10 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
              >
                {running ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "▶"
                )}
                Run
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  running ||
                  !battleStarted ||
                  battleEnded ||
                  submitted
                }
                className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-lg shadow-violet-500/20"
              >
                {submitting ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "⚡"
                )}
                Submit
              </button>
              <button
                onClick={() => setShowChat(!showChat)}
                className="relative w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-white/5 hover:text-white transition-all"
              >
                💬
                {messages.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-600 rounded-full text-white text-xs flex items-center justify-center">
                    {messages.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                lineNumbers: "on",
                renderLineHighlight: "line",
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
              }}
            />
          </div>
        </div>
      </div>

      {/* Chat */}
      {showChat && (
        <div className="fixed right-4 bottom-4 w-80 bg-[#13131f] border border-white/10 rounded-2xl shadow-2xl z-30 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <p className="text-sm font-semibold text-white">Battle Chat</p>
            <button
              onClick={() => setShowChat(false)}
              className="text-gray-500 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-60">
            {messages.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-4">
                No messages yet. Say hi! 👋
              </p>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`text-xs rounded-xl px-3 py-2 max-w-[80%] ${
                    msg.userId === user?.id
                      ? "bg-violet-600 text-white ml-auto"
                      : "bg-white/10 text-gray-300"
                  }`}
                >
                  {msg.userId !== user?.id && (
                    <p className="text-violet-400 font-semibold mb-0.5">
                      {msg.userName}
                    </p>
                  )}
                  <p>{msg.message}</p>
                </div>
              ))
            )}
          </div>
          <div className="p-3 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <button
              onClick={sendMessage}
              className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-2 rounded-lg text-xs transition-all"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BattleRoom;
