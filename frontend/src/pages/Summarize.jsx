"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "./Summarize.css"

const Summarize = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sourceType, setSourceType] = useState("text")
  const [formData, setFormData] = useState({
    text: "",
    summary_length: "medium",
  })
  const [pdfFile, setPdfFile] = useState(null)
  const [summary, setSummary] = useState("")
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
    setSummary("")

    try {
      console.log("[v0] Frontend - Preparing summarization request")

      const formDataToSend = new FormData()

      formDataToSend.append("source_type", sourceType)
      formDataToSend.append("summary_length", formData.summary_length)

      if (sourceType === "text") {
        if (!formData.text.trim()) {
          setError("Please enter some text")
          setLoading(false)
          return
        }
        formDataToSend.append("text", formData.text)
      } else {
        if (!pdfFile) {
          setError("Please upload a PDF file")
          setLoading(false)
          return
        }
        formDataToSend.append("pdf_file", pdfFile)
      }

      console.log("[v0] Sending request to backend...")

      const response = await fetch("http://localhost:5000/api/summary/generate", {
        method: "POST",
        credentials: "include",
        body: formDataToSend,
      })

      console.log("[v0] Response status:", response.status)

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || `Server error: ${response.status}`
        console.error("[v0] Error from backend:", errorMessage)
        setError(errorMessage)
        setLoading(false)
        return
      }

      if (data.summary) {
        setSummary(data.summary)
        setSuccess("✓ Summary generated successfully!")
        console.log("[v0] Summary generated")
      } else {
        setError(data.error || "No summary was generated. Please try again.")
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

  const copySummary = () => {
    navigator.clipboard.writeText(summary)
    setSuccess("✓ Summary copied to clipboard!")
    setTimeout(() => setSuccess(""), 3000)
  }

  return (
    <div className="summarize-container">
      <div className="summarize-card">
        <div className="summarize-header">
          <h1>Summarize Text</h1>
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
            </div>
          </div>

          {sourceType === "text" ? (
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
          ) : (
            <div className="input-group">
              <label>Upload PDF</label>
              <input type="file" accept=".pdf" onChange={handleFileChange} />
            </div>
          )}

          <div className="input-group">
            <label>Summary Length</label>
            <select name="summary_length" value={formData.summary_length} onChange={handleChange}>
              <option value="short">Short (2-3 sentences)</option>
              <option value="medium">Medium (3-5 paragraphs)</option>
              <option value="long">Long (5-7 paragraphs)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Generating Summary..." : "Generate Summary"}
          </button>
        </form>

        {summary && (
          <div className="summary-preview">
            <div className="summary-header-section">
              <h2>Generated Summary</h2>
              <button className="btn btn-secondary" onClick={copySummary}>
                📋 Copy
              </button>
            </div>
            <div className="summary-content">
              <p>{summary}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Summarize
