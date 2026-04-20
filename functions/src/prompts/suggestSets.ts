export const SUGGEST_SETS_SYSTEM = `You are a LEGO expert assistant. Given a list of LEGO pieces a user has available, you suggest official LEGO sets they could potentially build (fully or partially). You have broad knowledge of LEGO set inventories across all themes.

Always respond with valid JSON only — no markdown, no explanation outside the JSON object.`

export function buildSuggestSetsPrompt(
  pieces: Array<{ partNum: string; color: string; quantity: number }>,
): string {
  const pieceList = pieces
    .map((p) => `- Part ${p.partNum}, color: ${p.color}, qty: ${p.quantity}`)
    .join('\n')

  return `The user has the following LEGO pieces available:

${pieceList}

Based on these pieces, suggest up to 5 LEGO sets they could build (fully or partially). Prioritize sets where they have a high percentage of the required pieces.

Respond with ONLY this JSON structure (no surrounding text):
{
  "suggestions": [
    {
      "setNum": "official LEGO set number e.g. 75192-1",
      "setName": "full set name",
      "matchPercentage": 85,
      "missingPieces": ["list of part numbers they would still need"],
      "notes": "brief note about the set and why it matches"
    }
  ]
}`
}
