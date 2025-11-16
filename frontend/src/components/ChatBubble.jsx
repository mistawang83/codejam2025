import React from "react";

export default function ChatBubble({ sender, text, loading }) {
  const isUser = sender === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} w-full`}
    >
      <div
        className={`px-4 py-2 max-w-xs rounded-2xl shadow 
          ${isUser ? "bg-blue-600 text-white" : "bg-white text-gray-800"}`}
      >
        {loading ? (
          <div className="animate-pulse">• • •</div>
        ) : (
          text
        )}
      </div>
    </div>
  );
}
