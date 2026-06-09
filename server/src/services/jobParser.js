import Groq from "groq-sdk";

let _client = null;

function getClient() {
  if (!_client) {
    const key = process.env.GROQ_API_KEY || "";
    if (!key) throw new Error("GROQ_API_KEY is not set in .env");
    _client = new Groq({ apiKey: key });
  }
  return _client;
}

/**
 * Parse a job description and extract required skills.
 * Returns { required_skills: string[], nice_to_have: string[], job_title: string }
 */
export async function extractJobSkills(jobText) {
  console.log(`[jobParser] sending ${jobText.length} chars to Groq`);

  const prompt = `You are a job description parser. Extract skills from the job posting below.
Return ONLY valid JSON with this exact shape — no extra text:
{
  "required_skills": ["Python", "AWS"],
  "nice_to_have": ["Kubernetes"],
  "job_title": "Backend Engineer"
}

Job description (first 3000 chars):
${jobText.slice(0, 3000)}`;

  const response = await getClient().chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const raw = response.choices[0].message.content;
  console.log("[jobParser] raw response =", raw.slice(0, 200));

  const data = JSON.parse(raw);
  return {
    required_skills: data.required_skills || [],
    nice_to_have: data.nice_to_have || [],
    job_title: data.job_title || "",
  };
}
