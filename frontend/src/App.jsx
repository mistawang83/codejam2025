import { useEffect, useState, useRef } from "react";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  // Fetch messages on load
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/messages/")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setMessages(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, newMessage]);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/messages/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
      });
      const data = await response.json();

      // Optionally, add bot reply (simulate)
      const botMessage = { text: "Echo: " + data.text, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Error sending message:", err);
    }

    setInput("");
  };

  if (loading) return <div>Loading chat...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        border: "1px solid #ccc",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        height: "500px",
      }}
    >
      <div
        style={{
          flex: 1,
          padding: "10px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              backgroundColor: msg.sender === "user" ? "#4f46e5" : "#e5e7eb",
              color: msg.sender === "user" ? "white" : "black",
              padding: "8px 12px",
              borderRadius: "16px",
              margin: "4px 0",
              maxWidth: "70%",
              wordWrap: "break-word",
            }}
          >
            {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        style={{
          display: "flex",
          borderTop: "1px solid #ccc",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: "10px", border: "none", outline: "none" }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 15px",
            backgroundColor: "#4f46e5",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default App;
