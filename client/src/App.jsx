import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { SocketProvider } from "./context/SocketContext";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Problems from "./pages/Problems";
import BattleLobby from "./pages/BattleLobby";
import BattleRoom from "./pages/BattleRoom";
import BattleResult from "./pages/BattleResult";
import LeaderBoard from "./pages/LeaderBoard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <SocketProvider>
              <Routes>
                <Route
                  path="/"
                  element={
                    <Layout>
                      <Home />
                    </Layout>
                  }
                />
                <Route
                  path="/problems"
                  element={
                    <Layout>
                      <Problems />
                    </Layout>
                  }
                />
                <Route
                  path="/battle"
                  element={
                    <Layout>
                      <BattleLobby />
                    </Layout>
                  }
                />
                <Route path="/battle/room/:roomCode" element={<BattleRoom />} />
                <Route
                  path="/battle/result/:id"
                  element={
                    <Layout>
                      <BattleResult />
                    </Layout>
                  }
                />
                <Route
                  path="/leaderboard"
                  element={
                    <Layout>
                      <Leaderboard />
                    </Layout>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <Layout>
                      <Profile />
                    </Layout>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SocketProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
