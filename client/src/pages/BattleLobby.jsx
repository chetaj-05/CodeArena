import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBattle, joinBattle } from "../services/battleService";
import toast from "react-hot-toast";

const DIFFICULTIES = [
  {
    value: "easy",
    label: "Easy",
    icon: "🟢",
    desc: "Fundamentals",
    active: "border-green-500/50 bg-green-500/10 text-green-400",
  },
  {
    value: "medium",
    label: "Medium",
    icon: "🟡",
    desc: "Intermediate",
    active: "border-yellow-500/50 bg-yellow-500/10 text-yellow-400",
  },
  {
    value: "hard",
    label: "Hard",
    icon: "🔴",
    desc: "Advanced",
    active: "border-red-500/50 bg-red-500/10 text-red-400",
  },
];

function BattleLobby() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState("easy");
  const [roomCode, setRoomCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [tab, setTab] = useState("create");

  const handleCreate = async () => {
    setCreating(true);
    try {
      const data = await createBattle({ difficulty });
      toast.success(`Room created! Code: ${data.roomCode}`);
      navigate(`/battle/room/${data.roomCode}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create battle");
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async () => {
    if (!roomCode.trim()) {
      toast.error("Enter a room code");
      return;
    }
    setJoining(true);
    try {
      const data = await joinBattle({ roomCode: roomCode.toUpperCase() });
      toast.success("Joined battle!");
      navigate(`/battle/room/${data.roomCode}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to join battle");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">⚔️ Battle Arena</h1>
        <p className="text-gray-400 text-sm">
          Create a room or join a friend's battle
        </p>
      </div>

      <div className="bg-white/5 dark:bg-[#13131f] border border-white/5 rounded-2xl p-1 flex gap-1">
        {["create", "join"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${
              tab === t
                ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {t === "create" ? "⚔️ Create Battle" : "🔗 Join Battle"}
          </button>
        ))}
      </div>

      {tab === "create" ? (
        <div className="bg-white/5 dark:bg-[#13131f] border border-white/5 rounded-2xl p-6 space-y-6">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">
              Select Difficulty
            </label>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTIES.map(({ value, label, icon, desc, active }) => (
                <button
                  key={value}
                  onClick={() => setDifficulty(value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    difficulty === value
                      ? active
                      : "border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300"
                  }`}
                >
                  <span className="text-2xl">{icon}</span>
                  <span className="text-sm font-semibold">{label}</span>
                  <span className="text-xs opacity-70">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Battle Info
            </p>
            {[
              { label: "Format", value: "1v1 Real-time" },
              {
                label: "Difficulty",
                value: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
              },
              { label: "Time Limit", value: "30 minutes" },
              { label: "Winner", value: "First to pass all test cases" },
              { label: "Bonus", value: "AI feedback on both solutions" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-xs font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleCreate}
            disabled={creating}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white py-3.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2"
          >
            {creating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating room...
              </>
            ) : (
              "⚔️ Create Battle Room"
            )}
          </button>
        </div>
      ) : (
        <div className="bg-white/5 dark:bg-[#13131f] border border-white/5 rounded-2xl p-6 space-y-6">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">
              Room Code
            </label>
            <input
              type="text"
              placeholder="Enter 6-digit code (e.g. ABC123)"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition text-center text-lg font-mono tracking-widest"
            />
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs text-gray-500 text-center">
              Ask your opponent for their room code. Both players must be online
              to start.
            </p>
          </div>
          <button
            onClick={handleJoin}
            disabled={joining || roomCode.length !== 6}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white py-3.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2"
          >
            {joining ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Joining...
              </>
            ) : (
              "🔗 Join Battle"
            )}
          </button>
        </div>
      )}

      <div className="bg-white/5 dark:bg-[#13131f] border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">How it works</h3>
        <div className="space-y-3">
          {[
            "Create a room and share the 6-digit code with your opponent",
            "Both players get the same coding problem",
            "Write and run your code — first to pass all test cases wins",
            "AI analyzes both solutions and gives detailed feedback",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-400 shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-sm text-gray-400">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BattleLobby;
