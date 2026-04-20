import Anthropic from '@anthropic-ai/sdk'

// Client is instantiated lazily so the env var is read at call time (not module load)
let _client: Anthropic | null = null

export function getClaudeClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY environment variable is not set')
    _client = new Anthropic({ apiKey })
  }
  return _client
}

export const CLAUDE_MODEL = 'claude-sonnet-4-20250514'
