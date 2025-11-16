import { useState, useRef, useEffect } from "react";
import FloatingTools from "./components/FloatingTools";
import Login from "./Login";

function App() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogin = (username) => {
    setUser(username);
    localStorage.setItem("user", username);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setMessages([]);
    setCheckedItems({});
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const handleFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const toggleCheckItem = (messageIdx, itemKey) => {
    const key = `${messageIdx}-${itemKey}`;
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !image) {
      alert("Please upload an image and describe your problem");
      return;
    }

    const userMessage = {
      text: input,
      sender: "user",
      image: imagePreview,
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("description", input);

      const response = await fetch(
        "http://127.0.0.1:8000/api/analyze-image-upload/",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const botResponse = {
        text: data.human_text || "Analysis complete!",
        sender: "bot",
        analysis: data.analysis,
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (err) {
      console.error("Error:", err);
      const errorMessage = {
        text: `Error: ${err.message}. Make sure the backend is running.`,
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setInput("");
    setImage(null);
    setImagePreview(null);
    setLoading(false);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  return (
    <>
      <FloatingTools />

      <div
        style={{
          maxWidth: "1200px",
          margin: "30px auto",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          height: "900px",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#ffffff",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            borderRadius: "16px 16px 0 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "24px" }}>
              🔧 Home Repair Assistant
            </h2>
            <p style={{ margin: "5px 0 0 0", opacity: 0.9, fontSize: "14px" }}>
              Welcome, {user}!
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "white",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Logout
          </button>
        </div>

        {/* Messages Area */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#f9fafb",
          }}
        >
          {messages.length === 0 && (
            <div
              style={{
                textAlign: "center",
                color: "#6b7280",
                marginTop: "40px",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>🏠</div>
              <p style={{ fontSize: "16px", marginBottom: "10px" }}>
                Welcome! I'm your AI repair assistant.
              </p>
              <p style={{ fontSize: "14px", color: "#9ca3af" }}>
                Drop an image below and tell me what needs fixing.
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                margin: "10px 0",
              }}
            >
              {msg.image && (
                <img
                  src={msg.image}
                  alt="Uploaded"
                  style={{
                    maxWidth: "250px",
                    borderRadius: "12px",
                    marginBottom: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                />
              )}
              <div
                style={{
                  backgroundColor:
                    msg.sender === "user" ? "#667eea" : "#ffffff",
                  color: msg.sender === "user" ? "white" : "#1f2937",
                  padding: "14px 18px",
                  borderRadius:
                    msg.sender === "user"
                      ? "18px 18px 4px 18px"
                      : "18px 18px 18px 4px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.5",
                }}
              >
                {msg.text}
              </div>

              {/* Cost Comparison Chart */}
              {msg.sender === "bot" && msg.analysis && (
                <div
                  style={{
                    backgroundColor: "#f0f9ff",
                    border: "1px solid #bae6fd",
                    borderRadius: "12px",
                    padding: "16px",
                    marginTop: "12px",
                  }}
                >
                  <h4 style={{ margin: "0 0 12px 0", color: "#0369a1" }}>
                    💰 Cost Comparison
                  </h4>

                  <div
                    style={{
                      display: "flex",
                      gap: "20px",
                      marginBottom: "15px",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        backgroundColor: "#ecfdf5",
                        border: "2px solid #10b981",
                        borderRadius: "10px",
                        padding: "15px",
                        textAlign: "center",
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 5px 0",
                          fontWeight: "600",
                          color: "#065f46",
                        }}
                      >
                        🛠️ DIY
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "24px",
                          fontWeight: "bold",
                          color: "#10b981",
                        }}
                      >
                        ${msg.analysis.cost?.diy_materials_cost_estimate || 0}
                      </p>
                      <p
                        style={{
                          margin: "5px 0 0 0",
                          fontSize: "12px",
                          color: "#6b7280",
                        }}
                      >
                        Materials only
                      </p>
                    </div>

                    <div
                      style={{
                        flex: 1,
                        backgroundColor: "#fef2f2",
                        border: "2px solid #f87171",
                        borderRadius: "10px",
                        padding: "15px",
                        textAlign: "center",
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 5px 0",
                          fontWeight: "600",
                          color: "#991b1b",
                        }}
                      >
                        👷 Professional
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "24px",
                          fontWeight: "bold",
                          color: "#ef4444",
                        }}
                      >
                        ${msg.analysis.cost?.pro_total_cost_estimate || 0}
                      </p>
                      <p
                        style={{
                          margin: "5px 0 0 0",
                          fontSize: "12px",
                          color: "#6b7280",
                        }}
                      >
                        Labor + materials
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#10b981",
                      color: "white",
                      padding: "10px",
                      borderRadius: "8px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    ✅ Save $
                    {(
                      (msg.analysis.cost?.pro_total_cost_estimate || 0) -
                      (msg.analysis.cost?.diy_materials_cost_estimate || 0)
                    ).toFixed(2)}{" "}
                    by doing it yourself!
                  </div>

                  <div
                    style={{
                      marginTop: "12px",
                      fontSize: "14px",
                      color: "#4b5563",
                    }}
                  >
                    ⏱️ Estimated time:{" "}
                    <strong>
                      {msg.analysis.timeEstimate?.total_calendar_time_hours ||
                        "N/A"}{" "}
                      hours
                    </strong>
                  </div>

                  <div style={{ marginTop: "8px" }}>
                    <span
                      style={{
                        backgroundColor:
                          msg.analysis.difficulty === "Beginner"
                            ? "#10b981"
                            : msg.analysis.difficulty === "Intermediate"
                            ? "#f59e0b"
                            : "#ef4444",
                        color: "white",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "500",
                      }}
                    >
                      {msg.analysis.difficulty || "Unknown"} Difficulty
                    </span>
                  </div>
                </div>
              )}

              {/* Shopping List with Checkboxes */}
              {msg.sender === "bot" &&
                msg.analysis &&
                (msg.analysis.materials || msg.analysis.tools) && (
                  <div
                    style={{
                      backgroundColor: "#f0fdf4",
                      border: "1px solid #86efac",
                      borderRadius: "12px",
                      padding: "16px",
                      marginTop: "12px",
                    }}
                  >
                    <h4 style={{ margin: "0 0 12px 0", color: "#166534" }}>
                      🛒 Shopping List
                    </h4>

                    <div
                      style={{
                        marginBottom: "12px",
                        fontSize: "14px",
                        color: "#6b7280",
                      }}
                    >
                      Check off items as you buy them
                    </div>

                    {/* Materials Section */}
                    {msg.analysis.materials &&
                      msg.analysis.materials.length > 0 && (
                        <>
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#166534",
                              marginBottom: "8px",
                              textTransform: "uppercase",
                            }}
                          >
                            📦 Materials
                          </div>
                          {msg.analysis.materials.map((item, index) => (
                            <div
                              key={`material-${index}`}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "10px",
                                backgroundColor: checkedItems[
                                  `${idx}-material-${index}`
                                ]
                                  ? "#d1fae5"
                                  : "white",
                                borderRadius: "8px",
                                marginBottom: "8px",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                transition: "background-color 0.3s",
                              }}
                            >
                              <input
                                type="checkbox"
                                id={`material-${idx}-${index}`}
                                checked={
                                  checkedItems[`${idx}-material-${index}`] ||
                                  false
                                }
                                onChange={() =>
                                  toggleCheckItem(idx, `material-${index}`)
                                }
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  marginRight: "12px",
                                  cursor: "pointer",
                                }}
                              />
                              <label
                                htmlFor={`material-${idx}-${index}`}
                                style={{
                                  flex: 1,
                                  cursor: "pointer",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  textDecoration: checkedItems[
                                    `${idx}-material-${index}`
                                  ]
                                    ? "line-through"
                                    : "none",
                                  color: checkedItems[
                                    `${idx}-material-${index}`
                                  ]
                                    ? "#9ca3af"
                                    : "#1f2937",
                                }}
                              >
                                <span>
                                  <strong>{item.name}</strong>
                                  <span
                                    style={{
                                      color: "#6b7280",
                                      marginLeft: "8px",
                                    }}
                                  >
                                    {item.quantity} {item.unit}
                                  </span>
                                </span>
                                <span
                                  style={{
                                    fontWeight: "600",
                                    color: "#059669",
                                  }}
                                >
                                  $
                                  {(
                                    item.estimated_unit_cost * item.quantity
                                  ).toFixed(2)}
                                </span>
                              </label>
                            </div>
                          ))}
                        </>
                      )}

                    {/* Tools Section */}
                    {msg.analysis.tools && msg.analysis.tools.length > 0 && (
                      <>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            color: "#166534",
                            marginBottom: "8px",
                            marginTop: "16px",
                            textTransform: "uppercase",
                          }}
                        >
                          🔧 Tools
                        </div>
                        {msg.analysis.tools.map((tool, index) => (
                          <div
                            key={`tool-${index}`}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "10px",
                              backgroundColor: checkedItems[
                                `${idx}-tool-${index}`
                              ]
                                ? "#d1fae5"
                                : "white",
                              borderRadius: "8px",
                              marginBottom: "8px",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                              transition: "background-color 0.3s",
                            }}
                          >
                            <input
                              type="checkbox"
                              id={`tool-${idx}-${index}`}
                              checked={
                                checkedItems[`${idx}-tool-${index}`] || false
                              }
                              onChange={() =>
                                toggleCheckItem(idx, `tool-${index}`)
                              }
                              style={{
                                width: "20px",
                                height: "20px",
                                marginRight: "12px",
                                cursor: "pointer",
                              }}
                            />
                            <label
                              htmlFor={`tool-${idx}-${index}`}
                              style={{
                                flex: 1,
                                cursor: "pointer",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                textDecoration: checkedItems[
                                  `${idx}-tool-${index}`
                                ]
                                  ? "line-through"
                                  : "none",
                                color: checkedItems[`${idx}-tool-${index}`]
                                  ? "#9ca3af"
                                  : "#1f2937",
                              }}
                            >
                              <span>
                                <strong>{tool.name}</strong>
                                {!tool.required && (
                                  <span
                                    style={{
                                      color: "#f59e0b",
                                      marginLeft: "8px",
                                      fontSize: "12px",
                                    }}
                                  >
                                    (Optional)
                                  </span>
                                )}
                              </span>
                              <span
                                style={{ fontWeight: "600", color: "#059669" }}
                              >
                                ${(tool.estimated_cost || 0).toFixed(2)}
                              </span>
                            </label>
                          </div>
                        ))}
                      </>
                    )}

                    {/* Progress and Cost Summary */}
                    <div
                      style={{
                        borderTop: "2px solid #86efac",
                        paddingTop: "12px",
                        marginTop: "12px",
                      }}
                    >
                      {/* Progress Bar */}
                      <div style={{ marginBottom: "12px" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "6px",
                            fontSize: "14px",
                            fontWeight: "600",
                          }}
                        >
                          <span>Items Purchased:</span>
                          <span style={{ color: "#059669" }}>
                            {
                              [
                                ...(msg.analysis.materials || []).map(
                                  (_, index) =>
                                    checkedItems[`${idx}-material-${index}`]
                                ),
                                ...(msg.analysis.tools || []).map(
                                  (_, index) =>
                                    checkedItems[`${idx}-tool-${index}`]
                                ),
                              ].filter(Boolean).length
                            }{" "}
                            /{" "}
                            {(msg.analysis.materials?.length || 0) +
                              (msg.analysis.tools?.length || 0)}
                          </span>
                        </div>
                        <div
                          style={{
                            width: "100%",
                            height: "8px",
                            backgroundColor: "#d1d5db",
                            borderRadius: "4px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${
                                ([
                                  ...(msg.analysis.materials || []).map(
                                    (_, index) =>
                                      checkedItems[`${idx}-material-${index}`]
                                  ),
                                  ...(msg.analysis.tools || []).map(
                                    (_, index) =>
                                      checkedItems[`${idx}-tool-${index}`]
                                  ),
                                ].filter(Boolean).length /
                                  ((msg.analysis.materials?.length || 0) +
                                    (msg.analysis.tools?.length || 0))) *
                                100
                              }%`,
                              height: "100%",
                              backgroundColor: "#10b981",
                              transition: "width 0.3s ease",
                            }}
                          />
                        </div>
                      </div>

                      {/* Amount Spent */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "14px",
                          marginBottom: "8px",
                        }}
                      >
                        <span>💵 Amount Spent:</span>
                        <span style={{ color: "#059669", fontWeight: "600" }}>
                          $
                          {(
                            (msg.analysis.materials || [])
                              .filter(
                                (_, index) =>
                                  checkedItems[`${idx}-material-${index}`]
                              )
                              .reduce(
                                (sum, item) =>
                                  sum +
                                  item.estimated_unit_cost * item.quantity,
                                0
                              ) +
                            (msg.analysis.tools || [])
                              .filter(
                                (_, index) =>
                                  checkedItems[`${idx}-tool-${index}`]
                              )
                              .reduce(
                                (sum, tool) => sum + (tool.estimated_cost || 0),
                                0
                              )
                          ).toFixed(2)}
                        </span>
                      </div>

                      {/* Remaining to Buy */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "14px",
                          marginBottom: "8px",
                        }}
                      >
                        <span>🛍️ Remaining to Buy:</span>
                        <span style={{ color: "#dc2626", fontWeight: "600" }}>
                          $
                          {(
                            (msg.analysis.materials || [])
                              .filter(
                                (_, index) =>
                                  !checkedItems[`${idx}-material-${index}`]
                              )
                              .reduce(
                                (sum, item) =>
                                  sum +
                                  item.estimated_unit_cost * item.quantity,
                                0
                              ) +
                            (msg.analysis.tools || [])
                              .filter(
                                (_, index) =>
                                  !checkedItems[`${idx}-tool-${index}`]
                              )
                              .reduce(
                                (sum, tool) => sum + (tool.estimated_cost || 0),
                                0
                              )
                          ).toFixed(2)}
                        </span>
                      </div>

                      {/* Total Budget */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "16px",
                          fontWeight: "600",
                          paddingTop: "8px",
                          borderTop: "1px solid #86efac",
                        }}
                      >
                        <span>📊 Total Budget:</span>
                        <span style={{ color: "#166534" }}>
                          $
                          {(
                            (msg.analysis.materials || []).reduce(
                              (sum, item) =>
                                sum + item.estimated_unit_cost * item.quantity,
                              0
                            ) +
                            (msg.analysis.tools || []).reduce(
                              (sum, tool) => sum + (tool.estimated_cost || 0),
                              0
                            )
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          ))}

          {loading && (
            <div
              style={{
                alignSelf: "flex-start",
                color: "#667eea",
                padding: "10px",
                fontWeight: "500",
              }}
            >
              🔄 Analyzing your repair problem...
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Image Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            margin: "0 20px",
            padding: "20px",
            border: `2px dashed ${
              dragActive ? "#667eea" : imagePreview ? "#10b981" : "#d1d5db"
            }`,
            borderRadius: "12px",
            textAlign: "center",
            backgroundColor: dragActive
              ? "#eef2ff"
              : imagePreview
              ? "#ecfdf5"
              : "#f9fafb",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />

          {imagePreview ? (
            <div>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  maxHeight: "120px",
                  borderRadius: "8px",
                  marginBottom: "10px",
                }}
              />
              <div>
                <span style={{ color: "#10b981", fontWeight: "500" }}>
                  ✓ Image ready
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage();
                  }}
                  style={{
                    marginLeft: "15px",
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: "32px", marginBottom: "10px" }}>📷</div>
              <p style={{ margin: 0, color: "#6b7280", fontWeight: "500" }}>
                {dragActive
                  ? "Drop image here"
                  : "Drag & drop image or click to upload"}
              </p>
              <p
                style={{
                  margin: "5px 0 0 0",
                  color: "#9ca3af",
                  fontSize: "12px",
                }}
              >
                Supports: JPG, PNG, HEIC
              </p>
            </div>
          )}
        </div>

        {/* Text Input */}
        <form
          onSubmit={handleSend}
          style={{
            display: "flex",
            padding: "20px",
            gap: "10px",
            backgroundColor: "white",
            borderRadius: "0 0 16px 16px",
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the repair problem... (e.g., 'hole in drywall from doorknob')"
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "2px solid #e5e7eb",
              borderRadius: "10px",
              outline: "none",
              fontSize: "14px",
              transition: "border-color 0.3s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#667eea")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />

          <button
            type="submit"
            disabled={loading || !image || !input.trim()}
            style={{
              padding: "12px 24px",
              backgroundColor:
                loading || !image || !input.trim() ? "#9ca3af" : "#667eea",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor:
                loading || !image || !input.trim() ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "14px",
              transition: "background-color 0.3s",
            }}
          >
            {loading ? "Analyzing..." : "Send"}
          </button>
        </form>
      </div>
    </>
  );
}

export default App;
