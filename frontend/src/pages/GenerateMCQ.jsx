"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "./GenerateMCQ.css"

const GenerateMCQ = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sourceType, setSourceType] = useState("text")
  const [formData, setFormData] = useState({
    text: "",
    topic: "",
    num_questions: 5,
    difficulty: "medium",
  })
  const [pdfFile, setPdfFile] = useState(null)
  const [mcqs, setMcqs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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
    setSuccess("")
    setLoading(true)
    setMcqs([])

    try {
      console.log("[v0] Frontend - Preparing request")
      console.log("[v0] User exists:", !!user)

      const formDataToSend = new FormData()

      formDataToSend.append("source_type", sourceType)
      formDataToSend.append("num_questions", formData.num_questions)
      formDataToSend.append("difficulty", formData.difficulty)

      if (sourceType === "text") {
        if (!formData.text.trim()) {
          setError("Please enter some text")
          setLoading(false)
          return
        }
        formDataToSend.append("text", formData.text)
      } else if (sourceType === "pdf") {
        if (!pdfFile) {
          setError("Please upload a PDF file")
          setLoading(false)
          return
        }
        formDataToSend.append("pdf_file", pdfFile)
      } else if (sourceType === "topic") {
        if (!formData.topic.trim()) {
          setError("Please enter a topic name")
          setLoading(false)
          return
        }
        formDataToSend.append("topic", formData.topic)
      }

      console.log("[v0] Sending request to backend...")

      const response = await fetch("http://localhost:5000/api/mcq/generate", {
        method: "POST",
        credentials: "include", // Important for session cookies
        body: formDataToSend,
      })

      console.log("[v0] Response status:", response.status)

      const data = await response.json()
      console.log("[v0] Response data:", {
        authenticated: data.authenticated,
        saved: data.saved,
        user_id: data.user_id,
        mcqs_count: data.mcqs?.length || 0,
      })

      if (!response.ok) {
        const errorMessage = data.error || `Server error: ${response.status}`
        console.error("[v0] Error from backend:", errorMessage)
        setError(errorMessage)
        setLoading(false)
        return
      }

      if (data.mcqs && data.mcqs.length > 0) {
        setMcqs(data.mcqs)

        if (data.authenticated === true && data.saved === true) {
          setSuccess("✓ MCQs generated and saved to your account!")
          console.log("[v0] Success: Authenticated and saved")
        } else if (data.authenticated === true && data.saved === false) {
          setSuccess("✓ MCQs generated, but failed to save.")
          if (data.save_error) {
            setError(`Save error: ${data.save_error}`)
          }
          console.log("[v0] Authenticated but save failed")
        } else if (data.authenticated === false) {
          setSuccess("✓ MCQs generated! Login to save them permanently.")
          console.log("[v0] Not authenticated - guest mode")
        }
      } else {
        setError(data.error || "No MCQs were generated. Please try again.")
      }
    } catch (err) {
      console.error("[v0] Frontend error:", err)
      setError(`Connection error: ${err.message}. Make sure the backend server is running.`)
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => {
    if (user) {
      navigate("/dashboard")
    } else {
      navigate("/")
    }
  }

  return (
    <div className="generate-container">
      <div className="generate-card">
        <div className="generate-header">
          <h1>Generate MCQs</h1>
          {user && (
            <div style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>
              Logged in as: <strong>{user.email}</strong>
            </div>
          )}
          <button className="btn btn-secondary" onClick={goBack}>
            ← Back
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

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
              <label className="radio-label">
                <input
                  type="radio"
                  value="topic"
                  checked={sourceType === "topic"}
                  onChange={(e) => setSourceType(e.target.value)}
                />
                Topic
              </label>
            </div>
          </div>

          {sourceType === "text" && (
            <div className="input-group">
              <label>Enter Text</label>
              <textarea
                name="text"
                value={formData.text}
                onChange={handleChange}
                rows="10"
                placeholder="Paste your text content here..."
              />
            </div>
          )}

          {sourceType === "pdf" && (
            <div className="input-group">
              <label>Upload PDF</label>
              <input type="file" accept=".pdf" onChange={handleFileChange} />
            </div>
          )}

          {sourceType === "topic" && (
            <div className="input-group">
              <label>Enter Topic Name</label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                placeholder="e.g., Photosynthesis, World War II, Python Programming..."
                className="topic-input"
              />
              <small className="input-hint">AI will generate questions based on its knowledge of this topic</small>
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
                max="200"
              />
            </div>

            <div className="input-group">
              <label>Difficulty Level</label>
              <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Generating..." : "Generate MCQs"}
          </button>
        </form>

        {mcqs.length > 0 && (
          <div className="mcqs-preview">
            <h2>Generated MCQs</h2>
            {mcqs.map((mcq, index) => (
              <div key={index} className="mcq-item">
                <h3>Question {index + 1}</h3>
                <p className="question-text">{mcq.question}</p>
                <div className="options-grid">
                  <div className="option">A. {mcq.option_a}</div>
                  <div className="option">B. {mcq.option_b}</div>
                  <div className="option">C. {mcq.option_c}</div>
                  <div className="option">D. {mcq.option_d}</div>
                </div>
                <p className="correct-answer">
                  <strong>Correct Answer:</strong> {mcq.correct_answer}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default GenerateMCQ
