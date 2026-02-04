"use client"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "./Home.css"

const Home = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleNavigation = (path) => {
    navigate(path)
  }

  const quickAccessCards = [
    {
      id: 1,
      title: "Generate MCQs",
      description: "Create multiple-choice questions from text or PDF",
      icon: "✨",
      path: "/generate-mcq",
      color: "card-blue",
    },
    {
      id: 2,
      title: "Take a Test",
      description: "Test your knowledge with timed assessments",
      icon: "📝",
      path: "/test-setup",
      color: "card-purple",
    },
    {
      id: 3,
      title: "Summarize Text",
      description: "Get concise summaries of any content",
      icon: "📄",
      path: "/summarize",
      color: "card-teal",
    },
    {
      id: 4,
      title: "View Dashboard",
      description: "Track your progress and analytics",
      icon: "📊",
      path: "/dashboard",
      color: "card-orange",
    },
  ]

  return (
    <div className="home-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">MCQPoint</span>
          </div>
          <div className="nav-links">
            {user ? (
              <>
                <span className="user-welcome">Welcome, {user?.username}!</span>
                <button className="nav-link" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="nav-link" onClick={() => handleNavigation("/login")}>
                  Login
                </button>
                <button className="nav-link nav-signup" onClick={() => handleNavigation("/signup")}>
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {user ? (
        <>
          <section className="quick-access-section">
            <div className="quick-access-container">
              <div className="section-header">
                <h2>Quick Access</h2>
                <p>Start learning instantly</p>
              </div>
              <div className="quick-access-grid">
                {quickAccessCards.map((card) => (
                  <div
                    key={card.id}
                    className={`quick-access-card ${card.color}`}
                    onClick={() => handleNavigation(card.path)}
                  >
                    <div className="card-icon">{card.icon}</div>
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                    <div className="card-arrow">→</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Hero Section - Secondary for logged-in users */}
          <section className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title">Master Any Subject</h1>
              <p className="hero-subtitle">
                Generate unlimited multiple-choice questions, take timed tests, and summarize complex topics with
                AI-powered assistance.
              </p>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">10,000+</span>
                  <span className="stat-text">Questions Generated</span>
                </div>
                <div className="stat">
                  <span className="stat-number">2,500+</span>
                  <span className="stat-text">Active Users</span>
                </div>
                <div className="stat">
                  <span className="stat-number">4.9/5</span>
                  <span className="stat-text">User Rating</span>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="gradient-blob blob-1"></div>
              <div className="gradient-blob blob-2"></div>
              <div className="hero-icon">📚</div>
            </div>
          </section>

          {/* Features Section */}
          <section className="features-section">
            <h2>Why Choose MCQPoint?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3>Instant Generation</h3>
                <p>AI generates comprehensive MCQs in seconds</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Smart Analytics</h3>
                <p>Track your performance with detailed insights</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>Customizable</h3>
                <p>Choose difficulty, duration, and content type</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3>Secure & Private</h3>
                <p>Your data is encrypted and protected</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📝</div>
                <h3>Text Summarization</h3>
                <p>Get concise summaries of any text or PDF</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">⏱️</div>
                <h3>Timed Assessments</h3>
                <p>Take realistic exams with customizable durations</p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="cta-section">
            <h2>Ready to Excel?</h2>
            <p>Start with your first MCQ generation or take a practice test</p>
            <div className="cta-buttons">
              <button className="btn btn-primary btn-large" onClick={() => handleNavigation("/generate-mcq")}>
                Generate MCQs Now
              </button>
              <button className="btn btn-secondary btn-large" onClick={() => handleNavigation("/test-setup")}>
                Start Practice Test
              </button>
            </div>
          </section>
        </>
      ) : (
        <>
          {/* Hero Section for Non-Logged In Users */}
          <section className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title">Master Any Subject with AI-Powered MCQs</h1>
              <p className="hero-subtitle">
                Generate unlimited multiple-choice questions from text or PDF. Test yourself with timed assessments and
                track your progress.
              </p>
              <div className="hero-buttons">
                <button className="btn btn-primary" onClick={() => handleNavigation("/signup")}>
                  Get Started Free
                </button>
                <button className="btn btn-secondary" onClick={() => handleNavigation("/generate-mcq")}>
                  Try as Guest
                </button>
              </div>
            </div>
            <div className="hero-visual">
              <div className="gradient-blob blob-1"></div>
              <div className="gradient-blob blob-2"></div>
              <div className="hero-icon">📚</div>
            </div>
          </section>

          {/* Features Section */}
          <section className="features-section">
            <h2>Powerful Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">✨</div>
                <h3>AI-Powered Generation</h3>
                <p>Our advanced AI generates comprehensive MCQs with correct answers in seconds</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">⏱️</div>
                <h3>Timed Tests</h3>
                <p>Take realistic timed exams with customizable durations and difficulty levels</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Analytics Dashboard</h3>
                <p>Track your performance, identify weak areas, and improve with detailed insights</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📄</div>
                <h3>Multi-Format Support</h3>
                <p>Generate questions from text, PDFs, or any document format</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>Customizable Difficulty</h3>
                <p>Choose from easy, medium, or hard difficulty levels based on your needs</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📝</div>
                <h3>Text Summarization</h3>
                <p>Get concise summaries of any text or PDF with customizable length options</p>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="stats-section">
            <div className="stat-item">
              <div className="stat-number">10,000+</div>
              <div className="stat-label">Questions Generated</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">2,500+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">99.8%</div>
              <div className="stat-label">Uptime</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">4.9/5</div>
              <div className="stat-label">User Rating</div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="cta-section">
            <h2>Ready to Transform Your Learning?</h2>
            <p>Start generating MCQs and taking tests in less than a minute</p>
            <div className="cta-buttons">
              <button className="btn btn-primary btn-large" onClick={() => handleNavigation("/signup")}>
                Create Free Account
              </button>
              <button className="btn btn-secondary btn-large" onClick={() => handleNavigation("/generate-mcq")}>
                Try Now
              </button>
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>MCQPoint</h4>
            <p>Your AI-powered learning companion</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <a onClick={() => handleNavigation("/")}>Home</a>
              </li>
              <li>
                <a onClick={() => handleNavigation("/generate-mcq")}>Generate MCQs</a>
              </li>
              {user && (
                <><li>
                  <a onClick={() => handleNavigation("/dashboard")}>Dashboard</a>
                </li><li>
                    <a onClick={() => handleNavigation("/test-setup")}>Quiz</a>
                  </li><li>
                    <a onClick={() => handleNavigation("/summarize")}>Summary</a>
                  </li></>
              )}
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li>
                <a href="mailto:atharvasadhye0@gmail.com">Email Support</a>
              </li>
              <li>
                <a href="#">Help Center</a>
              </li>
              <li>
                <a href="#">Privacy Policy</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 MCQPoint. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home
