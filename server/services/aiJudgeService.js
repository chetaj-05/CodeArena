import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const judgeAnswers = async ({
  problem,
  player1Answer,
  player2Answer,
  player1Name,
  player2Name,
}) => {
  const prompt = `
You are an expert technical interviewer and judge evaluating two candidates.

Problem: ${problem.title}
Description: ${problem.description}
Evaluation Criteria: ${problem.evaluationCriteria}
Ideal Answer Reference: ${problem.idealAnswer}

Candidate 1 (${player1Name}): 
${player1Answer || "No answer submitted"}

Candidate 2 (${player2Name}):
${player2Answer || "No answer submitted"}

Evaluate both candidates on these 4 criteria (total 100 points):
1. Correctness of approach (0-40 points)
2. Time complexity awareness (0-20 points)
3. Space complexity awareness (0-20 points)
4. Edge cases handled (0-20 points)

Rules:
- If a candidate did not submit an answer give them 0
- Be fair and objective
- Small differences in score (less than 5) should be considered a draw
- Return ONLY this JSON with no extra text:

{
  "player1Score": <number 0-100>,
  "player2Score": <number 0-100>,
  "winner": "<player1 or player2 or draw>",
  "player1Feedback": "<2-3 sentences specific feedback for candidate 1>",
  "player2Feedback": "<2-3 sentences specific feedback for candidate 2>",
  "idealAnswerSummary": "<brief 2-3 sentence ideal answer explanation>",
  "judgeSummary": "<1-2 sentence overall battle summary>"
}
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 1000,
  });

  const text = response.choices[0].message.content;
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
};

export const generateHint = async ({ problem, playerAnswer }) => {
  const prompt = `
You are a helpful coding mentor giving a hint to a student.

Problem: ${problem.title}
Description: ${problem.description}

Student's current thinking:
${playerAnswer || "Student hasn't written anything yet"}

Give a helpful hint that:
- Points them in the right direction WITHOUT giving the answer
- Mentions one key concept they should think about
- Is encouraging and concise (2-3 sentences max)

Return ONLY the hint text, no extra formatting.
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 200,
  });

  return response.choices[0].message.content.trim();
};
