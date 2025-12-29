"use client"

import { createContext, useState, useContext, useEffect } from "react"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("[v0] AuthContext: Initializing...")
    verifySession()
  }, [])

  const verifySession = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify", {
        credentials: "include", // Important for session cookies
      })

      console.log("[v0] Verify response status:", res.status)

      if (res.ok) {
        const data = await res.json()
        console.log("[v0] ✓ Session verified, user:", data.user.email)
        setUser(data.user)
      } else {
        console.log("[v0] ✗ No valid session")
        setUser(null)
      }
    } catch (error) {
      console.error("[v0] ✗ Session verification error:", error.message)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      console.log("[v0] Attempting login for:", email)
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include credentials for session cookies
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("[v0] ✓ Login successful:", data.user)
        setUser(data.user)
        return { success: true }
      } else {
        console.log("[v0] ✗ Login failed:", data.error)
        return { success: false, error: data.error }
      }
    } catch (err) {
      console.error("[v0] ✗ Login network error:", err)
      return { success: false, error: "Network error. Please try again." }
    }
  }

  const signup = async (username, email, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include credentials for session cookies
        body: JSON.stringify({ username, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (err) {
      return { success: false, error: "Network error. Please try again." }
    }
  }

  const logout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (err) {
      console.error("[v0] Logout error:", err)
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>{!loading && children}</AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
