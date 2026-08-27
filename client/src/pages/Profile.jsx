import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getBattleHistory } from "../services/battleService";
import { Link } from "react-router-dom";

function Profile() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getBattleHistory();
        setHistory(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-white">Profile</h1>

      {/* Profile card */}
      <div className="bg-white/5 dark:bg-[#13131f] border border-white/5 rounded-2xl overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-violet-600/30 via-indigo-600/20 to-transparent" />
        <div className="px-6 pb-6 -mt-12">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-[#13131f] mb-4">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-white">{user?.name}</h2>
          <p className="text-gray-400 text-sm mt-0.5">{user?.email}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-medium">
              Coder
            </span>
            <span className="text-xs text-gray-600">
              Joined{" "}
              {new Date(user?.createdAt || Date.now()).toLocaleDateString(
                "en-IN",
                {
                  month: "long",
                  year: "numeric",
                },
              )}
            </span>
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
            className="bg-white/5 dark:bg-[#13131f] border border-white/5 rounded-2xl p-5 text-center"
          >
            <p className="text-2xl mb-2">{icon}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Battle history */}
      <div className="bg-white/5 dark:bg-[#13131f] border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-base font-semibold text-white">Battle History</h3>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-3xl mb-3">⚔️</p>
            <p className="text-gray-400 text-sm font-medium">No battles yet</p>
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
                  p.user._id !== user?.id &&
                  p.user._id?.toString() !== user?.id,
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
                      <p className="text-xs text-gray-500 mt-0.5 capitalize">
                        vs {opponent?.user?.name || "Unknown"} ·{" "}
                        {battle.problem?.difficulty}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 group-hover:text-violet-400 transition-colors">
                    {new Date(battle.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
