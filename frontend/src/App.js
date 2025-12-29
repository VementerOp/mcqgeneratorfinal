import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import GenerateMCQ from "./pages/GenerateMCQ"
import TestSetup from "./pages/TestSetup"
import TestPage from "./pages/TestPage"
import TestResult from "./pages/TestResult"
import PrivateRoute from "./components/PrivateRoute"
import { AuthProvider } from "./context/AuthContext"

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/generate-mcq" element={<GenerateMCQ />} />
          <Route
            path="/test-setup"
            element={
              <PrivateRoute>
                <TestSetup />
              </PrivateRoute>
            }
          />
          <Route
            path="/test"
            element={
              <PrivateRoute>
                <TestPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/test-result/:testId"
            element={
              <PrivateRoute>
                <TestResult />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
