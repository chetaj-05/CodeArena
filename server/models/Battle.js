import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["waiting", "coding", "submitted", "won", "lost"],
    default: "waiting",
  },
  code: { type: String, default: "" },
  language: {
    type: String,
    enum: ["javascript", "python"],
    default: "javascript",
  },
  testCasesPassed: { type: Number, default: 0 },
  totalTestCases: { type: Number, default: 0 },
  submittedAt: { type: Date, default: null },
});

const battleSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      default: null,
    },
    players: [playerSchema],
    status: {
      type: String,
      // FIX: Added "judging" to the array below!
      enum: ["waiting", "active", "judging", "completed"],
      default: "waiting",
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    duration: { type: Number, default: 1800 },
  },
  { timestamps: true },
);

export default mongoose.model("Battle", battleSchema);
