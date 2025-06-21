import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// Mock databases (shared with other routes)
const jobs = []
const candidates = []
let matches = []

function verifyToken(request) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  try {
    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, "your-secret-key")
    return decoded
  } catch (error) {
    return null
  }
}

function calculateMatchScore(candidateSkills, jobSkills, candidateText, jobDescription) {
  // Normalize skills for comparison
  const normalizeSkill = (skill) => skill.toLowerCase().trim()

  const normalizedCandidateSkills = candidateSkills.map(normalizeSkill)
  const normalizedJobSkills = jobSkills.map(normalizeSkill)

  // Find exact skill matches
  const exactMatches = normalizedJobSkills.filter((jobSkill) => normalizedCandidateSkills.includes(jobSkill))

  // Find partial matches in resume text
  const partialMatches = normalizedJobSkills.filter(
    (jobSkill) => !exactMatches.includes(jobSkill) && candidateText.toLowerCase().includes(jobSkill),
  )

  // Calculate base score from skill matches
  const totalJobSkills = jobSkills.length
  const exactMatchWeight = 0.8
  const partialMatchWeight = 0.3

  const exactScore = (exactMatches.length / totalJobSkills) * exactMatchWeight * 100
  const partialScore = (partialMatches.length / totalJobSkills) * partialMatchWeight * 100

  let baseScore = exactScore + partialScore

  // Bonus for experience keywords in job description
  const experienceKeywords = ["senior", "lead", "manager", "architect", "principal"]
  const hasExperienceMatch = experienceKeywords.some(
    (keyword) => jobDescription.toLowerCase().includes(keyword) && candidateText.toLowerCase().includes(keyword),
  )

  if (hasExperienceMatch) {
    baseScore += 10
  }

  // Cap at 100%
  const finalScore = Math.min(Math.round(baseScore), 100)

  // Get original case matched skills
  const matchedSkills = jobSkills.filter(
    (jobSkill) => exactMatches.includes(normalizeSkill(jobSkill)) || partialMatches.includes(normalizeSkill(jobSkill)),
  )

  return { score: finalScore, matchedSkills }
}

export async function POST(request) {
  const user = verifyToken(request)
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    // Clear existing matches for this user
    matches = matches.filter((match) => {
      const job = jobs.find((j) => j.id === match.jobId)
      const candidate = candidates.find((c) => c.id === match.candidateId)
      return job?.userId !== user.userId || candidate?.userId !== user.userId
    })

    // Get user's jobs and candidates
    const userJobs = jobs.filter((job) => job.userId === user.userId)
    const userCandidates = candidates.filter((candidate) => candidate.userId === user.userId)

    // Generate matches for all job-candidate combinations
    for (const job of userJobs) {
      for (const candidate of userCandidates) {
        const { score, matchedSkills } = calculateMatchScore(
          candidate.skills,
          job.requiredSkills,
          candidate.resumeText,
          job.description,
        )

        // Only store matches with score > 0
        if (score > 0) {
          matches.push({
            candidateId: candidate.id,
            jobId: job.id,
            score,
            matchedSkills,
          })
        }
      }
    }

    return NextResponse.json({ message: "Matches generated successfully", count: matches.length })
  } catch (error) {
    console.error("Match generation error:", error)
    return NextResponse.json({ message: "Failed to generate matches" }, { status: 500 })
  }
}
