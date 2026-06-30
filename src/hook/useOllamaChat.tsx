import { useState } from 'react'
import { streamChat, type Message } from '../services/ollama'

const MODEL = 'llama3:8b'

export function useOllamaChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)

  async function sendMessage(content: string) {
    if (!content.trim()) return
    if (isStreaming) return

    const userMessage: Message = {
      role: 'user',
      content,
    }

    const assistantMessage: Message = {
      role: 'assistant',
      content: '',
    }

    const history = [...messages, userMessage]

    setMessages(prev => [
      ...prev,
      userMessage,
      assistantMessage,
    ])

    setIsStreaming(true)

    try {
      await streamChat(
        MODEL,
        history,
        (token) => {
          setMessages(prev => {
            const updated = [...prev]
            const lastIndex = updated.length - 1

            if (updated[lastIndex]?.role === 'assistant') {
              updated[lastIndex] = {
                ...updated[lastIndex],
                content: updated[lastIndex].content + token,
              }
            }

            return updated
          })
        }
      )
    } catch (error) {
      console.error(error)

      setMessages(prev => {
        const updated = [...prev]
        const lastIndex = updated.length - 1

        if (updated[lastIndex]?.role === 'assistant') {
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: 'Erreur lors de la génération.',
          }
        }

        return updated
      })
    } finally {
      setIsStreaming(false)
    }
  }

  return {
    messages,
    isStreaming,
    sendMessage,
  }
}