
import Groq from "groq-sdk";
import { z } from "zod";
import AppError from "../utils/AppError.js";

// Expected structure used by the APEX frontend.
const analysisSchema = z.object({
  currentPosition: z.string(),
  difficulties: z.array(z.string()),
  weakAreas: z.array(z.string()),
  priorities: z.array(z.string()),
  missingInformation: z.array(z.string()),
}).strict();

let groqClient;

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new AppError(
      "Groq API key is not configured.",
      503,
      "AI_NOT_CONFIGURED"
    );
  }

  if (!groqClient) {
    groqClient = new Groq({
      apiKey,
      timeout: 30000,
      maxRetries: 2,
    });
  }

  return groqClient;
}

function buildPrompt(data) {
  return `
Analyze the following JUPEB student's academic progress.

Student information:
${JSON.stringify(data)}

Your task:
1. Explain the student's current academic position.
2. Identify difficulties supported by the data.
3. Identify weak academic areas.
4. Recommend the most important academic priorities.
5. Identify information missing from the student's profile.

IMPORTANT RESPONSE RULES:

Return ONLY one JSON object with EXACTLY these fields:

{
  "currentPosition": "string",
  "difficulties": ["string"],
  "weakAreas": ["string"],
  "priorities": ["string"],
  "missingInformation": ["string"]
}

All five fields are required.

Rules:
- currentPosition must be a string.
- difficulties must be an array of strings.
- weakAreas must be an array of strings.
- priorities must be an array of strings.
- missingInformation must be an array of strings.
- Use [] when a list has no findings.
- Never rename or omit a field.
- Do not include additional fields.
- Do not wrap the JSON inside another object.
- Do not invent student data.
- Keep recommendations practical and relevant to JUPEB.
`;
}

function logInvalidResponse(parsed, issues) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.error("Groq response validation failed", {
    keys:
      parsed && typeof parsed === "object"
        ? Object.keys(parsed)
        : [],
    issues: issues.map((issue) => ({
      path: issue.path.join("."),
      code: issue.code,
      expected: issue.expected,
    })),
  });
}

export const analyzeAcademicProfile = async (data) => {
  const groq = getGroqClient();

  let completion;

  try {
    completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",

      messages: [
        {
          role: "system",
          content: `
You are APEX, an academic analysis assistant
for JUPEB students studying their selected subjects.

You must return valid JSON only.

The response must contain:
currentPosition,
difficulties,
weakAreas,
priorities,
missingInformation.

currentPosition is a string.
All other fields are arrays of strings.

Do not include extra properties.
Do not invent facts.
`,
        },
        {
          role: "user",
          content: buildPrompt(data),
        },
      ],

      temperature: 0.2,
      max_completion_tokens: 2500,

      response_format: {
        type: "json_object",
      },

      include_reasoning: false,
    });
  } catch (error) {
    console.error("Groq API request failed", {
      status: error.status,

    });

    if (error.status === 429) {
      throw new AppError(
        "AI usage limit reached. Please try again later.",
        503,
        "AI_RATE_LIMITED"
      );
    }

    if (error.status === 401 || error.status === 403) {
      throw new AppError(
        "AI provider authentication failed.",
        502,
        "AI_AUTH_FAILED"
      );
    }

    throw new AppError(
      "Academic analysis provider temporarily unavailable.",
      502,
      "AI_PROVIDER_UNAVAILABLE"
    );
  }

  const choice = completion.choices?.[0];
  const content = choice?.message?.content;

  if (!content || choice.finish_reason === "length") {
    throw new AppError(
      "AI returned an empty or incomplete response.",
      502,
      "AI_INVALID_RESPONSE"
    );
  }

  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new AppError(
      "AI returned invalid JSON.",
      502,
      "AI_INVALID_RESPONSE"
    );
  }

  const result = analysisSchema.safeParse(parsed);

  if (!result.success) {
    logInvalidResponse(parsed, result.error.issues);

    throw new AppError(
      "AI response does not match the required structure.",
      502,
      "AI_INVALID_RESPONSE"
    );
  }

  return result.data;
};
