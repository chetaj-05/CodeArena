import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = "gemini-3.6-flash"; // Fast and reliable

export const analyzeCode = async ({
  problem,
  player1Code,
  player2Code,
  player1Name,
  player2Name,
  player1Language,
  player2Language,
}) => {
  const prompt = `
You are an expert software engineer reviewing two solutions to a coding problem.

Problem: ${problem.title}
Description: ${problem.description}

${player1Name}'s solution (${player1Language}):
\`\`\`
${player1Code}
\`\`\`

${player2Name}'s solution (${player2Language}):
\`\`\`
${player2Code}
\`\`\`

Analyze both solutions and return ONLY valid JSON with no extra text, no markdown:
{
  "player1Feedback": "2-3 sentences about ${player1Name} code quality and time complexity",
  "player2Feedback": "2-3 sentences about ${player2Name} code quality and time complexity",
  "idealSolution": "brief 2-3 sentence explanation of optimal approach",
  "summary": "1 sentence overall battle summary"
}`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        temperature: 0.3,
        responseMimeType: "application/json", // Forces perfect JSON output
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const generateHint = async ({ problem, currentCode, language }) => {
  const hasCode =
    currentCode &&
    currentCode.trim().length > 20 &&
    !currentCode.includes("# Write your solution here") &&
    !currentCode.includes("// Write your solution here");

  const prompt = hasCode
    ? `You are a coding mentor helping a student solve a problem.

Problem: ${problem.title}
Description: ${problem.description}

Student's current code (${language}):
\`\`\`
${currentCode}
\`\`\`

Look at their code and give a specific hint that:
- Identifies what they are doing right
- Points out one specific issue or improvement
- Suggests a key data structure or algorithm concept to use
- Does NOT give the complete solution
- Is 2-3 sentences maximum

Return ONLY the hint text, nothing else.`
    : `You are a coding mentor helping a student start solving a problem.

Problem: ${problem.title}
Description: ${problem.description}

The student hasn't written any code yet. Give a starting hint that:
- Suggests what kind of data structure or approach to think about
- Gives a conceptual direction without revealing the solution
- Is encouraging and concise — 2 sentences maximum

Return ONLY the hint text, nothing else.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        temperature: 0.5,
      },
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Hint Error:", error);
    throw error;
  }
};
