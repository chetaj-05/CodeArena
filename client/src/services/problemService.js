import API from "./api";

export const getProblems = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await API.get(`/problems?${params}`);
  return res.data;
};

export const getProblem = async (slug) => {
  const res = await API.get(`/problems/${slug}`);
  return res.data;
};
