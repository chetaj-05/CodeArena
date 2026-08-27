import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function Login() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const data = await login({ email, password });
      authLogin(data.token, data.user);
      toast.success("Welcome back! 👋");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-900/50 via-[#0f0f1a] to-[#0a0a0f] flex-col justify-between p-12 border-r border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold">CA</span>
          </div>
          <span className="text-white text-xl font-bold">
            Code<span className="text-violet-400">Arena</span>
          </span>
        </div>
        <div>
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-6">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-violet-300 text-sm font-medium">
              Live battles happening now
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Compete. Code. <span className="text-violet-400">Conquer.</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Challenge developers worldwide in real-time 1v1 coding battles.
          </p>
          <div className="mt-10 space-y-4">
            {[
              { icon: "⚔️", text: "Real-time 1v1 coding battles" },
              { icon: "⚡", text: "Live code execution" },
              { icon: "🤖", text: "AI feedback on your solution" },
              { icon: "🏆", text: "Global leaderboard" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-sm">
                  {icon}
                </div>
                <p className="text-gray-300 text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-gray-600 text-sm">
          © {new Date().getFullYear()} CodeArena.
        </p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-sm font-bold">CA</span>
            </div>
            <span className="text-white text-lg font-bold">
              Code<span className="text-violet-400">Arena</span>
            </span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-1">Sign in</h2>
          <p className="text-gray-400 text-sm mb-8">
            Enter the arena and start battling
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs font-medium"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-500/20 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In ⚔️"
              )}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            New to CodeArena?{" "}
            <Link
              to="/register"
              className="text-violet-400 font-semibold hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
