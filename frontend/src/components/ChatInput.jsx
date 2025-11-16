import React, { useState } from "react";

export default function ChatInput({ onSend }) {
  const [text, setText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex p-3 bg-white border-t gap-2"
    >
      <input
        className="flex-1 border rounded-xl px-3 py-2"
        placeholder="Type your message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-xl"
      >
        Send
      </button>
    </form>
  );
}
