import { useEffect, useState } from "react";
import { getLeaderboard } from "../services/battleService";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function Leaderboard() {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Top coders ranked by wins
          </p>
        </div>
        {myRank > 0 && (
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-2 text-center">
            <p className="text-xs text-gray-400">Your rank</p>
            <p className="text-xl font-bold text-violet-400">#{myRank}</p>
          </div>
        )}
      </div>

      {/* Podium */}
      {!loading && players.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { player: players[1], rank: 2, medal: "🥈", height: "h-24" },
            { player: players[0], rank: 1, medal: "🥇", height: "h-32" },
            { player: players[2], rank: 3, medal: "🥉", height: "h-20" },
          ].map(({ player, rank, medal, height }) => (
            <div
              key={rank}
              className={`bg-white/5 dark:bg-[#13131f] border border-white/5 rounded-2xl p-5 text-center flex flex-col items-center justify-end ${height} ${
                rank === 1 ? "border-yellow-500/30 bg-yellow-500/5" : ""
              }`}
            >
              <p className="text-2xl mb-2">{medal}</p>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold mb-2">
                {player?.name?.[0]?.toUpperCase()}
              </div>
              <p className="text-xs font-semibold text-white truncate w-full text-center">
                {player?.name?.split(" ")[0]}
              </p>
              <p className="text-xs text-green-400 font-bold mt-1">
                {player?.stats?.wins}W
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white/5 dark:bg-[#13131f] border border-white/5 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 px-6 py-3 border-b border-white/5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-1">Rank</div>
          <div className="col-span-5">Player</div>
          <div className="col-span-2 text-center">Wins</div>
          <div className="col-span-2 text-center">Losses</div>
          <div className="col-span-2 text-center">Win Rate</div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : players.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-4xl mb-3">🏆</p>
            <p className="text-gray-400 text-sm font-medium">No players yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {players.map((player, index) => {
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
                  <div className="col-span-5 flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        isMe
                          ? "bg-gradient-to-br from-violet-500 to-indigo-600"
                          : "bg-gradient-to-br from-gray-600 to-gray-700"
                      }`}
                    >
                      {player.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-semibold ${isMe ? "text-violet-300" : "text-white"}`}
                      >
                        {player.name}
                        {isMe && (
                          <span className="ml-2 text-xs text-violet-400 font-normal">
                            (you)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-600">
                        {player.stats.battlesPlayed} battles
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-sm font-bold text-green-400">
                      {player.stats.wins}
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-sm font-bold text-red-400">
                      {player.stats.losses}
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span
                      className={`text-sm font-bold ${
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
    </div>
  );
}

export default Leaderboard;
