"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import "./TestResult.css"

const TestResult = () => {
  const navigate = useNavigate()
  const { testId } = useParams()
  const [testResult, setTestResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTestResult()
  }, [testId])

  const fetchTestResult = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/test/${testId}`, {
        credentials: "include", // Added credentials for session cookies
      })

      if (response.ok) {
        const data = await response.json()
        const transformedData = {
          ...data,
          answers: data.answers.map((answer) => ({
            ...answer,
            options: {
              A: answer.option_a || "",
              B: answer.option_b || "",
              C: answer.option_c || "",
              D: answer.option_d || "",
            },
          })),
        }
        console.log("[v0] Test result loaded:", transformedData)
        setTestResult(transformedData)
      }
    } catch (err) {
      console.error("Error fetching test result:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading results...</div>
  }

  if (!testResult) {
    return <div className="loading">Test not found</div>
  }

  const { test, answers } = testResult
  const correctAnswers = answers.filter((a) => a.is_correct).length
  const incorrectAnswers = answers.length - correctAnswers

  return (
    <div className="result-container">
      <div className="result-card">
        <div className="result-header">
          <h1>Test Results</h1>
          <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>

        <div className="result-summary">
          <div className="score-circle">
            <svg viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" fill="none" stroke="#e5e7eb" strokeWidth="20" />
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="#667eea"
                strokeWidth="20"
                strokeDasharray={`${test.percentage * 5.65} 565`}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
              />
            </svg>
            <div className="score-text">
              <span className="score-value">{test.percentage}%</span>
              <span className="score-label">Score</span>
            </div>
          </div>

          <div className="result-stats">
            <div className="stat-item">
              <div className="stat-value">{test.score}</div>
              <div className="stat-label">Correct</div>
            </div>
            <div className="stat-item">
              <div className="stat-value incorrect">{incorrectAnswers}</div>
              <div className="stat-label">Incorrect</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{test.total_questions}</div>
              <div className="stat-label">Total</div>
            </div>
          </div>
        </div>

        <div className="answers-section">
          <h2>Detailed Answers</h2>
          {answers.map((answer, index) => (
            <div key={answer.id} className={`answer-card ${answer.is_correct ? "correct" : "incorrect"}`}>
              <div className="answer-header">
                <h3>Question {index + 1}</h3>
                <span className={`answer-badge ${answer.is_correct ? "correct" : "incorrect"}`}>
                  {answer.is_correct ? "✓ Correct" : "✗ Incorrect"}
                </span>
              </div>

              <p className="answer-question">{answer.question}</p>

              <div className="answer-options">
                {Object.entries(answer.options).map(([key, value]) => (
                  <div
                    key={key}
                    className={`answer-option 
                      ${key === answer.correct_answer ? "correct-answer" : ""} 
                      ${key === answer.user_answer && !answer.is_correct ? "wrong-answer" : ""}
                    `}
                  >
                    <span className="option-key">{key}.</span>
                    <span className="option-value">{value}</span>
                    {key === answer.correct_answer && <span className="option-indicator">✓ Correct</span>}
                    {key === answer.user_answer && !answer.is_correct && (
                      <span className="option-indicator wrong">✗ Your Answer</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="result-actions">
          <button className="btn btn-success" onClick={() => navigate("/test-setup")}>
            Take Another Test
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("/dashboard")}>
            View All Results
          </button>
        </div>
      </div>
    </div>
  )
}

export default TestResult
