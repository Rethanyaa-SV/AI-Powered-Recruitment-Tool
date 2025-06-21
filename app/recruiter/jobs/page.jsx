"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, MapPin, Clock, DollarSign, Users } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { AdaptiveNavbar } from "@/components/adaptive-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function RecruiterJobsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    type: "Full-time",
    salary: "",
    skills: "",
  })

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/recruiter/jobs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setJobs(data)
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("auth-token")
      const skillsArray = formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s)

      const jobData = {
        ...formData,
        skills: skillsArray,
      }

      const url = editingJob ? `/api/recruiter/jobs/${editingJob.id}` : "/api/recruiter/jobs"
      const method = editingJob ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jobData),
      })

      if (response.ok) {
        const savedJob = await response.json()

        if (editingJob) {
          setJobs(jobs.map((job) => (job.id === editingJob.id ? savedJob : job)))
          toast({
            title: "Job Updated",
            description: "Job posting has been updated successfully.",
          })
        } else {
          setJobs([savedJob, ...jobs])
          toast({
            title: "Job Created",
            description: "New job posting has been created successfully.",
          })
        }

        resetForm()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to save job posting.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving job:", error)
      toast({
        title: "Error",
        description: "Failed to save job posting.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (job) => {
    setEditingJob(job)
    setFormData({
      title: job.title,
      description: job.description,
      requirements: job.requirements || "",
      location: job.location,
      type: job.type,
      salary: job.salary || "",
      skills: job.skills ? job.skills.join(", ") : "",
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return

    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch(`/api/recruiter/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setJobs(jobs.filter((job) => job.id !== jobId))
        toast({
          title: "Job Deleted",
          description: "Job posting has been deleted successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete job posting.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting job:", error)
      toast({
        title: "Error",
        description: "Failed to delete job posting.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      requirements: "",
      location: "",
      type: "Full-time",
      salary: "",
      skills: "",
    })
    setEditingJob(null)
    setShowCreateForm(false)
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["recruiter"]}>
        <div className="min-h-screen bg-gray-50">
          <AdaptiveNavbar />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
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
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Postings</h1>
              <p className="text-gray-600">Manage your job postings and track applications</p>
            </div>
            <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Post New Job
            </Button>
          </div>

          {/* Job Creation/Edit Form */}
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingJob ? "Edit Job Posting" : "Create New Job Posting"}</DialogTitle>
                <DialogDescription>
                  {editingJob ? "Update the job posting details" : "Fill in the details for your new job posting"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Senior Frontend Developer"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., San Francisco, CA"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Job Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Remote">Remote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="salary">Salary Range</Label>
                  <Input
                    id="salary"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="e.g., $80,000 - $120,000"
                  />
                </div>

                <div>
                  <Label htmlFor="skills">Required Skills *</Label>
                  <Input
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="e.g., React, JavaScript, Node.js (comma-separated)"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Separate skills with commas</p>
                </div>

                <div>
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                    rows={6}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="List the specific requirements, qualifications, and experience needed..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingJob ? "Update Job" : "Create Job"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Jobs List */}
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">{job.title}</CardTitle>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {job.type}
                        </div>
                        {job.salary && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {job.salary}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {job.applicationsCount || 0} applications
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          job.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }
                      >
                        {job.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(job)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(job.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>

                  {job.skills && job.skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-900 mb-2">Required Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                    <span>Job ID: {job.id}</span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {jobs.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 8v10a2 2 0 002 2h4a2 2 0 002-2V8"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No job postings yet</h3>
                  <p className="text-gray-600 mb-4">
                    Create your first job posting to start receiving applications from qualified candidates.
                  </p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Post Your First Job
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
