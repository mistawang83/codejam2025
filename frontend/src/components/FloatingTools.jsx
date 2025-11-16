import { useEffect, useState } from "react";

const toolTypes = [
  { emoji: "🔨", name: "hammer" },
  { emoji: "🪚", name: "saw" },
  { emoji: "🔧", name: "wrench" },
  { emoji: "🪛", name: "screwdriver" },
  { emoji: "📏", name: "ruler" },
  { emoji: "🪣", name: "bucket" },
  { emoji: "🎨", name: "paint" },
  { emoji: "⚙️", name: "gear" },
  { emoji: "🧰", name: "toolbox" },
  { emoji: "📐", name: "square" },
  { emoji: "🔩", name: "bolt" },
  { emoji: "🪜", name: "ladder" },
];

let toolIdCounter = 0;

function FloatingTools() {
  const [floatingTools, setFloatingTools] = useState([]);
  const [score, setScore] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupImage, setPopupImage] = useState("");
  const MIN_TOOLS = 30;

  const createTool = () => {
    const tool = toolTypes[Math.floor(Math.random() * toolTypes.length)];
    toolIdCounter++;
    return {
      ...tool,
      id: toolIdCounter,
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
      size: 40 + Math.random() * 40,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 5,
      opacity: 0.3 + Math.random() * 0.4,
      clicked: false,
      fading: false,
      createdAt: Date.now(),
      lifetime: 8000 + Math.random() * 12000,
      flyDirection: {
        x: (Math.random() - 0.5) * 500,
        y: (Math.random() - 0.5) * 500,
      },
    };
  };

  const initializeTools = () => {
    const initialTools = [];
    for (let i = 0; i < MIN_TOOLS; i++) {
      const tool = createTool();
      tool.createdAt = Date.now() - Math.random() * 10000;
      initialTools.push(tool);
    }
    setFloatingTools(initialTools);
  };

  const handleReset = () => {
    setScore(0);
    initializeTools();
  };

  useEffect(() => {
    initializeTools();
  }, []);

  // Auto-fade old tools
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setFloatingTools((prev) =>
        prev.map((tool) => {
          const age = now - tool.createdAt;
          if (age > tool.lifetime - 2000 && !tool.fading && !tool.clicked) {
            return { ...tool, fading: true };
          }
          return tool;
        })
      );
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Remove fully faded tools
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setFloatingTools((prev) =>
        prev.filter((tool) => {
          const age = now - tool.createdAt;
          return age < tool.lifetime && !tool.clicked;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Check for score 7 ONLY
  useEffect(() => {
    if (score === 7) {
      setPopupImage("/bosnov-67.gif");
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    }
  }, [score]);

  useEffect(() => {
    const activeTools = floatingTools.filter(
      (t) => !t.clicked && !t.fading
    ).length;

    if (activeTools < MIN_TOOLS) {
      const toolsToAdd = MIN_TOOLS - activeTools;
      const newTools = [];

      for (let i = 0; i < toolsToAdd; i++) {
        newTools.push(createTool());
      }

      setFloatingTools((prev) => [
        ...prev.filter((t) => !t.clicked),
        ...newTools,
      ]);
    }
  }, [floatingTools]);

  const handleToolClick = (id) => {
    setScore((prev) => prev + 1);

    setFloatingTools((prev) =>
      prev.map((tool) => (tool.id === id ? { ...tool, clicked: true } : tool))
    );

    setTimeout(() => {
      setFloatingTools((prev) => prev.filter((tool) => tool.id !== id));
    }, 800);
  };

  return (
    <>
      {/* Popup Image/GIF */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: "80px", // Below the scoreboard (scoreboard is at top: 20px)
            left: "20px", // Same left position as scoreboard
            zIndex: 2000,
            animation: "popupFade 3s ease-out forwards",
            pointerEvents: "none",
          }}
        >
          {popupImage.includes("/") || popupImage.includes(".") ? (
            <img
              src={popupImage}
              alt="popup"
              style={{
                maxWidth: "300px",
                maxHeight: "300px",
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}
            />
          ) : (
            <span style={{ fontSize: "150px" }}>{popupImage}</span>
          )}
        </div>
      )}
      {/* Scoreboard */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          left: "20px",
          backgroundColor: "rgba(102, 126, 234, 0.9)",
          color: "white",
          padding: "12px 20px",
          borderRadius: "12px",
          fontSize: "18px",
          fontWeight: "600",
          zIndex: 1000,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          display: "flex",
          alignItems: "center",
          gap: "15px",
        }}
      >
        <span>🎯 Tools Clicked: {score}</span>
        <button
          onClick={handleReset}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            border: "none",
            color: "white",
            padding: "6px 12px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            transition: "background-color 0.3s",
          }}
          onMouseEnter={(e) =>
            (e.target.style.backgroundColor = "rgba(255, 255, 255, 0.3)")
          }
          onMouseLeave={(e) =>
            (e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)")
          }
        >
          🔄 Reset
        </button>
      </div>

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        {floatingTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => handleToolClick(tool.id)}
            style={{
              position: "absolute",
              left: `${tool.x}%`,
              top: `${tool.y}%`,
              fontSize: `${tool.size}px`,
              opacity: tool.clicked ? 0 : tool.fading ? 0 : tool.opacity,
              animation: tool.clicked
                ? "none"
                : tool.fading
                ? "fadeOut 2s ease-out forwards"
                : `float ${tool.duration}s ease-in-out infinite, wobble ${
                    tool.duration * 0.8
                  }s ease-in-out infinite`,
              animationDelay:
                tool.clicked || tool.fading ? "0s" : `${tool.delay}s`,
              filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))",
              pointerEvents: tool.fading ? "none" : "auto",
              cursor: "pointer",
              transition: tool.clicked
                ? "transform 0.8s ease-out, opacity 0.8s ease-out"
                : "none",
              transform: tool.clicked
                ? `translate(${tool.flyDirection.x}px, ${tool.flyDirection.y}px) rotate(720deg) scale(0.3)`
                : "none",
            }}
          >
            {tool.emoji}
          </div>
        ))}

        <style>
          {`
            
            @keyframes float {
              0%, 100% {
                transform: translate(0px, 0px);
              }
              20% {
                transform: translate(80px, -60px);
              }
              40% {
                transform: translate(-40px, -100px);
              }
              60% {
                transform: translate(60px, -30px);
              }
              80% {
                transform: translate(-30px, -80px);
              }
            }
            
            @keyframes wobble {
              0%, 100% {
                transform: rotate(0deg);
              }
              25% {
                transform: rotate(15deg);
              }
              50% {
                transform: rotate(-10deg);
              }
              75% {
                transform: rotate(20deg);
              }
            }
            
            @keyframes fadeOut {
              0% {
                opacity: inherit;
                transform: scale(1);
              }
              100% {
                opacity: 0;
                transform: scale(0.5);
              }
            }
            @keyframes popupFade {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  10% {
    opacity: 1;
    transform: scale(1);
  }
  80% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1);
  }
}
    }
          `}
        </style>
      </div>
    </>
  );
}

export default FloatingTools;
