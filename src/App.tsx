import './App.css'
import ChatBackground from './components/ChatBackground'
import ChatHeader from './components/ChatHeader'
import MessageList from './components/MessageList'
import ChatInput from './components/ChatInput'
import { useOllamaChat } from './useOllamaChat'

function App() {
  const { messages, isStreaming, sendMessage } = useOllamaChat()
  const hasStarted = messages.length > 0

  return (
    <div className="app">
      <ChatBackground />
      {!hasStarted && <ChatHeader />}
      <MessageList messages={messages} isStreaming={isStreaming} />
      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  )
}

export default App