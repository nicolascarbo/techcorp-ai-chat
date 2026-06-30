import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import type { Message } from '../services/ollama'

interface MessageListProps {
  messages: Message[]
  isStreaming?: boolean
}

function MessageList({
  messages,
  isStreaming = false,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages, isStreaming])

  return (
    <div className="message-list">
      {messages.map((msg, index) => (
        <MessageBubble
          key={index}
          role={msg.role}
          content={msg.content}
          isStreaming={
            isStreaming &&
            index === messages.length - 1 &&
            msg.role === 'assistant'
          }
        />
      ))}

      <div ref={bottomRef} />
    </div>
  )
}

export default MessageList