import Groq from "groq-sdk";

let _client = null;

function getClient() {
  if (!_client) {
    const key = process.env.GROQ_API_KEY || "";
    if (!key) throw new Error("GROQ_API_KEY is not set in .env");
    _client = new Groq({ apiKey: key });
    console.log("[skillExtractor] Groq client initialised");
  }
  return _client;
}

/**
 * Extract technical skills from resume text.
 * Returns { skills: string[], tools: string[], experience_years: number }
 */
export async function extractResumeSkills(resumeText) {
  console.log(`[skillExtractor] sending ${resumeText.length} chars to Groq`);

  const prompt = `You are a resume parser. Extract technical skills from the resume below.
Return ONLY valid JSON with this exact shape — no extra text:
{
  "skills": ["Python", "SQL"],
  "tools": ["Docker", "Git"],
  "experience_years": 3
}

Resume (first 3000 chars):
${resumeText.slice(0, 3000)}`;

  const response = await getClient().chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const raw = response.choices[0].message.content;
  console.log("[skillExtractor] raw response =", raw.slice(0, 200));

  const data = JSON.parse(raw);
  return {
    skills: data.skills || [],
    tools: data.tools || [],
    experience_years: data.experience_years || 0,
  };
}
