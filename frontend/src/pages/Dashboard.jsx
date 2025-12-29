"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "./Dashboard.css"

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/dashboard", {
        method: "GET",
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
        setError("")
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to load dashboard")

        if (response.status === 401) {
          setTimeout(() => navigate("/login"), 2000)
        }
      }
    } catch (err) {
      console.error("[v0] Dashboard: Network error:", err)
      setError("Network error. Make sure the backend server is running on http://localhost:5000")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    if (logout) {
      logout()
    }
    navigate("/")
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <div style={{ marginTop: "1rem", fontSize: "0.9rem", textAlign: "left" }}>
            <strong>Troubleshooting:</strong>
            <br />
            1. Make sure backend server is running: <code>python backend/app.py</code>
            <br />
            2. Check that you're logged in with valid credentials
            <br />
            3. Verify GROQ_API_KEY is set in backend/.env file
            <br />
            4. Check browser console (F12) for detailed error logs
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {dashboardData?.user?.username || user?.username}!</h1>
          <p>Track your progress and manage your tests</p>
        </div>
        <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{dashboardData?.stats?.total_mcq_sets || 0}</h3>
            <p>MCQ Sets Generated</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{dashboardData?.stats?.total_tests || 0}</h3>
            <p>Tests Attempted</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{dashboardData?.stats?.average_score || 0}%</h3>
            <p>Average Score</p>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <button className="btn btn-primary" onClick={() => navigate("/generate-mcq")}>
          Generate MCQs
        </button>
        <button className="btn btn-success" onClick={() => navigate("/test-setup")}>
          Take a Test
        </button>
      </div>

      <div className="dashboard-section">
        <h2>Recent Test History</h2>
        {dashboardData?.recent_tests?.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Test</th>
                <th>Date</th>
                <th>Score</th>
                <th>Total</th>
                <th>Percentage</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.recent_tests.map((test) => (
                <tr key={test.id}>
                  <td>{test.title}</td>
                  <td>{new Date(test.submitted_at).toLocaleDateString()}</td>
                  <td>{test.score}</td>
                  <td>{test.total_marks}</td>
                  <td>
                    <span
                      className={`percentage ${test.percentage >= 70 ? "good" : test.percentage >= 50 ? "average" : "poor"}`}
                    >
                      {test.percentage}%
                    </span>
                  </td>
                  <td>
                    <button className="btn-link" onClick={() => navigate(`/test-result/${test.id}`)}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">No tests taken yet. Start by taking your first test!</p>
        )}
      </div>
    </div>
  )
}

export default Dashboard
