import { useEffect, useState } from "react";
import { getLeaderboard } from "../services/battleService";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const TABS = ["wins", "battles", "winrate"];

function Leaderboard() {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("wins");

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getLeaderboard();
        setPlayers(data);
      } catch (error) {
        toast.error("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const myRank =
    players.findIndex(
      (p) => p._id === user?.id || p._id?.toString() === user?.id,
    ) + 1;

  const getSortedPlayers = () => {
    const sorted = [...players];
    if (activeTab === "wins") {
      return sorted.sort((a, b) => b.stats.wins - a.stats.wins);
    } else if (activeTab === "battles") {
      return sorted.sort(
        (a, b) => b.stats.battlesPlayed - a.stats.battlesPlayed,
      );
    } else if (activeTab === "winrate") {
      return sorted.sort((a, b) => b.stats.winRate - a.stats.winRate);
    }
    return sorted;
  };

  const sorted = getSortedPlayers();

  const getTabLabel = (tab) => {
    if (tab === "wins") return "🏆 Most Wins";
    if (tab === "battles") return "⚔️ Most Battles";
    if (tab === "winrate") return "📊 Best Win Rate";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            🌍 Global Leaderboard
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Top coders from around the world
          </p>
        </div>
        {myRank > 0 && (
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-2 text-center">
            <p className="text-xs text-gray-400">Your rank</p>
            <p className="text-xl font-bold text-violet-400">#{myRank}</p>
          </div>
        )}
      </div>

      {/* My stats banner */}
      {user && (
        <div className="bg-gradient-to-r from-violet-600/20 via-transparent to-transparent border border-violet-500/20 rounded-2xl p-5">
          <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-3">
            Your Stats
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "Battles",
                value: user?.stats?.battlesPlayed || 0,
                color: "text-white",
              },
              {
                label: "Wins",
                value: user?.stats?.wins || 0,
                color: "text-green-400",
              },
              {
                label: "Losses",
                value: user?.stats?.losses || 0,
                color: "text-red-400",
              },
              {
                label: "Win Rate",
                value: `${user?.stats?.winRate || 0}%`,
                color: "text-amber-400",
              },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white/5 dark:bg-[#13131f] border border-white/5 rounded-2xl p-1 flex gap-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab
                ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {getTabLabel(tab)}
          </button>
        ))}
      </div>

      {/* Podium — top 3 */}
      {!loading && sorted.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { player: sorted[1], rank: 2, medal: "🥈", height: "h-28" },
            { player: sorted[0], rank: 1, medal: "🥇", height: "h-36" },
            { player: sorted[2], rank: 3, medal: "🥉", height: "h-24" },
          ].map(({ player, rank, medal, height }) => {
            const isMe =
              player._id === user?.id || player._id?.toString() === user?.id;
            return (
              <div
                key={rank}
                className={`rounded-2xl p-4 text-center flex flex-col items-center justify-end transition-all ${height} ${
                  rank === 1
                    ? "bg-yellow-500/10 border-2 border-yellow-500/30"
                    : isMe
                      ? "bg-violet-500/10 border border-violet-500/20"
                      : "bg-white/5 border border-white/5"
                }`}
              >
                <p className="text-2xl mb-1">{medal}</p>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mb-1.5 ${
                    isMe
                      ? "bg-gradient-to-br from-violet-500 to-indigo-600"
                      : "bg-gradient-to-br from-gray-600 to-gray-700"
                  }`}
                >
                  {player?.name?.[0]?.toUpperCase()}
                </div>
                <p className="text-xs font-semibold text-white truncate w-full text-center">
                  {player?.name?.split(" ")[0]}
                  {isMe && " (you)"}
                </p>
                <p
                  className={`text-xs font-bold mt-1 ${
                    activeTab === "wins"
                      ? "text-green-400"
                      : activeTab === "battles"
                        ? "text-violet-400"
                        : "text-amber-400"
                  }`}
                >
                  {activeTab === "wins" && `${player?.stats?.wins}W`}
                  {activeTab === "battles" &&
                    `${player?.stats?.battlesPlayed} battles`}
                  {activeTab === "winrate" && `${player?.stats?.winRate}%`}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Full table */}
      <div className="bg-white/5 dark:bg-[#13131f] border border-white/5 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 px-6 py-3 border-b border-white/5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-1">Rank</div>
          <div className="col-span-4">Player</div>
          <div className="col-span-2 text-center">Battles</div>
          <div className="col-span-2 text-center">Wins</div>
          <div className="col-span-2 text-center">Losses</div>
          <div className="col-span-1 text-center">WR%</div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-4xl mb-3">🏆</p>
            <p className="text-gray-400 text-sm font-medium">
              No players yet — be the first!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {sorted.map((player, index) => {
              const isMe =
                player._id === user?.id || player._id?.toString() === user?.id;
              return (
                <div
                  key={player._id}
                  className={`grid grid-cols-12 px-6 py-4 items-center transition-colors ${
                    isMe
                      ? "bg-violet-500/10 border-l-2 border-violet-500"
                      : "hover:bg-white/5"
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-1">
                    <span
                      className={`text-sm font-bold ${
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
                  </div>

                  {/* Player */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                        isMe
                          ? "bg-gradient-to-br from-violet-500 to-indigo-600"
                          : "bg-gradient-to-br from-gray-600 to-gray-700"
                      }`}
                    >
                      {player.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          isMe ? "text-violet-300" : "text-white"
                        }`}
                      >
                        {player.name}
                        {isMe && (
                          <span className="ml-1.5 text-xs text-violet-400 font-normal">
                            (you)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Joined{" "}
                        {new Date(player.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Battles */}
                  <div className="col-span-2 text-center">
                    <span
                      className={`text-sm font-bold ${
                        activeTab === "battles"
                          ? "text-violet-400"
                          : "text-gray-300"
                      }`}
                    >
                      {player.stats.battlesPlayed}
                    </span>
                  </div>

                  {/* Wins */}
                  <div className="col-span-2 text-center">
                    <span
                      className={`text-sm font-bold ${
                        activeTab === "wins"
                          ? "text-green-400"
                          : "text-green-400/60"
                      }`}
                    >
                      {player.stats.wins}
                    </span>
                  </div>

                  {/* Losses */}
                  <div className="col-span-2 text-center">
                    <span className="text-sm font-bold text-red-400/60">
                      {player.stats.losses}
                    </span>
                  </div>

                  {/* Win Rate */}
                  <div className="col-span-1 text-center">
                    <span
                      className={`text-xs font-bold ${
                        player.stats.winRate >= 70
                          ? "text-green-400"
                          : player.stats.winRate >= 50
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      {player.stats.winRate}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-gray-600 pb-4">
        Rankings update after every battle · Minimum 1 battle to appear
      </p>
    </div>
  );
}

export default Leaderboard;
