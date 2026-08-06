import Problem from "../models/Problem.js";

export const getProblems = async (req, res) => {
  try {
    const { difficulty, tag } = req.query;
    const filter = {};

    if (difficulty) filter.difficulty = difficulty;
    if (tag) filter.tags = { $in: [tag] };

    const problems = await Problem.find(filter)
      .select("-testCases -starterCode")
      .sort({ createdAt: 1 });

    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getProblem = async (req, res) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug }).select(
      "-testCases",
    );

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getRandomProblem = async (req, res) => {
  try {
    const { difficulty } = req.query;
    const filter = {};
    if (difficulty) filter.difficulty = difficulty;

    const count = await Problem.countDocuments(filter);
    const random = Math.floor(Math.random() * count);
    const problem = await Problem.findOne(filter)
      .skip(random)
      .select("-testCases");

    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
