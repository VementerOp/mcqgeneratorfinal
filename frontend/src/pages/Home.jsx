"use client"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "./Home.css"

const Home = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleNavigation = (path, label) => {
    console.log("[v0] Navigating to:", path, "User:", user ? "logged in" : "guest")
    navigate(path)
  }

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="home-hero">
          <h1 className="home-title">MCQ Generator & Test Application</h1>
          <p className="home-subtitle">
            Generate intelligent multiple-choice questions from any text or PDF document and take interactive tests to
            assess your knowledge.
          </p>

          <div className="home-features">
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>Generate MCQs</h3>
              <p>Create MCQs from text or PDF files with customizable difficulty levels</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⏱️</div>
              <h3>Timed Tests</h3>
              <p>Take tests with customizable time limits and instant results</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Track Progress</h3>
              <p>View detailed analytics and track your performance over time</p>
            </div>
          </div>

          <div className="home-actions">
            {user ? (
              <>
                <button
                  className="btn btn-primary btn-large"
                  onClick={() => handleNavigation("/dashboard", "Dashboard")}
                >
                  Go to Dashboard
                </button>
                <button
                  className="btn btn-success btn-large"
                  onClick={() => handleNavigation("/generate-mcq", "Generate MCQ")}
                >
                  Generate MCQs
                </button>
                <button
                  className="btn btn-info btn-large"
                  onClick={() => handleNavigation("/test-setup", "Timed Test")}
                >
                  Take Timed Test
                </button>
                <button className="btn btn-danger btn-large" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-primary btn-large" onClick={() => handleNavigation("/login", "Login")}>
                  Login
                </button>
                <button className="btn btn-secondary btn-large" onClick={() => handleNavigation("/signup", "Signup")}>
                  Sign Up
                </button>
                <button
                  className="btn btn-success btn-large"
                  onClick={() => handleNavigation("/generate-mcq", "Guest MCQ")}
                >
                  Try as Guest
                </button>
              </>
            )}
          </div>

          {!user && (
            <div className="home-demo">
              <small>Guest mode: Generate MCQs without login (won't be saved)</small>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
