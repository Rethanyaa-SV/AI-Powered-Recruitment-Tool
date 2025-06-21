"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/protected-route"
import { AdaptiveNavbar } from "@/components/adaptive-navbar"
import { Briefcase, Users, FileText, Clock, CheckCircle, Plus, Eye, Star } from "lucide-react"
import Link from "next/link"

export default function RecruiterDashboard() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
  })
  const [recentApplications, setRecentApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("auth-token")

      // Fetch jobs
      const jobsResponse = await fetch("/api/recruiter/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const jobs = jobsResponse.ok ? await jobsResponse.json() : []

      // Fetch applications
      const applicationsResponse = await fetch("/api/recruiter/applications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const applications = applicationsResponse.ok ? await applicationsResponse.json() : []

      // Calculate stats
      setStats({
        totalJobs: jobs.length,
        activeJobs: jobs.filter((job) => job.status === "active").length,
        totalApplications: applications.length,
        pendingApplications: applications.filter((app) => app.status === "pending").length,
        acceptedApplications: applications.filter((app) => app.status === "accepted").length,
        rejectedApplications: applications.filter((app) => app.status === "rejected").length,
      })

      // Set recent applications (top 5)
      setRecentApplications(applications.slice(0, 5))
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

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["recruiter"]}>
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
    <ProtectedRoute allowedRoles={["recruiter"]}>
      <div className="min-h-screen bg-gray-50">
        <AdaptiveNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Recruiter Dashboard</h1>
            <p className="text-gray-600">Manage your job postings and review applications</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeJobs}</div>
                <p className="text-xs text-muted-foreground">{stats.totalJobs} total jobs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalApplications}</div>
                <p className="text-xs text-muted-foreground">All time applications</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingApplications}</div>
                <p className="text-xs text-muted-foreground">Need your attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hired</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.acceptedApplications}</div>
                <p className="text-xs text-muted-foreground">Successful hires</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/recruiter/jobs">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Post New Job
                  </Button>
                </Link>
                <Link href="/recruiter/applications">
                  <Button className="w-full justify-start" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Review Applications
                  </Button>
                </Link>
                <Link href="/recruiter/candidates">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Browse Candidates
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Applications */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Latest candidate applications with AI scores</CardDescription>
              </CardHeader>
              <CardContent>
                {recentApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                    <p className="text-gray-600 mb-4">
                      Applications will appear here once candidates start applying to your jobs.
                    </p>
                    <Link href="/recruiter/jobs">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Post Your First Job
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
                            <h4 className="font-medium">{application.candidateName}</h4>
                            {application.aiAssessment?.overallScore && (
                              <Badge
                                variant="outline"
                                className={`${getScoreColor(application.aiAssessment.overallScore)} border-current`}
                              >
                                <Star className="h-3 w-3 mr-1" />
                                {application.aiAssessment.overallScore}%
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">Applied for {application.jobTitle}</p>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(application.status)}>{application.status}</Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(application.appliedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Link href="/recruiter/applications">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </Link>
                      </div>
                    ))}
                    <div className="text-center pt-4">
                      <Link href="/recruiter/applications">
                        <Button variant="outline">View All Applications</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Hiring Performance</CardTitle>
              <CardDescription>Overview of your recruitment metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {stats.totalApplications > 0
                      ? Math.round((stats.acceptedApplications / stats.totalApplications) * 100)
                      : 0}
                    %
                  </div>
                  <p className="text-sm text-gray-600">Acceptance Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {stats.activeJobs > 0 ? Math.round(stats.totalApplications / stats.activeJobs) : 0}
                  </div>
                  <p className="text-sm text-gray-600">Avg Applications per Job</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {recentApplications.filter((app) => app.aiAssessment?.overallScore >= 80).length}
                  </div>
                  <p className="text-sm text-gray-600">High-Match Candidates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
