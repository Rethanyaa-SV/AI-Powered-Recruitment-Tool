"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Calendar, Eye } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { AdaptiveNavbar } from "@/components/adaptive-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function CandidateApplicationsPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/candidate/applications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setApplications(data)
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
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
    if (score >= 80) return "bg-green-100 text-green-800"
    if (score >= 60) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const filteredApplications = applications.filter((app) => {
    return statusFilter === "all" || app.status === statusFilter
  })

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["candidate"]}>
        <div className="min-h-screen bg-gray-50">
          <AdaptiveNavbar />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
            <p className="text-gray-600">Track the status of your job applications</p>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex items-center gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Applications</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-600">
                {filteredApplications.length} of {applications.length} applications
              </p>
            </div>
          </div>

          {/* Applications List */}
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">{application.jobTitle}</CardTitle>
                      <CardDescription className="text-lg font-medium text-gray-900 mb-3">
                        {application.company}
                      </CardDescription>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Applied {new Date(application.appliedAt).toLocaleDateString()}
                        </div>
                        {application.updatedAt && application.updatedAt !== application.appliedAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Updated {new Date(application.updatedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={`${getStatusColor(application.status)} capitalize`}>{application.status}</Badge>
                      {application.matchScore && (
                        <Badge className={`${getScoreColor(application.matchScore)} font-semibold`}>
                          {application.matchScore}% Match
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {application.coverLetter && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-900 mb-1">Cover Letter:</p>
                      <p className="text-gray-700 text-sm line-clamp-2">{application.coverLetter}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      {application.aiAssessment && (
                        <div className="text-sm text-gray-600">
                          AI Assessment: {application.aiAssessment.recommendation}
                        </div>
                      )}
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {application.jobTitle} at {application.company}
                          </DialogTitle>
                          <DialogDescription>
                            Application submitted on {new Date(application.appliedAt).toLocaleDateString()}
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Status</h4>
                            <Badge className={`${getStatusColor(application.status)} capitalize`}>
                              {application.status}
                            </Badge>
                          </div>

                          {application.coverLetter && (
                            <div>
                              <h4 className="font-medium mb-2">Cover Letter</h4>
                              <p className="text-gray-700 text-sm whitespace-pre-line">{application.coverLetter}</p>
                            </div>
                          )}

                          {application.aiAssessment && (
                            <div>
                              <h4 className="font-medium mb-2">AI Assessment</h4>
                              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <div className="flex justify-between">
                                  <span>Overall Score:</span>
                                  <Badge className={getScoreColor(application.aiAssessment.overallScore)}>
                                    {application.aiAssessment.overallScore}%
                                  </Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span>Recommendation:</span>
                                  <span className="font-medium">{application.aiAssessment.recommendation}</span>
                                </div>
                                {application.aiAssessment.summary && (
                                  <div>
                                    <span className="font-medium">Summary:</span>
                                    <p className="text-sm text-gray-700 mt-1">{application.aiAssessment.summary}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {application.resumeData && (
                            <div>
                              <h4 className="font-medium mb-2">Resume Information</h4>
                              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                                <div>
                                  <strong>Name:</strong> {application.resumeData.personalInfo?.name}
                                </div>
                                <div>
                                  <strong>Email:</strong> {application.resumeData.personalInfo?.email}
                                </div>
                                {application.resumeData.skills && (
                                  <div>
                                    <strong>Skills:</strong>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {application.resumeData.skills.map((skill, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {skill}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredApplications.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {statusFilter !== "all" ? `No ${statusFilter} applications` : "No applications yet"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {statusFilter !== "all"
                      ? `You don't have any ${statusFilter} applications.`
                      : "Start applying to jobs to see your applications here."}
                  </p>
                  {statusFilter === "all" && (
                    <Button onClick={() => (window.location.href = "/candidate/jobs")}>Browse Jobs</Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
