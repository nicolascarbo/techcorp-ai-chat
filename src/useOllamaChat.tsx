import { useState, useCallback } from 'react'

export interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
}

export function useOllamaChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)

  const sendMessage = useCallback((content: string) => {
    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content }
    setMessages((prev) => [...prev, userMessage])

    // TODO: remplacer par l'appel réel à Ollama une fois l'API prête
    setIsStreaming(true)
    setTimeout(() => {
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: 'ai',
        content: 'Réponse simulée en attendant la connexion au serveur Ollama.',
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsStreaming(false)
    }, 1200)
  }, [])

  return { messages, isStreaming, sendMessage }
}