"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { JobForm } from "@/components/job-form"
import { Plus, Edit, Trash2, Users, Briefcase } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

function JobsContent() {
  const [jobs, setJobs] = useState([])
  const [matches, setMatches] = useState([])
  const [showJobForm, setShowJobForm] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadJobs()
    loadMatches()
  }, [])

  const loadJobs = async () => {
    try {
      const response = await fetch("/api/jobs", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setJobs(data)
      }
    } catch (error) {
      console.error("Failed to load jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadMatches = async () => {
    try {
      const response = await fetch("/api/matches", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setMatches(data)
      }
    } catch (error) {
      console.error("Failed to load matches:", error)
    }
  }

  const handleJobSaved = () => {
    setShowJobForm(false)
    setEditingJob(null)
    loadJobs()
    loadMatches()
  }

  const handleEditJob = (job) => {
    setEditingJob(job)
    setShowJobForm(true)
  }

  const handleDeleteJob = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job?")) return

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      })
      if (response.ok) {
        toast({
          title: "Job deleted",
          description: "Job posting has been deleted successfully.",
        })
        loadJobs()
        loadMatches()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete job. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getJobMatches = (jobId) => {
    return matches.filter((match) => match.jobId === jobId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
          <p className="text-gray-600">Create and manage your job openings</p>
        </div>
        <Button onClick={() => setShowJobForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Job
        </Button>
      </div>

      {/* Job Form */}
      {showJobForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingJob ? "Edit Job" : "Create New Job"}</CardTitle>
            <CardDescription>
              {editingJob ? "Update job posting details" : "Add a new job posting to attract candidates"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JobForm
              job={editingJob}
              onSave={handleJobSaved}
              onCancel={() => {
                setShowJobForm(false)
                setEditingJob(null)
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No job postings yet</h3>
            <p className="text-gray-600 mb-4">Create your first job posting to start attracting candidates.</p>
            <Button onClick={() => setShowJobForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job) => {
            const jobMatches = getJobMatches(job.id)
            const avgScore =
              jobMatches.length > 0
                ? Math.round(jobMatches.reduce((sum, match) => sum + match.score, 0) / jobMatches.length)
                : 0

            return (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <CardDescription className="mt-2 text-base">{job.description}</CardDescription>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditJob(job)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteJob(job.id)}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <span>Required Skills:</span>
                        <Badge variant="secondary">{job.requiredSkills.length} skills</Badge>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {job.requiredSkills.map((skill) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{jobMatches.length} candidates matched</span>
                        </div>
                        {avgScore > 0 && (
                          <div className="flex items-center gap-1">
                            <span>Avg match score: </span>
                            <span
                              className={`font-medium ${
                                avgScore >= 80 ? "text-green-600" : avgScore >= 60 ? "text-yellow-600" : "text-red-600"
                              }`}
                            >
                              {avgScore}%
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Created {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function JobsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <JobsContent />
        </div>
      </div>
    </ProtectedRoute>
  )
}
