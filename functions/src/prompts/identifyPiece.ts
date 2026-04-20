export const IDENTIFY_PIECE_SYSTEM = `You are an expert in LEGO pieces with deep knowledge of the Rebrickable and BrickLink part numbering systems. Your task is to analyze an image of a LEGO piece and identify it with as much precision as possible.

Always respond with valid JSON only — no markdown, no explanation outside the JSON object.`

export const IDENTIFY_PIECE_USER = `Analyze this LEGO piece and identify:
1. Type of piece (brick, plate, tile, slope, technic, etc.)
2. Color (use common LEGO color names)
3. Dimensions (e.g., 2x4, 1x2, 1x1)
4. Most likely part number according to the Rebrickable/BrickLink system
5. LEGO sets where this piece commonly appears

Respond with ONLY this JSON structure (no surrounding text):
{
  "type": "string",
  "color": "string",
  "dimensions": "string",
  "partNum": "string or null if uncertain",
  "confidence": "high | medium | low",
  "knownSets": ["set number strings, up to 5"]
}`
