"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Briefcase, Users, TrendingUp, Target } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

function DashboardContent() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalCandidates: 0,
    totalMatches: 0,
    averageScore: 0,
  })
  const [recentMatches, setRecentMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem("auth-token")
      const headers = { Authorization: `Bearer ${token}` }

      // Load all data
      const [jobsRes, candidatesRes, matchesRes] = await Promise.all([
        fetch("/api/jobs", { headers }),
        fetch("/api/candidates", { headers }),
        fetch("/api/matches", { headers }),
      ])

      const jobs = await jobsRes.json()
      const candidates = await candidatesRes.json()
      const matches = await matchesRes.json()

      // Calculate stats
      const averageScore =
        matches.length > 0 ? Math.round(matches.reduce((sum, match) => sum + match.score, 0) / matches.length) : 0

      setStats({
        totalJobs: jobs.length,
        totalCandidates: candidates.length,
        totalMatches: matches.length,
        averageScore,
      })

      // Get recent top matches
      const topMatches = matches
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((match) => {
          const job = jobs.find((j) => j.id === match.jobId)
          const candidate = candidates.find((c) => c.id === match.candidateId)
          return { ...match, job, candidate }
        })
        .filter((match) => match.job && match.candidate)

      setRecentMatches(topMatches)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to Your Recruitment Dashboard</h1>
        <p className="text-blue-100">Manage your hiring process with AI-powered candidate matching and analytics.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">Active job postings</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCandidates}</div>
            <p className="text-xs text-muted-foreground">Candidate profiles</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Matches</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMatches}</div>
            <p className="text-xs text-muted-foreground">Generated matches</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Match Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
            <p className="text-xs text-muted-foreground">Match quality</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Job Management
            </CardTitle>
            <CardDescription>Create and manage job postings</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/jobs">
              <Button className="w-full">Manage Jobs</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Candidates
            </CardTitle>
            <CardDescription>Upload and review candidate profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/candidates">
              <Button className="w-full">View Candidates</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              AI Matching
            </CardTitle>
            <CardDescription>View AI-powered candidate matches</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/matches">
              <Button className="w-full">View Matches</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Top Matches */}
      {recentMatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Recent Matches</CardTitle>
            <CardDescription>Best candidate-job matches from AI analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMatches.map((match) => (
                <div
                  key={`${match.candidateId}-${match.jobId}`}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{match.candidate.name}</h4>
                    <p className="text-sm text-gray-600">{match.job.title}</p>
                    <p className="text-xs text-gray-500">{match.matchedSkills.join(", ")}</p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-2xl font-bold ${
                        match.score >= 80 ? "text-green-600" : match.score >= 60 ? "text-yellow-600" : "text-red-600"
                      }`}
                    >
                      {match.score}%
                    </div>
                    <p className="text-xs text-gray-500">Match Score</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DashboardContent />
        </div>
      </div>
    </ProtectedRoute>
  )
}
