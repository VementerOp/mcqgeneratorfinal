"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./TestSetup.css"

const TestSetup = () => {
  const navigate = useNavigate()
  const [sourceType, setSourceType] = useState("text")
  const [formData, setFormData] = useState({
    source_text: "",
    num_questions: 5,
    difficulty: "medium",
    time_duration: 10,
  })
  const [pdfFile, setPdfFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (sourceType === "text" && !formData.source_text.trim()) {
      setError("Please enter source text for generating test questions")
      return
    }

    if (sourceType === "pdf" && !pdfFile) {
      setError("Please upload a PDF file")
      return
    }

    setLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("source_type", sourceType)
      formDataToSend.append("num_questions", formData.num_questions)
      formDataToSend.append("difficulty", formData.difficulty)
      formDataToSend.append("time_duration", formData.time_duration)

      if (sourceType === "text") {
        formDataToSend.append("source_text", formData.source_text)
      } else {
        formDataToSend.append("pdf_file", pdfFile)
      }

      const response = await fetch("http://localhost:5000/api/test/create", {
        method: "POST",
        credentials: "include",
        body: formDataToSend,
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
      console.error("TestSetup network error:", err)
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
            <label>Source Type</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  value="text"
                  checked={sourceType === "text"}
                  onChange={(e) => setSourceType(e.target.value)}
                />
                Text
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="pdf"
                  checked={sourceType === "pdf"}
                  onChange={(e) => setSourceType(e.target.value)}
                />
                PDF
              </label>
            </div>
          </div>

          {sourceType === "text" ? (
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
          ) : (
            <div className="input-group">
              <label>Upload PDF</label>
              <input type="file" accept=".pdf" onChange={handleFileChange} />
              <small>Upload a PDF file to generate test questions from its content.</small>
            </div>
          )}

          <div className="form-row">
            <div className="input-group">
              <label>Number of Questions</label>
              <input
                type="number"
                name="num_questions"
                value={formData.num_questions}
                onChange={handleChange}
                min="1"
                max="100"
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
