import API from "./api";

export const runCode = async (data) => {
  const res = await API.post("/code/run", data);
  return res.data;
};

export const submitCode = async (data) => {
  const res = await API.post("/code/submit", data);
  return res.data;
};
