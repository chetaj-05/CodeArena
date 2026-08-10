import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, default: "" },
  isHidden: { type: Boolean, default: false },
});

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },
    tags: [String],
    description: {
      type: String,
      required: true,
    },
    constraints: {
      type: String,
      default: "",
    },
    examples: [
      {
        input: String,
        output: String,
        explanation: String,
      },
    ],
    testCases: [testCaseSchema],
    starterCode: {
      javascript: { type: String, default: "// Write your solution here\n" },
      python: { type: String, default: "# Write your solution here\n" },
    },
    timeLimit: { type: Number, default: 2000 },
    memoryLimit: { type: Number, default: 256 },
  },
  { timestamps: true },
);

export default mongoose.model("Problem", problemSchema);
