// src/App.js
import React, { useState } from "react";
import "./App.css";

function App() {
  const [imageFile, setImageFile] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0] || null;
    setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!imageFile) {
      setError("Please choose an image file.");
      return;
    }
    if (!description.trim()) {
      setError("Please enter a short description of the problem.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("description", description);

      // Optional extras if your backend supports them:
      // formData.append("skill_level", "beginner");
      // formData.append("budget", "moderate");
      // formData.append("location", "United States");
      // formData.append("humanize", "true");

      const response = await fetch(
        "http://127.0.0.1:8000/api/analyze-image-upload/", // change if your URL is different
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.error || `Request failed with status ${response.status}`
        );
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>YouCanFixIt</h1>
      <p className="subtitle">
        Upload a photo of your home repair and describe what you want to fix.
      </p>

      <form className="card" onSubmit={handleSubmit}>
        <div className="field">
          <label className="label">
            Image
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="input"
            />
          </label>
        </div>

        <div className="field">
          <label className="label">
            Problem description
            <textarea
              className="textarea"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="There is a hole in my drywall near a light switch..."
            />
          </label>
        </div>

        <button type="submit" className="button" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze repair"}
        </button>

        {error && <div className="error">⚠ {error}</div>}
      </form>

      {result && (
        <div className="card result">
          <h2>AI Result</h2>

          {result.human_text && (
            <>
              <h3>Summary</h3>
              <p>{result.human_text}</p>
            </>
          )}

          {result.analysis && (
            <>
              <h3>Diagnosis</h3>
              <p>{result.analysis.diagnosis}</p>

              {Array.isArray(result.analysis.materials) && (
                <>
                  <h3>Materials</h3>
                  <ul>
                    {result.analysis.materials.map((m, idx) => (
                      <li key={idx}>
                        {m.quantity} {m.unit} {m.name}{" "}
                        {m.notes && <span>— {m.notes}</span>}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {Array.isArray(result.analysis.steps) && (
                <>
                  <h3>Steps</h3>
                  <ol>
                    {result.analysis.steps.map((s) => (
                      <li key={s.step_number}>
                        <strong>{s.title}</strong>: {s.details}
                      </li>
                    ))}
                  </ol>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
