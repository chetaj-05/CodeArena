import API from "./api";

export const login = async (data) => {
  const res = await API.post("/auth/login", data);
  return res.data;
};

export const register = async (data) => {
  const res = await API.post("/auth/register", data);
  return res.data;
};

export const getMe = async () => {
  const res = await API.get("/auth/me");
  return res.data;
};
