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
  const [timeLeft, setTimeLeft] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [showEndTestModal, setShowEndTestModal] = useState(false)
  const hasSubmitted = useRef(false)
  const timerStarted = useRef(false)

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
  }, [navigate, testData])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleEndTest = () => {
    setShowEndTestModal(true)
  }

  const confirmEndTest = () => {
    setShowEndTestModal(false)
    navigate("/test-setup")
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
        <div className="header-right">
          <div className={`timer ${timeLeft < 60 ? "warning" : ""}`}>
            <span className="timer-icon">⏱️</span>
            <span className="timer-text">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </div>
          <button className="btn btn-end-test" onClick={handleEndTest}>
            End Test
          </button>
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

        <div className="question-numbers-bar">
          <button
            className="num-scroll-btn"
            onClick={() => {
              const el = document.querySelector('.question-numbers-track')
              if (el) el.scrollBy({ left: -200, behavior: 'smooth' })
            }}
            aria-label="Scroll left"
          >
            ‹
          </button>
          <div className="question-numbers-track">
            {testData.mcqs.map((_, index) => (
              <button
                key={index}
                className={`q-num-btn ${index === currentQuestion ? "active" : ""} ${answers[index] ? "answered" : ""}`}
                onClick={() => setCurrentQuestion(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <button
            className="num-scroll-btn"
            onClick={() => {
              const el = document.querySelector('.question-numbers-track')
              if (el) el.scrollBy({ left: 200, behavior: 'smooth' })
            }}
            aria-label="Scroll right"
          >
            ›
          </button>
        </div>
      </div>

      {showEndTestModal && (
        <div className="end-test-overlay" onClick={() => setShowEndTestModal(false)}>
          <div className="end-test-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-warning-icon">!</div>
            <h3 className="modal-title">End Test?</h3>
            <p className="modal-message">
              Are you sure you want to end this test? Your progress will be discarded and this action cannot be undone.
            </p>
            <p className="modal-stats">
              You have answered {Object.keys(answers).length} of {testData.mcqs.length} questions.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowEndTestModal(false)}>
                Continue Test
              </button>
              <button className="btn btn-danger" onClick={confirmEndTest}>
                Discard & End Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TestPage
