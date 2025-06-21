"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (!session) {
      router.push("/login")
      return
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role)) {
      router.push("/unauthorized")
      return
    }
  }, [session, status, router, allowedRoles])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role)) {
    return null
  }

  return children
}
