"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ProtectedRoute } from "@/components/protected-route"
import { AdaptiveNavbar } from "@/components/adaptive-navbar"
import { Search, FileText, TrendingUp, Clock, CheckCircle, Star, Eye, Upload } from "lucide-react"
import Link from "next/link"

export default function CandidateDashboard() {
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    averageMatchScore: 0,
  })
  const [recentApplications, setRecentApplications] = useState([])
  const [recommendedJobs, setRecommendedJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("auth-token")

      // Fetch applications
      const applicationsResponse = await fetch("/api/candidate/applications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const applications = applicationsResponse.ok ? await applicationsResponse.json() : []

      // Fetch recommended jobs
      const jobsResponse = await fetch("/api/candidate/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const jobs = jobsResponse.ok ? await jobsResponse.json() : []

      // Calculate stats
      const avgScore =
        applications.length > 0
          ? Math.round(applications.reduce((sum, app) => sum + (app.matchScore || 0), 0) / applications.length)
          : 0

      setStats({
        totalApplications: applications.length,
        pendingApplications: applications.filter((app) => app.status === "pending").length,
        acceptedApplications: applications.filter((app) => app.status === "accepted").length,
        rejectedApplications: applications.filter((app) => app.status === "rejected").length,
        averageMatchScore: avgScore,
      })

      // Set recent applications (top 5)
      setRecentApplications(applications.slice(0, 5))

      // Set recommended jobs (high match score, not applied)
      const appliedJobIds = applications.map((app) => app.jobId)
      const recommended = jobs
        .filter((job) => !appliedJobIds.includes(job.id) && job.matchScore >= 70)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 3)
      setRecommendedJobs(recommended)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "reviewed":
        return "bg-blue-100 text-blue-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBgColor = (score) => {
    if (score >= 80) return "bg-green-100"
    if (score >= 60) return "bg-yellow-100"
    return "bg-red-100"
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["candidate"]}>
        <div className="min-h-screen bg-gray-50">
          <AdaptiveNavbar />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["candidate"]}>
      <div className="min-h-screen bg-gray-50">
        <AdaptiveNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidate Dashboard</h1>
            <p className="text-gray-600">Track your applications and discover new opportunities</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalApplications}</div>
                <p className="text-xs text-muted-foreground">Total submitted</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingApplications}</div>
                <p className="text-xs text-muted-foreground">Under review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accepted</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.acceptedApplications}</div>
                <p className="text-xs text-muted-foreground">Job offers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Match</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(stats.averageMatchScore)}`}>
                  {stats.averageMatchScore}%
                </div>
                <p className="text-xs text-muted-foreground">AI compatibility</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/candidate/jobs">
                  <Button className="w-full justify-start" variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    Browse Jobs
                  </Button>
                </Link>
                <Link href="/candidate/applications">
                  <Button className="w-full justify-start" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Applications
                  </Button>
                </Link>
                <Link href="/candidate/profile">
                  <Button className="w-full justify-start" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Update Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Applications */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Your latest job applications and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {recentApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                    <p className="text-gray-600 mb-4">Start applying to jobs to see your applications here.</p>
                    <Link href="/candidate/jobs">
                      <Button>
                        <Search className="h-4 w-4 mr-2" />
                        Browse Jobs
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentApplications.map((application) => (
                      <div
                        key={application.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-medium">{application.jobTitle}</h4>
                            {application.matchScore && (
                              <Badge
                                variant="outline"
                                className={`${getScoreColor(application.matchScore)} border-current`}
                              >
                                <Star className="h-3 w-3 mr-1" />
                                {application.matchScore}%
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{application.company}</p>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(application.status)}>{application.status}</Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(application.appliedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Link href="/candidate/applications">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </div>
                    ))}
                    <div className="text-center pt-4">
                      <Link href="/candidate/applications">
                        <Button variant="outline">View All Applications</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recommended Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended for You</CardTitle>
              <CardDescription>Jobs that match your profile based on AI analysis</CardDescription>
            </CardHeader>
            <CardContent>
              {recommendedJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Complete your profile and apply to jobs to get personalized recommendations.
                  </p>
                  <Link href="/candidate/profile">
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Complete Profile
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendedJobs.map((job) => (
                    <Card key={job.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-lg">{job.title}</CardTitle>
                          <Badge
                            className={`${getScoreBgColor(job.matchScore)} ${getScoreColor(job.matchScore)} border-0`}
                          >
                            {job.matchScore}%
                          </Badge>
                        </div>
                        <CardDescription>{job.company}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="text-sm text-gray-600">
                            <p className="line-clamp-2">{job.description}</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">{job.location}</span>
                            <Link href={`/candidate/jobs/${job.id}`}>
                              <Button size="sm">View Job</Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {recommendedJobs.length > 0 && (
                <div className="text-center mt-6">
                  <Link href="/candidate/jobs">
                    <Button variant="outline">View All Jobs</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Insights */}
          {stats.totalApplications > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Your Performance</CardTitle>
                <CardDescription>Insights about your job search progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Success Rate</span>
                      <span className="text-sm text-gray-600">
                        {Math.round((stats.acceptedApplications / stats.totalApplications) * 100)}%
                      </span>
                    </div>
                    <Progress value={(stats.acceptedApplications / stats.totalApplications) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Response Rate</span>
                      <span className="text-sm text-gray-600">
                        {Math.round(
                          ((stats.acceptedApplications + stats.rejectedApplications) / stats.totalApplications) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        ((stats.acceptedApplications + stats.rejectedApplications) / stats.totalApplications) * 100
                      }
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Average Match</span>
                      <span className={`text-sm font-medium ${getScoreColor(stats.averageMatchScore)}`}>
                        {stats.averageMatchScore}%
                      </span>
                    </div>
                    <Progress value={stats.averageMatchScore} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
