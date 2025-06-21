"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SessionProvider } from "next-auth/react"

const AuthContext = createContext({})

export function AuthProvider({ children, session }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("auth-token")
    const userData = localStorage.getItem("user-data")

    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error("Error parsing user data:", error)
        localStorage.removeItem("auth-token")
        localStorage.removeItem("user-data")
      }
    }
    setLoading(false)
  }, [])

  const login = (token, userData) => {
    localStorage.setItem("auth-token", token)
    localStorage.setItem("user-data", JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem("auth-token")
    localStorage.removeItem("user-data")
    setUser(null)
    router.push("/")
  }

  const value = {
    user,
    login,
    logout,
    loading,
  }

  return (
    <SessionProvider session={session}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </SessionProvider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
