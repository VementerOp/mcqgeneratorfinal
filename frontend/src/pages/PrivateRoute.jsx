"use client"

import { useAuth } from "../context/AuthContext"
import { Navigate } from "react-router-dom"

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()

  console.log("[v0] PrivateRoute: loading=", loading, "user=", user)

  if (loading) {
    console.log("[v0] Still loading auth state...")
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div>Loading...</div>
      </div>
    )
  }

  if (!user) {
    console.log("[v0] ✗ Not authenticated, redirecting to login")
    return <Navigate to="/login" replace />
  }

  console.log("[v0] ✓ User authenticated, rendering protected route")
  return children
}

export default PrivateRoute
