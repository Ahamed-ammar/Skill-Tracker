/**
 * Compute a cosine-similarity-based match score between resume skills and job skills.
 *
 * NOTE: The Python backend uses a sentence-transformer ML model for semantic embeddings.
 * In Node.js we use a lightweight TF-IDF/cosine approach that gives a solid approximation
 * without requiring a native ML runtime. If you need ML-grade accuracy, deploy the
 * Python service and proxy to it, or use the @xenova/transformers package (WASM).
 *
 * Returns a percentage 0–100 rounded to 1 decimal place.
 */
export function computeMatchScore(resumeSkills, jobSkills) {
  if (!resumeSkills.length || !jobSkills.length) {
    console.warn("[matchingEngine] empty skill list — returning 0");
    return 0.0;
  }

  // Build a vocabulary from both skill sets (lowercased tokens)
  const tokenize = (skills) =>
    skills.flatMap((s) => s.toLowerCase().split(/[\s,_\-/]+/));

  const resumeTokens = tokenize(resumeSkills);
  const jobTokens = tokenize(jobSkills);

  const vocab = new Set([...resumeTokens, ...jobTokens]);

  // Create term-frequency vectors
  const tf = (tokens) => {
    const freq = {};
    for (const t of tokens) freq[t] = (freq[t] || 0) + 1;
    return freq;
  };

  const resumeFreq = tf(resumeTokens);
  const jobFreq = tf(jobTokens);

  // Cosine similarity
  let dot = 0;
  let normResume = 0;
  let normJob = 0;

  for (const term of vocab) {
    const r = resumeFreq[term] || 0;
    const j = jobFreq[term] || 0;
    dot += r * j;
    normResume += r * r;
    normJob += j * j;
  }

  if (normResume === 0 || normJob === 0) return 0.0;

  const score = dot / (Math.sqrt(normResume) * Math.sqrt(normJob));
  const pct = Math.round(Math.max(0, Math.min(score * 100, 100)) * 10) / 10;
  console.log(`[matchingEngine] match score = ${pct}%`);
  return pct;
}
