export const getHint = async (data) => {
  const res = await API.post("/battles/hint", data);
  return res.data;
};
