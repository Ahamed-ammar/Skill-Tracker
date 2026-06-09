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
 * Generate a 7-day learning roadmap for missing skills.
 * Returns array of { days, skill, tasks, status }
 */
export async function generateRoadmap(missingSkills) {
  if (!missingSkills || missingSkills.length === 0) {
    console.log("[mentorAgent] no missing skills — returning empty roadmap");
    return [];
  }

  const skillsToCover = missingSkills.slice(0, 5);
  console.log("[mentorAgent] building plan for", skillsToCover);

  const prompt = `Create a 7-day learning roadmap for a job seeker who needs to learn: ${JSON.stringify(skillsToCover)}

Return ONLY valid JSON - no extra text:
{
  "roadmap": [
    {
      "days": "Days 1-2",
      "skill": "Skill Name",
      "tasks": ["Specific task 1", "Specific task 2", "Specific task 3"],
      "status": "in-progress"
    }
  ]
}

Rules:
- Cover all skills across the 7 days, grouping related ones if needed
- First entry status = "in-progress", last entry status = "locked", rest = "upcoming"
- 3-4 tasks per entry, specific and actionable
- Use day ranges like "Days 1-2", "Days 3-4", "Day 7"
- Return between 3 and 5 entries total`;

  const response = await getClient().chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const raw = response.choices[0].message.content;
  console.log("[mentorAgent] raw response =", raw.slice(0, 300));

  const data = JSON.parse(raw);
  const roadmap = data.roadmap || [];

  if (roadmap.length > 0) {
    roadmap[0].status = "in-progress";
    roadmap[roadmap.length - 1].status = "locked";
    for (let i = 1; i < roadmap.length - 1; i++) {
      roadmap[i].status = "upcoming";
    }
  }

  console.log(`[mentorAgent] ${roadmap.length} entries generated`);
  return roadmap;
}
