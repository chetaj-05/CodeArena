import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getBattle } from "../services/battleService";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function BattleResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [battle, setBattle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getBattle(id);
        setBattle(data);
      } catch (error) {
        toast.error("Result not found");
        navigate("/battle");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isWinner =
    battle?.winner?._id === user?.id || battle?.winner?.toString() === user?.id;

  const myPlayer = battle?.players?.find(
    (p) => p.user._id === user?.id || p.user._id?.toString() === user?.id,
  );

  const opponent = battle?.players?.find(
    (p) => p.user._id !== user?.id && p.user._id?.toString() !== user?.id,
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Result banner */}
      <div
        className={`relative rounded-2xl p-8 text-center overflow-hidden border ${
          isWinner
            ? "bg-green-500/10 border-green-500/20"
            : "bg-red-500/10 border-red-500/20"
        }`}
      >
        <div
          className={`absolute inset-0 opacity-10 blur-3xl ${
            isWinner ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <div className="relative">
          <p className="text-6xl mb-4">{isWinner ? "🏆" : "💀"}</p>
          <h1
            className={`text-4xl font-bold mb-2 ${
              isWinner ? "text-green-400" : "text-red-400"
            }`}
          >
            {isWinner ? "You Won!" : "You Lost"}
          </h1>
          <p className="text-gray-400 text-sm">
            {isWinner
              ? "Excellent performance! You crushed it! 🔥"
              : "Better luck next time. Keep practicing! 💪"}
          </p>
        </div>
      </div>

      {/* Battle info */}
      <div className="bg-white/5 dark:bg-[#13131f] border border-white/5 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-white mb-4">
          Battle Summary
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Problem", value: battle?.problem?.title || "Unknown" },
            {
              label: "Difficulty",
              value: battle?.problem?.difficulty,
              capitalize: true,
            },
            { label: "Room Code", value: battle?.roomCode, mono: true },
            {
              label: "Duration",
              value:
                battle?.endedAt && battle?.startedAt
                  ? `${Math.round((new Date(battle.endedAt) - new Date(battle.startedAt)) / 60000)} min`
                  : "N/A",
            },
          ].map(({ label, value, capitalize, mono }) => (
            <div key={label} className="bg-white/5 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p
                className={`text-sm font-semibold text-white ${capitalize ? "capitalize" : ""} ${mono ? "font-mono" : ""}`}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Head to head */}
      <div className="bg-white/5 dark:bg-[#13131f] border border-white/5 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-white mb-4">
          Head to Head
        </h2>
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <p className="text-sm font-semibold text-white">
              {user?.name?.split(" ")[0]}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">You</p>
            <div
              className={`mt-3 px-3 py-1.5 rounded-lg text-xs font-bold ${
                isWinner
                  ? "bg-green-500/10 text-green-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {myPlayer?.testCasesPassed || 0}/{myPlayer?.totalTestCases || 0}{" "}
              passed
            </div>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">VS</p>
            <div
              className={`mt-2 w-8 h-8 rounded-full mx-auto flex items-center justify-center text-sm ${
                isWinner
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {isWinner ? "▲" : "▼"}
            </div>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">
              {opponent?.user?.name?.[0]?.toUpperCase() || "?"}
            </div>
            <p className="text-sm font-semibold text-white">
              {opponent?.user?.name?.split(" ")[0] || "Opponent"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Opponent</p>
            <div
              className={`mt-3 px-3 py-1.5 rounded-lg text-xs font-bold ${
                !isWinner
                  ? "bg-green-500/10 text-green-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {opponent?.testCasesPassed || 0}/{opponent?.totalTestCases || 0}{" "}
              passed
            </div>
          </div>
        </div>
      </div>

      {/* AI Feedback */}
      {(battle?.aiJudgeSummary || myPlayer?.aiFeedback) && (
        <div className="bg-white/5 dark:bg-[#13131f] border border-white/5 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            🤖 AI Analysis
          </h2>

          {battle?.aiJudgeSummary && (
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
              <p className="text-xs font-semibold text-violet-400 mb-2">
                Battle Summary
              </p>
              <p className="text-sm text-gray-300 leading-relaxed">
                {battle.aiJudgeSummary}
              </p>
            </div>
          )}

          {myPlayer?.aiFeedback && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-400 mb-2">
                Your Code Feedback
              </p>
              <p className="text-sm text-gray-300 leading-relaxed">
                {myPlayer.aiFeedback}
              </p>
            </div>
          )}

          {opponent?.aiFeedback && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 mb-2">
                {opponent?.user?.name?.split(" ")[0]}'s Feedback
              </p>
              <p className="text-sm text-gray-400 leading-relaxed">
                {opponent.aiFeedback}
              </p>
            </div>
          )}
        </div>
      )}

      {/* My code */}
      {myPlayer?.code && (
        <div className="bg-white/5 dark:bg-[#13131f] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">
              Your Solution
            </h2>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 text-gray-400 capitalize">
              {myPlayer.language}
            </span>
          </div>
          <pre className="bg-[#0a0a0f] rounded-xl p-4 text-xs text-gray-300 font-mono overflow-x-auto max-h-48 overflow-y-auto">
            {myPlayer.code}
          </pre>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4 pb-6">
        <Link
          to="/battle"
          className="text-center bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl text-sm font-semibold transition-all"
        >
          ⚔️ New Battle
        </Link>
        <Link
          to="/leaderboard"
          className="text-center bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-500/20"
        >
          🏆 Leaderboard
        </Link>
      </div>
    </div>
  );
}

export default BattleResult;
