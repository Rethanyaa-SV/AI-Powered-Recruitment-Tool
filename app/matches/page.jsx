"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Target, TrendingUp, Users, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"

function MatchesContent() {
  const [jobs, setJobs] = useState([])
  const [candidates, setCandidates] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState(null)

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      const token = localStorage.getItem("auth-token")
      const headers = { Authorization: `Bearer ${token}` }

      const [jobsRes, candidatesRes, matchesRes] = await Promise.all([
        fetch("/api/jobs", { headers }),
        fetch("/api/candidates", { headers }),
        fetch("/api/matches", { headers }),
      ])

      const jobsData = await jobsRes.json()
      const candidatesData = await candidatesRes.json()
      const matchesData = await matchesRes.json()

      setJobs(jobsData)
      setCandidates(candidatesData)
      setMatches(matchesData)
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getJobById = (id) => jobs.find((job) => job.id === id)
  const getCandidateById = (id) => candidates.find((candidate) => candidate.id === id)

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBgColor = (score) => {
    if (score >= 80) return "bg-green-50 border-green-200"
    if (score >= 60) return "bg-yellow-50 border-yellow-200"
    return "bg-red-50 border-red-200"
  }

  // Group matches by job
  const matchesByJob = jobs.map((job) => ({
    job,
    matches: matches
      .filter((match) => match.jobId === job.id)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10), // Top 10 candidates per job
  }))

  // Overall statistics
  const totalMatches = matches.length
  const avgScore =
    matches.length > 0 ? Math.round(matches.reduce((sum, match) => sum + match.score, 0) / matches.length) : 0
  const excellentMatches = matches.filter((match) => match.score >= 80).length
  const goodMatches = matches.filter((match) => match.score >= 60 && match.score < 80).length

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Matching Results</h1>
        <p className="text-gray-600">Intelligent candidate-job matching powered by AI analysis</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMatches}</div>
            <p className="text-xs text-muted-foreground">AI-generated matches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore}%</div>
            <p className="text-xs text-muted-foreground">Match quality</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Excellent Matches</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{excellentMatches}</div>
            <p className="text-xs text-muted-foreground">80%+ match score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Good Matches</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{goodMatches}</div>
            <p className="text-xs text-muted-foreground">60-79% match score</p>
          </CardContent>
        </Card>
      </div>

      {/* Job Filter */}
      {jobs.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Filter by Job</CardTitle>
            <CardDescription>Select a specific job to view its matches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedJob === null ? "default" : "outline"}
                onClick={() => setSelectedJob(null)}
                size="sm"
              >
                All Jobs
              </Button>
              {jobs.map((job) => (
                <Button
                  key={job.id}
                  variant={selectedJob === job.id ? "default" : "outline"}
                  onClick={() => setSelectedJob(job.id)}
                  size="sm"
                >
                  {job.title}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matches Results */}
      {matches.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-600 mb-4">Upload candidates and create job postings to see AI matching results.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {matchesByJob
            .filter(({ job }) => selectedJob === null || job.id === selectedJob)
            .map(({ job, matches: jobMatches }) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {jobMatches.length} candidates matched • Avg score:{" "}
                        {jobMatches.length > 0
                          ? Math.round(jobMatches.reduce((sum, match) => sum + match.score, 0) / jobMatches.length)
                          : 0}
                        %
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{job.requiredSkills.length} required skills</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {jobMatches.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No candidates matched for this job yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {jobMatches.map((match) => {
                        const candidate = getCandidateById(match.candidateId)
                        if (!candidate) return null

                        return (
                          <div
                            key={match.candidateId}
                            className={`border rounded-lg p-4 ${getScoreBgColor(match.score)}`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h4 className="font-medium text-lg">{candidate.name}</h4>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <span>{candidate.email}</span>
                                </p>
                              </div>
                              <div className="text-right">
                                <div className={`text-3xl font-bold ${getScoreColor(match.score)}`}>{match.score}%</div>
                                <p className="text-xs text-gray-500">Match Score</p>
                              </div>
                            </div>

                            <div className="mb-4">
                              <Progress value={match.score} className="h-3" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div>
                                <h5 className="text-sm font-medium mb-2 text-green-700">
                                  Matched Skills ({match.matchedSkills.length}):
                                </h5>
                                <div className="flex flex-wrap gap-1">
                                  {match.matchedSkills.map((skill) => (
                                    <Badge
                                      key={skill}
                                      variant="default"
                                      className="text-xs bg-green-100 text-green-800"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h5 className="text-sm font-medium mb-2 text-gray-700">Other Skills:</h5>
                                <div className="flex flex-wrap gap-1">
                                  {candidate.skills
                                    .filter((skill) => !match.matchedSkills.includes(skill))
                                    .map((skill) => (
                                      <Badge key={skill} variant="outline" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                              <div>
                                <h5 className="font-medium mb-1 text-sm">Experience:</h5>
                                <p className="text-sm text-gray-600 bg-white/50 p-2 rounded">{candidate.experience}</p>
                              </div>
                              <div>
                                <h5 className="font-medium mb-1 text-sm">Education:</h5>
                                <p className="text-sm text-gray-600 bg-white/50 p-2 rounded">{candidate.education}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}

export default function MatchesPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MatchesContent />
        </div>
      </div>
    </ProtectedRoute>
  )
}
