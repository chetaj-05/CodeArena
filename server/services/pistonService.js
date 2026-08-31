// import axios from "axios";

// const PISTON_URL = "https://emkc.org/api/v2/piston/execute";

// const LANGUAGE_CONFIG = {
//   javascript: { language: "javascript", version: "18.15.0" },
//   python: { language: "python", version: "3.10.0" },
// };

// // Check if user actually wrote real code
// const hasRealSolution = (code, language) => {
//   if (!code || !code.trim()) return false;

//   const lines = code.split("\n").filter((line) => {
//     const trimmed = line.trim();
//     return (
//       trimmed !== "" &&
//       !trimmed.startsWith("//") &&
//       !trimmed.startsWith("#") &&
//       !trimmed.startsWith("function ") &&
//       !trimmed.startsWith("def ") &&
//       !trimmed.startsWith("const lines") &&
//       !trimmed.startsWith("import ") &&
//       !trimmed.startsWith("};") &&
//       !trimmed.startsWith("return {};") &&
//       trimmed !== "// Write your solution here" &&
//       trimmed !== "# Write your solution here" &&
//       trimmed !== "pass"
//     );
//   });

//   return lines.length >= 2;
// };

// const getMockResult = (testCases, code, language) => {
//   // No real code written
//   if (!hasRealSolution(code, language)) {
//     return {
//       passed: 0,
//       total: testCases.length,
//       results: testCases.map((tc) => ({
//         input: tc.isHidden ? "Hidden" : tc.input,
//         expectedOutput: tc.isHidden ? "Hidden" : tc.expectedOutput,
//         actualOutput: "No solution provided",
//         passed: false,
//         isHidden: tc.isHidden,
//         error: "Write your solution before running",
//       })),
//       status: "wrong_answer",
//     };
//   }

//   // Simulate wrong answer (dev mode never accepts)
//   return {
//     passed: 0,
//     total: testCases.length,
//     results: testCases.map((tc) => ({
//       input: tc.isHidden ? "Hidden" : tc.input,
//       expectedOutput: tc.isHidden ? "Hidden" : tc.expectedOutput,
//       actualOutput: "Mock mode — deploy to test real execution",
//       passed: false,
//       isHidden: tc.isHidden,
//       error: null,
//     })),
//     status: "wrong_answer",
//   };
// };

// export const executeCode = async (code, language, stdin = "") => {
//   const config = LANGUAGE_CONFIG[language];
//   if (!config) throw new Error(`Unsupported language: ${language}`);

//   const response = await axios.post(
//     PISTON_URL,
//     {
//       language: config.language,
//       version: config.version,
//       files: [{ content: code }],
//       stdin,
//     },
//     { timeout: 15000 },
//   );

//   const { run } = response.data;
//   return {
//     stdout: run.stdout?.trim() || "",
//     stderr: run.stderr?.trim() || "",
//     exitCode: run.code,
//   };
// };

// export const runTestCases = async (code, language, testCases) => {
//   if (process.env.NODE_ENV === "development") {
//     console.log("DEV MODE: mock execution");
//     return getMockResult(testCases, code, language);
//   }

//   const results = [];
//   let passed = 0;

//   for (const testCase of testCases) {
//     try {
//       const result = await executeCode(code, language, testCase.input);
//       const actualOutput = result.stdout.trim();
//       const expectedOutput = testCase.expectedOutput.trim();
//       const isCorrect = actualOutput === expectedOutput;

//       if (isCorrect) passed++;

//       results.push({
//         input: testCase.isHidden ? "Hidden" : testCase.input,
//         expectedOutput: testCase.isHidden ? "Hidden" : expectedOutput,
//         actualOutput: testCase.isHidden
//           ? isCorrect
//             ? "Correct"
//             : "Wrong"
//           : actualOutput,
//         passed: isCorrect,
//         isHidden: testCase.isHidden,
//         error: result.stderr || null,
//       });
//     } catch (error) {
//       results.push({
//         input: testCase.isHidden ? "Hidden" : testCase.input,
//         expectedOutput: testCase.isHidden ? "Hidden" : testCase.expectedOutput,
//         actualOutput: "Runtime Error",
//         passed: false,
//         isHidden: testCase.isHidden,
//         error: error.message,
//       });
//     }
//   }

//   return {
//     passed,
//     total: testCases.length,
//     results,
//     status: passed === testCases.length ? "accepted" : "wrong_answer",
//   };
// };
// import axios from "axios";

// const ONLINE_COMPILER_URL = "https://api.onlinecompiler.io/api/run-code-sync/";

// const LANGUAGE_CONFIG = {
//   javascript: "nodejs",
//   python: "python-3.14",
//   cpp: "g++-15",
// };

// const executeCode = async (code, language, input = "") => {
//   const compiler = LANGUAGE_CONFIG[language];

//   if (!compiler) {
//     throw new Error(`Unsupported language: ${language}`);
//   }

//   const response = await axios.post(
//     ONLINE_COMPILER_URL,
//     {
//       compiler,
//       code,
//       input,
//     },
//     {
//       headers: {
//         Authorization: process.env.ONLINECOMPILER_API_KEY,
//         "Content-Type": "application/json",
//       },
//       timeout: 35000,
//     },
//   );

//   const data = response.data;

//   return {
//     stdout: data.output || "",
//     stderr: data.error || "",
//     exitCode: data.exit_code ?? 1,
//     status: data.status,
//     signal: data.signal,
//     time: data.time,
//     total: data.total,
//     memory: data.memory,
//   };
// };

// export const runTestCases = async (code, language, testCases) => {
//   const results = [];
//   let passed = 0;

//   for (const testCase of testCases) {
//     try {
//       const result = await executeCode(code, language, testCase.input || "");

//       const actualOutput = result.stdout.trim();
//       const expectedOutput = testCase.expectedOutput.trim();

//       const isCorrect = actualOutput === expectedOutput;

//       if (isCorrect) {
//         passed++;
//       }

//       results.push({
//         input: testCase.isHidden ? "Hidden" : testCase.input,
//         expectedOutput: testCase.isHidden ? "Hidden" : expectedOutput,
//         actualOutput: testCase.isHidden
//           ? isCorrect
//             ? "Correct"
//             : "Wrong"
//           : actualOutput,
//         passed: isCorrect,
//         isHidden: testCase.isHidden,
//         error: result.stderr || null,
//       });
//     } catch (error) {
//       console.error(
//         "OnlineCompiler execution error:",
//         error.response?.data || error.message,
//       );

//       results.push({
//         input: testCase.isHidden ? "Hidden" : testCase.input,
//         expectedOutput: testCase.isHidden ? "Hidden" : testCase.expectedOutput,
//         actualOutput: "Execution Error",
//         passed: false,
//         isHidden: testCase.isHidden,
//         error:
//           error.response?.data?.message ||
//           error.response?.data?.error ||
//           error.message,
//       });
//     }
//   }

//   return {
//     passed,
//     total: testCases.length,
//     results,
//     status: passed === testCases.length ? "accepted" : "wrong_answer",
//   };
// };
// import axios from "axios";

// const JDOODLE_URL = "https://api.jdoodle.com/v1/execute";

// const LANGUAGE_CONFIG = {
//   javascript: { language: "nodejs", versionIndex: "4" },
//   python: { language: "python3", versionIndex: "4" },
// };

// const executeCode = async (code, language, stdin = "") => {
//   const config = LANGUAGE_CONFIG[language];
//   if (!config) throw new Error(`Unsupported language: ${language}`);

//   const response = await axios.post(
//     JDOODLE_URL,
//     {
//       clientId: process.env.JDOODLE_CLIENT_ID,
//       clientSecret: process.env.JDOODLE_CLIENT_SECRET,
//       script: code,
//       language: config.language,
//       versionIndex: config.versionIndex,
//       stdin: stdin,
//     },
//     { timeout: 15000 },
//   );

//   const data = response.data;

//   // JDoodle returns output in data.output
//   return {
//     stdout: data.output?.trim() || "",
//     stderr: "",
//     exitCode: data.statusCode === 200 ? 0 : 1,
//   };
// };

// export const runTestCases = async (code, language, testCases) => {
//   const results = [];
//   let passed = 0;

//   for (const testCase of testCases) {
//     try {
//       const result = await executeCode(code, language, testCase.input);
//       const actualOutput = result.stdout.trim();
//       const expectedOutput = testCase.expectedOutput.trim();
//       const isCorrect = actualOutput === expectedOutput;

//       if (isCorrect) passed++;

//       results.push({
//         input: testCase.isHidden ? "Hidden" : testCase.input,
//         expectedOutput: testCase.isHidden ? "Hidden" : expectedOutput,
//         actualOutput: testCase.isHidden
//           ? isCorrect
//             ? "Correct"
//             : "Wrong"
//           : actualOutput,
//         passed: isCorrect,
//         isHidden: testCase.isHidden,
//         error: result.stderr || null,
//       });
//     } catch (error) {
//       results.push({
//         input: testCase.isHidden ? "Hidden" : testCase.input,
//         expectedOutput: testCase.isHidden ? "Hidden" : testCase.expectedOutput,
//         actualOutput: "Execution Error",
//         passed: false,
//         isHidden: testCase.isHidden,
//         error: error.message,
//       });
//     }
//   }

//   return {
//     passed,
//     total: testCases.length,
//     results,
//     status: passed === testCases.length ? "accepted" : "wrong_answer",
//   };
// };
// import axios from "axios";

// const COMPILER_URL = "https://api.onlinecompiler.io/api/run-code/";

// const LANGUAGE_CONFIG = {
//   javascript: "node-23",
//   python: "python-3.14",
// };

// const executeCode = async (code, language, stdin = "") => {
//   const compiler = LANGUAGE_CONFIG[language];
//   if (!compiler) throw new Error(`Unsupported language: ${language}`);

//   const response = await axios.post(
//     COMPILER_URL,
//     {
//       compiler,
//       code,
//       input: stdin,
//     },
//     {
//       headers: {
//         Authorization: process.env.ONLINE_COMPILER_API_KEY,
//         "Content-Type": "application/json",
//       },
//       timeout: 15000,
//     },
//   );

//   const { output, error, status } = response.data;

//   return {
//     stdout: output?.trim() || "",
//     stderr: error?.trim() || "",
//     exitCode: status === "success" ? 0 : 1,
//   };
// };

// export const runTestCases = async (code, language, testCases) => {
//   const results = [];
//   let passed = 0;

//   for (const testCase of testCases) {
//     try {
//       const result = await executeCode(code, language, testCase.input);
//       const actualOutput = result.stdout.trim();
//       const expectedOutput = testCase.expectedOutput.trim();
//       const isCorrect = actualOutput === expectedOutput;

//       if (isCorrect) passed++;

//       results.push({
//         input: testCase.isHidden ? "Hidden" : testCase.input,
//         expectedOutput: testCase.isHidden ? "Hidden" : expectedOutput,
//         actualOutput: testCase.isHidden
//           ? isCorrect
//             ? "Correct"
//             : "Wrong"
//           : actualOutput,
//         passed: isCorrect,
//         isHidden: testCase.isHidden,
//         error: result.stderr || null,
//       });
//     } catch (error) {
//       results.push({
//         input: testCase.isHidden ? "Hidden" : testCase.input,
//         expectedOutput: testCase.isHidden ? "Hidden" : testCase.expectedOutput,
//         actualOutput: "Execution Error",
//         passed: false,
//         isHidden: testCase.isHidden,
//         error: error.message,
//       });
//     }
//   }

//   return {
//     passed,
//     total: testCases.length,
//     results,
//     status: passed === testCases.length ? "accepted" : "wrong_answer",
//   };
// };
import axios from "axios";

const ONLINE_COMPILER_URL = "https://api.onlinecompiler.io/api/run-code-sync/";

const LANGUAGE_CONFIG = {
  cpp: "g++-15",
  python: "python-3.14",
};

const executeCode = async (code, language, input = "") => {
  const compiler = LANGUAGE_CONFIG[language];

  if (!compiler) {
    throw new Error(`Unsupported language: ${language}`);
  }

  console.log("Executing with OnlineCompiler...");
  console.log("Compiler:", compiler);
  console.log("API key loaded:", !!process.env.ONLINECOMPILER_API_KEY);

  const response = await axios.post(
    ONLINE_COMPILER_URL,
    {
      compiler: compiler,
      code: code,
      input: input,
    },
    {
      headers: {
        Authorization: process.env.ONLINECOMPILER_API_KEY,
        "Content-Type": "application/json",
      },
      timeout: 35000,
    },
  );

  console.log("OnlineCompiler response:", response.data);

  const data = response.data;

  return {
    stdout: data.output || "",
    stderr: data.error || "",
    exitCode: data.exit_code,
    status: data.status,
    signal: data.signal,
    time: data.time,
    total: data.total,
    memory: data.memory,
  };
};

export const runTestCases = async (code, language, testCases) => {
  const results = [];
  let passed = 0;

  for (const testCase of testCases) {
    try {
      const result = await executeCode(code, language, testCase.input || "");

      const actualOutput = result.stdout.trim().replace(/\s+/g, "");
      const expectedOutput = testCase.expectedOutput.trim().replace(/\s+/g, "");

      const isCorrect = actualOutput === expectedOutput;

      if (isCorrect) {
        passed++;
      }

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
      console.error("OnlineCompiler STATUS:", error.response?.status);

      console.error("OnlineCompiler DATA:", error.response?.data);

      console.error("OnlineCompiler MESSAGE:", error.message);

      results.push({
        input: testCase.isHidden ? "Hidden" : testCase.input,

        expectedOutput: testCase.isHidden ? "Hidden" : testCase.expectedOutput,

        actualOutput: "Execution Error",

        passed: false,

        isHidden: testCase.isHidden,

        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message,
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
