import axios from "axios";

const PISTON_URL = "https://emkc.org/api/v2/piston/execute";

const LANGUAGE_CONFIG = {
  javascript: { language: "javascript", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
};

// Check if user actually wrote real code
const hasRealSolution = (code, language) => {
  if (!code || !code.trim()) return false;

  const lines = code.split("\n").filter((line) => {
    const trimmed = line.trim();
    return (
      trimmed !== "" &&
      !trimmed.startsWith("//") &&
      !trimmed.startsWith("#") &&
      !trimmed.startsWith("function ") &&
      !trimmed.startsWith("def ") &&
      !trimmed.startsWith("const lines") &&
      !trimmed.startsWith("import ") &&
      !trimmed.startsWith("};") &&
      !trimmed.startsWith("return {};") &&
      trimmed !== "// Write your solution here" &&
      trimmed !== "# Write your solution here" &&
      trimmed !== "pass"
    );
  });

  return lines.length >= 2;
};

const getMockResult = (testCases, code, language) => {
  // No real code written
  if (!hasRealSolution(code, language)) {
    return {
      passed: 0,
      total: testCases.length,
      results: testCases.map((tc) => ({
        input: tc.isHidden ? "Hidden" : tc.input,
        expectedOutput: tc.isHidden ? "Hidden" : tc.expectedOutput,
        actualOutput: "No solution provided",
        passed: false,
        isHidden: tc.isHidden,
        error: "Write your solution before running",
      })),
      status: "wrong_answer",
    };
  }

  // Simulate wrong answer (dev mode never accepts)
  return {
    passed: 0,
    total: testCases.length,
    results: testCases.map((tc) => ({
      input: tc.isHidden ? "Hidden" : tc.input,
      expectedOutput: tc.isHidden ? "Hidden" : tc.expectedOutput,
      actualOutput: "Mock mode — deploy to test real execution",
      passed: false,
      isHidden: tc.isHidden,
      error: null,
    })),
    status: "wrong_answer",
  };
};

export const executeCode = async (code, language, stdin = "") => {
  const config = LANGUAGE_CONFIG[language];
  if (!config) throw new Error(`Unsupported language: ${language}`);

  const response = await axios.post(
    PISTON_URL,
    {
      language: config.language,
      version: config.version,
      files: [{ content: code }],
      stdin,
    },
    { timeout: 15000 },
  );

  const { run } = response.data;
  return {
    stdout: run.stdout?.trim() || "",
    stderr: run.stderr?.trim() || "",
    exitCode: run.code,
  };
};

export const runTestCases = async (code, language, testCases) => {
  if (process.env.NODE_ENV === "development") {
    console.log("DEV MODE: mock execution");
    return getMockResult(testCases, code, language);
  }

  const results = [];
  let passed = 0;

  for (const testCase of testCases) {
    try {
      const result = await executeCode(code, language, testCase.input);
      const actualOutput = result.stdout.trim();
      const expectedOutput = testCase.expectedOutput.trim();
      const isCorrect = actualOutput === expectedOutput;

      if (isCorrect) passed++;

      results.push({
        input: testCase.isHidden ? "Hidden" : testCase.input,
        expectedOutput: testCase.isHidden ? "Hidden" : expectedOutput,
        actualOutput: testCase.isHidden
          ? isCorrect
            ? "Correct"
            : "Wrong"
          : actualOutput,
        passed: isCorrect,
        isHidden: testCase.isHidden,
        error: result.stderr || null,
      });
    } catch (error) {
      results.push({
        input: testCase.isHidden ? "Hidden" : testCase.input,
        expectedOutput: testCase.isHidden ? "Hidden" : testCase.expectedOutput,
        actualOutput: "Runtime Error",
        passed: false,
        isHidden: testCase.isHidden,
        error: error.message,
      });
    }
  }

  return {
    passed,
    total: testCases.length,
    results,
    status: passed === testCases.length ? "accepted" : "wrong_answer",
  };
};
