// FloatingTools.jsx - Drifting version

import { useEffect, useState } from "react";

const toolEmojis = [
  "🔨",
  "🪚",
  "🔧",
  "🪛",
  "📏",
  "🪣",
  "🎨",
  "⚙️",
  "🧰",
  "📐",
  "🔩",
  "🪜",
];

function FloatingTools() {
  const [tools, setTools] = useState([]);

  useEffect(() => {
    // Create 15 floating tools
    const newTools = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      emoji: toolEmojis[Math.floor(Math.random() * toolEmojis.length)],
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 24 + Math.random() * 32,
      animationDuration: 20 + Math.random() * 40,
      animationDelay: Math.random() * 20,
      opacity: 0.08 + Math.random() * 0.15,
      rotation: Math.random() * 360,
    }));
    setTools(newTools);
  }, []);

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          overflow: "hidden",
          zIndex: -1,
        }}
      >
        {tools.map((tool) => (
          <div
            key={tool.id}
            style={{
              position: "absolute",
              left: `${tool.left}%`,
              top: `${tool.top}%`,
              fontSize: `${tool.size}px`,
              opacity: tool.opacity,
              transform: `rotate(${tool.rotation}deg)`,
              animation: `drift ${
                tool.animationDuration
              }s linear infinite, spin ${
                tool.animationDuration * 2
              }s linear infinite`,
              animationDelay: `${tool.animationDelay}s`,
            }}
          >
            {tool.emoji}
          </div>
        ))}
      </div>

      <style>
        {`
          @keyframes drift {
            0% {
              transform: translate(0, 0);
            }
            25% {
              transform: translate(50px, -30px);
            }
            50% {
              transform: translate(-20px, -60px);
            }
            75% {
              transform: translate(30px, -20px);
            }
            100% {
              transform: translate(0, 0);
            }
          }
          
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </>
  );
}

export default FloatingTools;
