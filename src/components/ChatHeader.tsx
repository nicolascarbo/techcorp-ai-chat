import Logo from "../assets/logo.png"

function ChatHeader() {
  return (
    <div className="flex flex-col items-center justify-center gap-10 p-4 mt-40">
      <img src={Logo} alt="Logo" className="w-10 h-11" />
      <p className="text-xl font-light">TechCorp AI Chat</p>
    </div>
  )
}

export default ChatHeader
