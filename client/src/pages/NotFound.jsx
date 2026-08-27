import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f]">
      <p className="text-8xl mb-6">⚔️</p>
      <h1 className="text-4xl font-bold text-white mb-2">404</h1>
      <p className="text-gray-400 mb-8">This page doesn't exist</p>
      <Link
        to="/"
        className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all"
      >
        Back to Home
      </Link>
    </div>
  );
}

export default NotFound;
