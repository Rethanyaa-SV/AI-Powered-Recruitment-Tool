"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { JobForm } from "@/components/job-form"
import { CandidateUpload } from "@/components/candidate-upload"
import { MatchingResults } from "@/components/matching-results"
import { Plus, Briefcase, Users, TrendingUp, LogOut } from "lucide-react"

interface Job {
  id: string
  title: string
  description: string
  requiredSkills: string[]
  createdAt: string
}

interface Candidate {
  id: string
  name: string
  email: string
  skills: string[]
  experience: string
  education: string
  resumeText: string
  createdAt: string
}

interface Match {
  candidateId: string
  jobId: string
  score: number
  matchedSkills: string[]
}

export function Dashboard() {
  const { user, logout } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [showJobForm, setShowJobForm] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)

  useEffect(() => {
    loadJobs()
    loadCandidates()
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
    }
  }

  const loadCandidates = async () => {
    try {
      const response = await fetch("/api/candidates", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setCandidates(data)
      }
    } catch (error) {
      console.error("Failed to load candidates:", error)
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
    loadMatches() // Reload matches when jobs change
  }

  const handleCandidateUploaded = () => {
    loadCandidates()
    loadMatches() // Reload matches when candidates change
  }

  const handleEditJob = (job: Job) => {
    setEditingJob(job)
    setShowJobForm(true)
  }

  const handleDeleteJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      })
      if (response.ok) {
        loadJobs()
        loadMatches()
      }
    } catch (error) {
      console.error("Failed to delete job:", error)
    }
  }

  const getJobMatches = (jobId: string) => {
    return matches.filter((match) => match.jobId === jobId)
  }

  const getCandidateMatches = (candidateId: string) => {
    return matches.filter((match) => match.candidateId === candidateId)
  }

  const averageMatchScore =
    matches.length > 0 ? Math.round(matches.reduce((sum, match) => sum + match.score, 0) / matches.length) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Recruitment Tool</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobs.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{candidates.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{matches.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Match Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageMatchScore}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="jobs">Job Postings</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="matches">AI Matching</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Job Postings</h2>
              <Button onClick={() => setShowJobForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Job
              </Button>
            </div>

            {showJobForm && (
              <Card>
                <CardHeader>
                  <CardTitle>{editingJob ? "Edit Job" : "Create New Job"}</CardTitle>
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

            <div className="grid gap-6">
              {jobs.map((job) => (
                <Card key={job.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{job.title}</CardTitle>
                        <CardDescription className="mt-2">{job.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditJob(job)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteJob(job.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Required Skills:</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.requiredSkills.map((skill) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">{getJobMatches(job.id).length} candidates matched</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="candidates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Candidates</h2>
            </div>

            <CandidateUpload onUpload={handleCandidateUploaded} />

            <div className="grid gap-6">
              {candidates.map((candidate) => (
                <Card key={candidate.id}>
                  <CardHeader>
                    <CardTitle>{candidate.name}</CardTitle>
                    <CardDescription>{candidate.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Skills:</h4>
                        <div className="flex flex-wrap gap-2">
                          {candidate.skills.map((skill) => (
                            <Badge key={skill} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Experience:</h4>
                        <p className="text-sm text-gray-600">{candidate.experience}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Education:</h4>
                        <p className="text-sm text-gray-600">{candidate.education}</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        {getCandidateMatches(candidate.id).length} job matches
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="matches" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">AI Matching Results</h2>
            </div>

            <MatchingResults jobs={jobs} candidates={candidates} matches={matches} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
