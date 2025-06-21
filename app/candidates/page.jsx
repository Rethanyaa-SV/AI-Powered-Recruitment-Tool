"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { CandidateUpload } from "@/components/candidate-upload"
import { Users, Mail, GraduationCap, Briefcase, Target } from "lucide-react"

function CandidatesContent() {
  const [candidates, setCandidates] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCandidates()
    loadMatches()
  }, [])

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

  const handleCandidateUploaded = () => {
    loadCandidates()
    loadMatches()
  }

  const getCandidateMatches = (candidateId) => {
    return matches.filter((match) => match.candidateId === candidateId)
  }

  const getCandidateTopScore = (candidateId) => {
    const candidateMatches = getCandidateMatches(candidateId)
    return candidateMatches.length > 0 ? Math.max(...candidateMatches.map((match) => match.score)) : 0
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
        <p className="text-gray-600">Upload and manage candidate profiles with AI-powered resume analysis</p>
      </div>

      {/* Upload Section */}
      <CandidateUpload onUpload={handleCandidateUploaded} />

      {/* Candidates List */}
      {candidates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates yet</h3>
            <p className="text-gray-600 mb-4">
              Upload your first resume to get started with AI-powered candidate analysis.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Candidate Profiles ({candidates.length})</h2>
            <div className="text-sm text-gray-600">Sorted by match score</div>
          </div>

          <div className="grid gap-6">
            {candidates
              .sort((a, b) => getCandidateTopScore(b.id) - getCandidateTopScore(a.id))
              .map((candidate) => {
                const candidateMatches = getCandidateMatches(candidate.id)
                const topScore = getCandidateTopScore(candidate.id)
                const avgScore =
                  candidateMatches.length > 0
                    ? Math.round(
                        candidateMatches.reduce((sum, match) => sum + match.score, 0) / candidateMatches.length,
                      )
                    : 0

                return (
                  <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl flex items-center gap-2">
                            {candidate.name}
                            {topScore > 0 && (
                              <Badge
                                variant={topScore >= 80 ? "default" : topScore >= 60 ? "secondary" : "outline"}
                                className="ml-2"
                              >
                                {topScore}% match
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <Mail className="h-4 w-4" />
                            {candidate.email}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">{candidateMatches.length} job matches</div>
                          {avgScore > 0 && <div className="text-xs text-gray-500">Avg: {avgScore}%</div>}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Skills */}
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Skills ({candidate.skills.length})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {candidate.skills.map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Experience */}
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            Experience
                          </h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{candidate.experience}</p>
                        </div>

                        {/* Education */}
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            Education
                          </h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{candidate.education}</p>
                        </div>

                        {/* Match Summary */}
                        {candidateMatches.length > 0 && (
                          <div className="pt-4 border-t">
                            <h4 className="font-medium mb-2">Match Summary</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="font-medium text-gray-900">{candidateMatches.length}</div>
                                <div className="text-gray-600">Total Matches</div>
                              </div>
                              <div>
                                <div
                                  className={`font-medium ${
                                    topScore >= 80
                                      ? "text-green-600"
                                      : topScore >= 60
                                        ? "text-yellow-600"
                                        : "text-red-600"
                                  }`}
                                >
                                  {topScore}%
                                </div>
                                <div className="text-gray-600">Best Match</div>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{avgScore}%</div>
                                <div className="text-gray-600">Avg Score</div>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {new Date(candidate.createdAt).toLocaleDateString()}
                                </div>
                                <div className="text-gray-600">Added</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CandidatesPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CandidatesContent />
        </div>
      </div>
    </ProtectedRoute>
  )
}
