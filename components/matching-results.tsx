"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

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

interface MatchingResultsProps {
  jobs: Job[]
  candidates: Candidate[]
  matches: Match[]
}

export function MatchingResults({ jobs, candidates, matches }: MatchingResultsProps) {
  const getJobById = (id: string) => jobs.find((job) => job.id === id)
  const getCandidateById = (id: string) => candidates.find((candidate) => candidate.id === id)

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreVariant = (score: number) => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  // Group matches by job
  const matchesByJob = jobs.map((job) => ({
    job,
    matches: matches
      .filter((match) => match.jobId === job.id)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5), // Top 5 candidates per job
  }))

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">
            No matches found. Upload candidates and create job postings to see AI matching results.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {matchesByJob.map(({ job, matches: jobMatches }) => (
        <Card key={job.id}>
          <CardHeader>
            <CardTitle>{job.title}</CardTitle>
            <CardDescription>
              Top candidates matched for this position ({jobMatches.length} total matches)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {jobMatches.length === 0 ? (
              <p className="text-gray-500 text-sm">No candidates matched for this job yet.</p>
            ) : (
              <div className="space-y-4">
                {jobMatches.map((match) => {
                  const candidate = getCandidateById(match.candidateId)
                  if (!candidate) return null

                  return (
                    <div key={match.candidateId} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{candidate.name}</h4>
                          <p className="text-sm text-gray-600">{candidate.email}</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(match.score)}`}>{match.score}%</div>
                          <p className="text-xs text-gray-500">Match Score</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <Progress value={match.score} className="h-2" />
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h5 className="text-sm font-medium mb-2">Matched Skills:</h5>
                          <div className="flex flex-wrap gap-1">
                            {match.matchedSkills.map((skill) => (
                              <Badge key={skill} variant="default" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium mb-1">All Candidate Skills:</h5>
                          <div className="flex flex-wrap gap-1">
                            {candidate.skills.map((skill) => (
                              <Badge
                                key={skill}
                                variant={match.matchedSkills.includes(skill) ? "default" : "outline"}
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h5 className="font-medium mb-1">Experience:</h5>
                            <p className="text-gray-600">{candidate.experience}</p>
                          </div>
                          <div>
                            <h5 className="font-medium mb-1">Education:</h5>
                            <p className="text-gray-600">{candidate.education}</p>
                          </div>
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
  )
}
