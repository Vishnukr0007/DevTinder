/**
 * Skill Overlap & Complementary Match Score Algorithm
 */
export const calculateMatchScore = (userSkillsA = [], userSkillsB = []) => {
  if (!userSkillsA.length || !userSkillsB.length) return 50; // Base score

  const setA = new Set(userSkillsA.map((s) => s.name.toLowerCase()));
  const setB = new Set(userSkillsB.map((s) => s.name.toLowerCase()));

  let overlapCount = 0;
  setA.forEach((skill) => {
    if (setB.has(skill)) overlapCount++;
  });

  const totalUnique = new Set([...setA, ...setB]).size;
  const jaccardScore = (overlapCount / totalUnique) * 100;

  // Hybrid score: balance shared foundation with complementary skills
  return Math.min(99, Math.round(50 + jaccardScore * 0.5));
};
