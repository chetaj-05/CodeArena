import { useEffect, useState } from "react";
import { getProblems } from "../services/problemService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const DIFFICULTIES = ["all", "easy", "medium", "hard"];

function Problems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState("all");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    fetchProblems();
  }, [difficulty]);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const filters = difficulty !== "all" ? { difficulty } : {};
      const data = await getProblems(filters);
      setProblems(data);
    } catch (error) {
      toast.error("Failed to load problems");
    } finally {
      setLoading(false);
    }
  };

  const filtered = problems.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Problems</h1>
        <p className="text-gray-400 mt-1 text-sm">
          {problems.length} problems available
        </p>
      </div>

      <div className="bg-white/5 dark:bg-[#13131f] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="🔍 Search problems or tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
        />
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                difficulty === d
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white/5 dark:bg-[#13131f] border border-white/5 rounded-2xl py-20 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-400 font-medium">No problems found</p>
        </div>
      ) : (
        <div className="bg-white/5 dark:bg-[#13131f] border border-white/5 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 px-6 py-3 border-b border-white/5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Title</div>
            <div className="col-span-3">Difficulty</div>
            <div className="col-span-3">Tags</div>
          </div>
          <div className="divide-y divide-white/5">
            {filtered.map((problem, index) => (
              <div
                key={problem._id}
                onClick={() => navigate(`/battle`)}
                className="grid grid-cols-12 px-6 py-4 items-center hover:bg-white/5 transition-colors group cursor-pointer"
              >
                <div className="col-span-1 text-gray-600 text-sm">
                  {index + 1}
                </div>
                <div className="col-span-5">
                  <p className="text-sm font-semibold text-white group-hover:text-violet-400 transition-colors">
                    {problem.title}
                  </p>
                </div>
                <div className="col-span-3">
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
                <div className="col-span-3 flex flex-wrap gap-1">
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
      )}
    </div>
  );
}

export default Problems;
