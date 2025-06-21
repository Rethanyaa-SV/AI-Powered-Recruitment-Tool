"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { LogOut, Home, Search, FileText, User, Brain } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function CandidateNavbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const navigation = [
    { name: "Dashboard", href: "/candidate/dashboard", icon: Home },
    { name: "Browse Jobs", href: "/candidate/jobs", icon: Search },
    { name: "Applications", href: "/candidate/applications", icon: FileText },
    { name: "Profile", href: "/candidate/profile", icon: User },
  ]

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <Link href="/candidate/dashboard" className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Candidate Portal</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
              </div>
            </Link>

            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href}>
                    <Button variant={isActive ? "default" : "ghost"} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </div>

          <Button variant="outline" onClick={logout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden pb-4">
          <div className="flex space-x-1 overflow-x-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </header>
  )
}
