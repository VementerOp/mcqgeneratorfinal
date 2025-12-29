"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./TestSetup.css"

const TestSetup = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    source_text: "",
    num_questions: 5,
    difficulty: "medium",
    time_duration: 10,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!formData.source_text.trim()) {
      setError("Please enter source text for generating test questions")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("http://localhost:5000/api/test/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Added credentials for session cookies
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        navigate("/test", {
          state: {
            testData: data.test_data,
          },
        })
      } else {
        setError(data.error || "Failed to create test. Make sure GROQ_API_KEY is set in backend/.env")
      }
    } catch (err) {
      console.error("[v0] TestSetup network error:", err)
      setError("Network error. Please check if the backend server is running on http://localhost:5000")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="test-setup-container">
      <div className="test-setup-card">
        <div className="test-setup-header">
          <h1>Setup Your Test</h1>
          <button className="btn btn-secondary" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Source Text for Questions</label>
            <textarea
              name="source_text"
              value={formData.source_text}
              onChange={handleChange}
              rows="8"
              placeholder="Enter the text content from which test questions will be generated..."
              required
            />
            <small>The AI will generate multiple-choice questions based on this text.</small>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Number of Questions</label>
              <input
                type="number"
                name="num_questions"
                value={formData.num_questions}
                onChange={handleChange}
                min="1"
                max="20"
                required
              />
            </div>

            <div className="input-group">
              <label>Difficulty Level</label>
              <select name="difficulty" value={formData.difficulty} onChange={handleChange} required>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>Time Duration (minutes)</label>
            <input
              type="number"
              name="time_duration"
              value={formData.time_duration}
              onChange={handleChange}
              min="1"
              max="60"
              required
            />
            <small>Test will auto-submit when time expires.</small>
          </div>

          <button type="submit" className="btn btn-success btn-block" disabled={loading}>
            {loading ? "Creating Test..." : "Start Test"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default TestSetup
