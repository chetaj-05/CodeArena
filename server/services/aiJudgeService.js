import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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
${problem.evaluationCriteria ? `Evaluation Criteria: ${problem.evaluationCriteria}` : ""}

${player1Name}'s solution (${player1Language}):
\`\`\`
${player1Code}
\`\`\`

${player2Name}'s solution (${player2Language}):
\`\`\`
${player2Code}
\`\`\`

Analyze both solutions and return ONLY this JSON with no extra text:
{
  "player1Feedback": "<2-3 sentences about code quality, time complexity, improvements for ${player1Name}>",
  "player2Feedback": "<2-3 sentences about code quality, time complexity, improvements for ${player2Name}>",
  "idealSolution": "<brief explanation of the optimal approach in 2-3 sentences>",
  "summary": "<1 sentence overall battle summary>"
}
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 800,
  });

  const text = response.choices[0].message.content;
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
};

export const generateHint = async ({ problem, currentCode, language }) => {
  const prompt = `
You are a helpful coding mentor giving a hint to a student.

Problem: ${problem.title}
Description: ${problem.description}

Student's current code (${language}):
\`\`\`
${currentCode || "No code written yet"}
\`\`\`

Give a helpful hint that:
- Points them in the right direction WITHOUT giving the full solution
- Mentions one key concept or data structure to think about
- Is encouraging and concise (2-3 sentences max)

Return ONLY the hint text, no extra formatting.
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 150,
  });

  return response.choices[0].message.content.trim();
};
