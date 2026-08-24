import axios from "axios";

const PISTON_URL = "https://emkc.org/api/v2/piston/execute";

const LANGUAGE_CONFIG = {
  javascript: { language: "javascript", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
};

// Mock results for local development
const getMockResult = (testCases) => {
  const results = testCases.map((tc) => ({
    input: tc.isHidden ? "Hidden" : tc.input,
    expectedOutput: tc.isHidden ? "Hidden" : tc.expectedOutput,
    actualOutput: tc.isHidden ? "Correct" : tc.expectedOutput,
    passed: true,
    isHidden: tc.isHidden,
    error: null,
  }));
  return {
    passed: testCases.length,
    total: testCases.length,
    results,
    status: "accepted",
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
  // Use mock in local development
  if (process.env.NODE_ENV === "development") {
    console.log("DEV MODE: Using mock code execution");
    return getMockResult(testCases);
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
