import Logo from "../assets/logo.png"

function TypingIndicator() {
  return (
    <div className="message-row message-row--ai">
      <span className="message-label">AI</span>
      <div className="message-bubble message-bubble--ai typing-indicator">
        <span className="sparkle"><img src={Logo} className="w-4"/></span>
      </div>
    </div>
  )
}

export default TypingIndicator