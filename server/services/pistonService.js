import axios from "axios";

const COMPILER_URL = "https://api.onlinecompiler.io/api/run-code-sync/";

const LANGUAGE_CONFIG = {
  python: "python-3.14",
  cpp: "c++",
};

const executeCode = async (code, language, stdin = "") => {
  const compiler = LANGUAGE_CONFIG[language];
  if (!compiler) throw new Error(`Unsupported language: ${language}`);

  const response = await axios.post(
    COMPILER_URL,
    {
      compiler,
      code,
      input: stdin,
    },
    {
      headers: {
        Authorization: process.env.ONLINECOMPILER_API_KEY,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    },
  );

  const { output, error, status } = response.data;

  return {
    stdout: output?.trim() || "",
    stderr: error?.trim() || "",
    exitCode: status === "success" ? 0 : 1,
  };
};

export const runTestCases = async (code, language, testCases) => {
  const results = [];
  let passed = 0;

  for (const testCase of testCases) {
    try {
      const result = await executeCode(code, language, testCase.input);

      const actualOutput = result.stdout.trim();
      const expectedOutput = testCase.expectedOutput.trim();

      const normalizedActual = actualOutput.replace(/\s+/g, "");
      const normalizedExpected = expectedOutput.replace(/\s+/g, "");

      const isCorrect = normalizedActual === normalizedExpected;
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
      console.error("Execution error:", error.response?.data || error.message);
      results.push({
        input: testCase.isHidden ? "Hidden" : testCase.input,
        expectedOutput: testCase.isHidden ? "Hidden" : testCase.expectedOutput,
        actualOutput: "Execution Error",
        passed: false,
        isHidden: testCase.isHidden,
        error: error.response?.data?.message || error.message,
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
