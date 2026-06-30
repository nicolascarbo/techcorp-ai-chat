import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'

export interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
}

interface MessageListProps {
  messages: Message[]
  isStreaming?: boolean
}

function MessageList({ messages, isStreaming = false }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  return (
    <div className="message-list">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
      ))}

      {isStreaming && <TypingIndicator />}

      <div ref={bottomRef} />
    </div>
  )
}

export default MessageList