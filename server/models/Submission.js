import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    battle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Battle",
      required: true,
    },
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      enum: ["javascript", "python"],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "accepted",
        "wrong_answer",
        "runtime_error",
        "time_limit",
        "pending",
      ],
      default: "pending",
    },
    testCasesPassed: { type: Number, default: 0 },
    totalTestCases: { type: Number, default: 0 },
    runtime: { type: Number, default: 0 },
    memory: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("Submission", submissionSchema);
