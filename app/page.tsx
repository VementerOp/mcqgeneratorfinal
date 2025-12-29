"use client"

export default function Page() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div style={{ maxWidth: "1200px", width: "100%" }}>
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "60px 40px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <h1
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                color: "#1f2937",
                marginBottom: "20px",
              }}
            >
              MCQ Generator & Test Application
            </h1>
            <p
              style={{
                fontSize: "20px",
                color: "#6b7280",
                maxWidth: "800px",
                margin: "0 auto",
              }}
            >
              Generate intelligent multiple-choice questions from any text or PDF document and take interactive tests to
              assess your knowledge.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "30px",
              marginBottom: "50px",
            }}
          >
            <div
              style={{
                padding: "30px",
                borderRadius: "12px",
                background: "#f9fafb",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "15px" }}>📝</div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "10px", color: "#1f2937" }}>
                Generate MCQs
              </h3>
              <p style={{ color: "#6b7280", fontSize: "14px" }}>
                Create MCQs from text or PDF files with customizable difficulty levels
              </p>
            </div>

            <div
              style={{
                padding: "30px",
                borderRadius: "12px",
                background: "#f9fafb",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "15px" }}>⏱️</div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "10px", color: "#1f2937" }}>
                Timed Tests
              </h3>
              <p style={{ color: "#6b7280", fontSize: "14px" }}>
                Take tests with customizable time limits and instant results
              </p>
            </div>

            <div
              style={{
                padding: "30px",
                borderRadius: "12px",
                background: "#f9fafb",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "15px" }}>📊</div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "10px", color: "#1f2937" }}>
                Track Progress
              </h3>
              <p style={{ color: "#6b7280", fontSize: "14px" }}>
                View detailed analytics and track your performance over time
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            maxWidth: "400px",
            zIndex: 1000,
          }}
        >
          <h3 style={{ margin: "0 0 10px 0", color: "#111827" }}>⚠️ Flask + React Application</h3>
          <p style={{ margin: 0, fontSize: "14px", color: "#6b7280", lineHeight: 1.5 }}>
            This is a <strong>full-stack application</strong> with Flask backend and React frontend.
            <br />
            <br />
            <strong>To use the app:</strong>
            <br />
            1. Click three dots (•••) → Download ZIP
            <br />
            2. Extract and follow README.md instructions
            <br />
            3. Run backend (Python/Flask) and frontend (React) separately
            <br />
            <br />
            <strong>Features:</strong> Session-based auth, OpenAI integration, SQLite database
          </p>
        </div>
      </div>
    </div>
  )
}
