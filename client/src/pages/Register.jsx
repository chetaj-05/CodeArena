import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function Register() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const data = await register({ name, email, password });
      authLogin(data.token, data.user);
      toast.success("Welcome to CodeArena! 🎉");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const getStrength = () => {
    if (!password.length) return null;
    if (password.length < 6)
      return { label: "Too short", color: "bg-red-500", width: "w-1/4" };
    if (password.length < 8)
      return { label: "Weak", color: "bg-orange-500", width: "w-2/4" };
    if (password.length < 12)
      return { label: "Good", color: "bg-yellow-500", width: "w-3/4" };
    return { label: "Strong", color: "bg-green-500", width: "w-full" };
  };

  const strength = getStrength();

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
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Join the arena
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Create your account and start competing against developers
            worldwide.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { icon: "⚔️", label: "1v1 Battles" },
              { icon: "🤖", label: "AI Feedback" },
              { icon: "🏆", label: "Leaderboard" },
              { icon: "📊", label: "Win Tracking" },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3"
              >
                <span className="text-xl">{icon}</span>
                <span className="text-white text-sm font-medium">{label}</span>
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
          <h2 className="text-3xl font-bold text-white mb-1">Create account</h2>
          <p className="text-gray-400 text-sm mb-8">
            Free forever. Start battling today.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
              />
            </div>
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
                  placeholder="Min. 6 characters"
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
              {strength && (
                <div className="mt-2">
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`}
                    />
                  </div>
                  <p
                    className={`text-xs mt-1 font-medium ${
                      strength.label === "Strong"
                        ? "text-green-500"
                        : strength.label === "Good"
                          ? "text-yellow-500"
                          : strength.label === "Weak"
                            ? "text-orange-500"
                            : "text-red-500"
                    }`}
                  >
                    {strength.label}
                  </p>
                </div>
              )}
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
                  Creating account...
                </span>
              ) : (
                "Join CodeArena ⚔️"
              )}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-violet-400 font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
