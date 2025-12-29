"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import "./TestPage.css"

const TestPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const testData = location.state?.testData

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(null) // Start with null instead of 0
  const [submitting, setSubmitting] = useState(false)
  const hasSubmitted = useRef(false)
  const timerStarted = useRef(false) // Track if timer has actually started

  useEffect(() => {
    if (!testData) {
      navigate("/test-setup")
      return
    }

    console.log("[v0] TestPage mounted with testData:", testData)
    console.log("[v0] MCQs data:", testData.mcqs)
    console.log("[v0] First MCQ:", testData.mcqs[0])

    // Only initialize timer once
    if (!timerStarted.current) {
      const initialTime = testData.time_duration * 60
      console.log("[v0] Initializing timer with", initialTime, "seconds")
      setTimeLeft(initialTime)
      timerStarted.current = true
      hasSubmitted.current = false
    }
  }, []) // Empty dependency array - run only once on mount

  useEffect(() => {
    // Don't start countdown until timeLeft is properly initialized
    if (timeLeft === null || timeLeft === undefined) {
      return
    }

    // Auto-submit when time expires
    if (timeLeft <= 0 && !hasSubmitted.current) {
      console.log("[v0] Time expired, auto-submitting test")
      handleSubmit()
      return
    }

    // Countdown timer
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1
          if (newTime % 30 === 0) {
            console.log("[v0] Time remaining:", newTime, "seconds")
          }
          return newTime
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [timeLeft])

  const handleAnswerSelect = (answer) => {
    console.log("[v0] Answer selected:", answer, "for question", currentQuestion)
    setAnswers({
      ...answers,
      [currentQuestion]: answer,
    })
  }

  const handleNext = () => {
    if (currentQuestion < testData.mcqs.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    if (submitting || hasSubmitted.current) {
      console.log("[v0] Submission already in progress or completed, ignoring")
      return
    }

    hasSubmitted.current = true
    setSubmitting(true)

    try {
      const formattedQuestions = testData.mcqs.map((mcq, idx) => {
        console.log(`[v0] Formatting question ${idx + 1}:`, mcq)

        const formatted = {
          question: mcq.question,
          options: {
            A: mcq.option_a || "",
            B: mcq.option_b || "",
            C: mcq.option_c || "",
            D: mcq.option_d || "",
          },
          correct_answer: mcq.correct_answer,
        }

        console.log(`[v0] Formatted question ${idx + 1}:`, formatted)
        return formatted
      })

      console.log("[v0] All formatted questions:", formattedQuestions)
      console.log("[v0] User answers:", answers)

      const response = await fetch("http://localhost:5000/api/test/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: `Test - ${testData.difficulty}`,
          difficulty: testData.difficulty,
          time_duration: testData.time_duration,
          questions: formattedQuestions,
          answers: answers,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("[v0] Test submitted successfully, navigating to results")
        navigate(`/test-result/${data.test_id}`)
      } else {
        console.error("[v0] Failed to submit test:", data)
        alert("Failed to submit test: " + (data.error || "Unknown error"))
        hasSubmitted.current = false
        setSubmitting(false)
      }
    } catch (err) {
      console.error("[v0] Test submission error:", err)
      alert("Network error. Please try again.")
      hasSubmitted.current = false
      setSubmitting(false)
    }
  }

  if (!testData) {
    return <div className="loading">Loading test...</div>
  }

  if (timeLeft === null) {
    return <div className="loading">Initializing test...</div>
  }

  const currentMCQ = testData.mcqs[currentQuestion]
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const options = {
    A: currentMCQ.option_a || "",
    B: currentMCQ.option_b || "",
    C: currentMCQ.option_c || "",
    D: currentMCQ.option_d || "",
  }

  console.log(`[v0] Current MCQ (question ${currentQuestion + 1}):`, currentMCQ)
  console.log("[v0] Extracted options:", options)

  return (
    <div className="test-page-container">
      <div className="test-header">
        <div className="test-info">
          <h2>Test in Progress</h2>
          <p>
            Question {currentQuestion + 1} of {testData.mcqs.length}
          </p>
        </div>
        <div className={`timer ${timeLeft < 60 ? "warning" : ""}`}>
          <span className="timer-icon">⏱️</span>
          <span className="timer-text">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="test-card">
        <div className="question-section">
          <h3 className="question-number">Question {currentQuestion + 1}</h3>
          <p className="question-text">{currentMCQ.question}</p>
        </div>

        <div className="options-section">
          {Object.entries(options).map(([key, value]) => {
            console.log(`[v0] Rendering option ${key}:`, value)
            return (
              <div
                key={key}
                className={`option-card ${answers[currentQuestion] === key ? "selected" : ""}`}
                onClick={() => handleAnswerSelect(key)}
              >
                <div className="option-indicator">{key}</div>
                <div className="option-text">{value || `[Option ${key} - No text]`}</div>
              </div>
            )
          })}
        </div>

        <div className="test-navigation">
          <button className="btn btn-secondary" onClick={handlePrevious} disabled={currentQuestion === 0}>
            ← Previous
          </button>

          <div className="question-indicators">
            {testData.mcqs.map((_, index) => (
              <div
                key={index}
                className={`indicator ${index === currentQuestion ? "active" : ""} ${answers[index] ? "answered" : ""}`}
                onClick={() => setCurrentQuestion(index)}
              />
            ))}
          </div>

          {currentQuestion < testData.mcqs.length - 1 ? (
            <button className="btn btn-primary" onClick={handleNext}>
              Next →
            </button>
          ) : (
            <button className="btn btn-success" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Test"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default TestPage
