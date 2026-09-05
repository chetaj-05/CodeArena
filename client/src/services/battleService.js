import API from "./api";

export const createBattle = async (data) => {
  const res = await API.post("/battles/create", data);
  return res.data;
};

export const joinBattle = async (data) => {
  const res = await API.post("/battles/join", data);
  return res.data;
};

export const getBattle = async (id) => {
  const res = await API.get(`/battles/${id}`);
  return res.data;
};

export const getBattleByRoom = async (roomCode) => {
  const res = await API.get(`/battles/room/${roomCode}`);
  return res.data;
};

export const getLeaderboard = async () => {
  const res = await API.get("/battles/leaderboard");
  return res.data;
};

export const getBattleHistory = async () => {
  const res = await API.get("/battles/history");
  return res.data;
};

export const getHint = async (data) => {
  const res = await API.post("/battles/hint", data);
  return res.data;
};
export const surrenderBattle = async (data) => {
  const res = await API.post("/battles/surrender", data);
  return res.data;
};
