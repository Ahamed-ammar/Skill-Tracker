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
 * Classify missing skills as Critical or Secondary using Groq.
 * Returns array of { skill: string, level: "Critical"|"Secondary" }
 */
export async function findSkillGaps(resumeSkills, jobSkills) {
  const resumeLower = new Set(resumeSkills.map((s) => s.toLowerCase()));
  const missing = jobSkills.filter((s) => !resumeLower.has(s.toLowerCase()));

  console.log(`[gapAnalyzer] ${missing.length} missing skills:`, missing);

  if (missing.length === 0) return [];

  const prompt = `Classify each missing skill as "Critical" or "Secondary" for a job seeker.
Critical = core requirement; Secondary = nice-to-have or supporting skill.
Return ONLY valid JSON — no extra text:
{
  "gaps": [
    {"skill": "Docker", "level": "Critical"},
    {"skill": "GraphQL", "level": "Secondary"}
  ]
}

Missing skills: ${JSON.stringify(missing)}`;

  const response = await getClient().chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const raw = response.choices[0].message.content;
  console.log("[gapAnalyzer] raw response =", raw.slice(0, 200));

  const data = JSON.parse(raw);
  let gaps = data.gaps || [];

  if (gaps.length === 0) {
    gaps = missing.map((s) => ({ skill: s, level: "Secondary" }));
  }

  console.log(`[gapAnalyzer] classified ${gaps.length} gaps`);
  return gaps;
}
