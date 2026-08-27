import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getBattleHistory, getLeaderboard } from "../services/battleService";
import { getProblems } from "../services/problemService";

function Home() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [h, l, p] = await Promise.all([
          getBattleHistory(),
          getLeaderboard(),
          getProblems(),
        ]);
        setHistory(h.slice(0, 3));
        setLeaderboard(l.slice(0, 5));
        setProblems(p.slice(0, 3));
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-violet-600/20 via-transparent to-transparent border border-violet-500/20 rounded-2xl p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-violet-300 text-xs font-medium">
              Ready to battle
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name?.split(" ")[0]} ⚔️
          </h1>
          <p className="text-gray-400 text-sm mb-6 max-w-lg">
            Challenge a developer to a 1v1 coding battle or practice problems to
            sharpen your skills.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/battle"
              className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-500/20"
            >
              ⚔️ Start Battle
            </Link>
            <Link
              to="/problems"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              📋 Browse Problems
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Battles",
            value: user?.stats?.battlesPlayed || 0,
            icon: "⚔️",
            color: "text-violet-400",
          },
          {
            label: "Wins",
            value: user?.stats?.wins || 0,
            icon: "🏆",
            color: "text-green-400",
          },
          {
            label: "Losses",
            value: user?.stats?.losses || 0,
            icon: "💀",
            color: "text-red-400",
          },
          {
            label: "Win Rate",
            value: `${user?.stats?.winRate || 0}%`,
            icon: "📊",
            color: "text-amber-400",
          },
        ].map(({ label, value, icon, color }) => (
          <div
            key={label}
            className="bg-white/5 dark:bg-[#13131f] border border-white/5 rounded-2xl p-5"
          >
            <p className="text-2xl mb-1">{icon}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent battles */}
        <div className="lg:col-span-2 bg-white/5 dark:bg-[#13131f] border border-white/5 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h2 className="text-base font-semibold text-white">
              Recent Battles
            </h2>
            <Link
              to="/battle"
              className="text-xs text-violet-400 font-semibold hover:underline"
            >
              New battle →
            </Link>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-4xl mb-3">⚔️</p>
              <p className="text-gray-400 font-medium text-sm">
                No battles yet
              </p>
              <Link
                to="/battle"
                className="mt-3 inline-block text-violet-400 text-sm font-semibold hover:underline"
              >
                Start your first battle →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {history.map((battle) => {
                const isWinner =
                  battle.winner?._id === user?.id ||
                  battle.winner?.toString() === user?.id;
                const opponent = battle.players?.find(
                  (p) =>
                    p.user?._id !== user?.id &&
                    p.user?._id?.toString() !== user?.id,
                );
                return (
                  <Link
                    key={battle._id}
                    to={`/battle/result/${battle._id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isWinner
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {isWinner ? "W" : "L"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {battle.problem?.title || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          vs {opponent?.user?.name || "Unknown"} ·{" "}
                          {battle.problem?.difficulty}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 group-hover:text-violet-400 transition-colors">
                      {new Date(battle.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Leaderboard preview */}
        <div className="bg-white/5 dark:bg-[#13131f] border border-white/5 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h2 className="text-base font-semibold text-white">Leaderboard</h2>
            <Link
              to="/leaderboard"
              className="text-xs text-violet-400 font-semibold hover:underline"
            >
              Full board →
            </Link>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-3xl mb-2">🏆</p>
              <p className="text-gray-400 text-sm">No data yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {leaderboard.map((player, index) => (
                <div
                  key={player._id}
                  className="flex items-center justify-between px-6 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-bold w-5 ${
                        index === 0
                          ? "text-yellow-400"
                          : index === 1
                            ? "text-gray-300"
                            : index === 2
                              ? "text-amber-600"
                              : "text-gray-600"
                      }`}
                    >
                      {index === 0
                        ? "🥇"
                        : index === 1
                          ? "🥈"
                          : index === 2
                            ? "🥉"
                            : `#${index + 1}`}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                      {player.name[0].toUpperCase()}
                    </div>
                    <p className="text-sm font-medium text-white">
                      {player.name.split(" ")[0]}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-green-400">
                      {player.stats.wins}W
                    </p>
                    <p className="text-xs text-gray-600">
                      {player.stats.winRate}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Problems preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Practice Problems</h2>
          <Link
            to="/problems"
            className="text-sm text-violet-400 font-semibold hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {problems.map((problem) => (
            <div
              key={problem._id}
              className="bg-white/5 dark:bg-[#13131f] border border-white/5 hover:border-violet-500/30 rounded-2xl p-5 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                    problem.difficulty === "easy"
                      ? "bg-green-500/10 text-green-400"
                      : problem.difficulty === "medium"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {problem.difficulty}
                </span>
              </div>
              <p className="text-sm font-semibold text-white mb-2">
                {problem.title}
              </p>
              <div className="flex flex-wrap gap-1">
                {problem.tags?.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
