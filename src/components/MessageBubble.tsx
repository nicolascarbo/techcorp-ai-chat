interface MessageBubbleProps {
  role: 'user' | 'ai'
  content: string
  isStreaming?: boolean
}

function MessageBubble({ role, content, isStreaming = false }: MessageBubbleProps) {
  const isUser = role === 'user'

  return (
    <div className={`message-row ${isUser ? 'message-row--user' : 'message-row--ai'}`}>
      <span className="message-label">{isUser ? 'ME' : 'OUR AI'}</span>
      <div className={`message-bubble ${isUser ? 'message-bubble--user' : 'message-bubble--ai'}`}>
        {content}
        {isStreaming && <span className="cursor-blink" />}
      </div>
    </div>
  )
}

export default MessageBubble