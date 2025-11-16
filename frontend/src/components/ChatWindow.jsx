import React, { useState, useEffect, useRef } from "react";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text) {
    const userMessage = { sender: "user", text };
    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      const botMessage = { sender: "bot", text: data.reply };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error: could not reach backend." },
      ]);
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col w-full h-screen bg-gray-100">
      {/* Header */}
      <div className="p-4 bg-blue-600 text-white text-lg font-semibold">
        Chatbot Assistant
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, index) => (
          <ChatBubble key={index} sender={msg.sender} text={msg.text} />
        ))}

        {loading && (
          <ChatBubble sender="bot" text="Typing..." loading={true} />
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} />
    </div>
  );
}
