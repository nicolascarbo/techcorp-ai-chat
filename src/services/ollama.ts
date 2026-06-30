export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface OllamaModel {
  name: string
  modified_at: string
  size: number
}

const BASE_URL = '/ollama'

export async function listModels(): Promise<OllamaModel[]> {
  const res = await fetch(`${BASE_URL}/api/tags`)
  if (!res.ok) throw new Error(`Failed to list models: ${res.statusText}`)
  const data = await res.json()
  return data.models ?? []
}

export async function streamChat(
  model: string,
  messages: Message[],
  onChunk: (token: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: true }),
    signal,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Ollama error ${res.status}: ${err}`)
  }

  const reader = res.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.trim()) continue
      try {
        const json = JSON.parse(line)
        if (json.message?.content) onChunk(json.message.content)
      } catch {
        // ignore malformed lines
      }
    }
  }
}
