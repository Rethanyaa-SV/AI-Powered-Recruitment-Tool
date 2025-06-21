"use client"

import { Button } from "@/components/ui/button"
import { signOut, useSession } from "next-auth/react"
import { LogOut, Home, Briefcase, Users, FileText, Brain, Search, User, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

export function AdaptiveNavbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (!session?.user) return null

  const user = session.user

  const recruiterNavigation = [
    { name: "Dashboard", href: "/recruiter/dashboard", icon: Home },
    { name: "Jobs", href: "/recruiter/jobs", icon: Briefcase },
    { name: "Applications", href: "/recruiter/applications", icon: FileText },
    { name: "Candidates", href: "/recruiter/candidates", icon: Users },
  ]

  const candidateNavigation = [
    { name: "Dashboard", href: "/candidate/dashboard", icon: Home },
    { name: "Browse Jobs", href: "/candidate/jobs", icon: Search },
    { name: "Applications", href: "/candidate/applications", icon: FileText },
    { name: "Profile", href: "/candidate/profile", icon: User },
  ]

  const navigation = user.role === "recruiter" ? recruiterNavigation : candidateNavigation
  const portalName = user.role === "recruiter" ? "Recruiter Portal" : "Candidate Portal"
  const dashboardLink = user.role === "recruiter" ? "/recruiter/dashboard" : "/candidate/dashboard"

  const handleLogout = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link href={dashboardLink} className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg lg:text-xl font-bold text-gray-900 truncate">{portalName}</h1>
                <p className="text-xs lg:text-sm text-gray-600 truncate">Welcome, {user?.name}</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <Button variant={isActive ? "default" : "ghost"} className="flex items-center gap-2 px-3 py-2">
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Desktop Logout */}
          <div className="hidden lg:flex">
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center gap-2 p-2"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="pb-4 pt-2 border-t space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)} className="block">
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start flex items-center gap-3 px-4 py-3"
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
            <div className="pt-2 border-t">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full justify-start flex items-center gap-3 px-4 py-3"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
