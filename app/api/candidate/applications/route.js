import { NextResponse } from "next/server"
import connectDB from "@/lib/mongoose"
import Application from "@/models/Application"
import Job from "@/models/Job"
import User from "@/models/User"
import jwt from "jsonwebtoken"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

function verifyToken(request) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  try {
    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
    return decoded
  } catch (error) {
    return null
  }
}

async function generateAIAssessment(resumeData, job) {
  try {
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: `You are an expert recruiter AI. Analyze this candidate's resume against the job requirements and provide a comprehensive assessment.

CANDIDATE RESUME DATA:
Name: ${resumeData.personalInfo?.name || "Unknown"}
Skills: ${resumeData.skills?.join(", ") || "None listed"}
Experience: ${resumeData.experienceSummary || "No experience summary"}
Education: ${resumeData.education?.map((e) => `${e.degree} from ${e.institution}`).join(", ") || "No education info"}
Years of Experience: ${resumeData.yearsOfExperience || "Unknown"}
Seniority Level: ${resumeData.seniorityLevel || "Unknown"}

JOB REQUIREMENTS:
Title: ${job.title}
Company: ${job.company || "Company"}
Required Skills: ${job.skills?.join(", ") || "None specified"}
Job Description: ${job.description}
Requirements: ${job.requirements}

Please provide a detailed assessment in the following JSON format:
{
  "overallScore": 85,
  "skillsMatch": 80,
  "experienceMatch": 90,
  "qualificationMatch": 75,
  "recommendation": "Highly Recommended",
  "recommendationReason": "Brief explanation for the recommendation",
  "keyStrengths": ["Array of candidate's key strengths relevant to this role"],
  "concerns": ["Array of potential concerns or gaps"],
  "summary": "2-3 sentence summary of the candidate's fit for this role",
  "matchedSkills": ["Array of skills that match between candidate and job requirements"],
  "missingSkills": ["Array of important skills the candidate lacks"],
  "experienceLevel": "Assessment of candidate's experience level for this role",
  "cultureFit": 80,
  "growthPotential": 85
}

Be thorough, fair, and provide actionable insights. Return only valid JSON.`,
    })

    const cleanedText = text.replace(/```json|```/g, "").trim()
    return JSON.parse(cleanedText)
  } catch (error) {
    console.error("AI assessment failed:", error)

    // Fallback assessment
    const candidateSkills = resumeData.skills || []
    const jobSkills = job.skills || []

    const matchedSkills = candidateSkills.filter((skill) =>
      jobSkills.some(
        (jobSkill) =>
          jobSkill.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(jobSkill.toLowerCase()),
      ),
    )

    const skillsMatchPercentage = jobSkills.length > 0 ? Math.round((matchedSkills.length / jobSkills.length) * 100) : 0
    const experienceScore = resumeData.seniorityLevel === "Senior" ? 85 : resumeData.seniorityLevel === "Mid" ? 70 : 50
    const overallScore = Math.round(skillsMatchPercentage * 0.6 + experienceScore * 0.4)

    return {
      overallScore,
      skillsMatch: skillsMatchPercentage,
      experienceMatch: experienceScore,
      qualificationMatch: 75,
      recommendation:
        overallScore >= 80
          ? "Highly Recommended"
          : overallScore >= 65
            ? "Recommended"
            : overallScore >= 50
              ? "Consider"
              : "Not Recommended",
      recommendationReason: `Candidate shows ${skillsMatchPercentage}% skills match with ${matchedSkills.length} relevant skills.`,
      keyStrengths: matchedSkills.slice(0, 3),
      concerns: jobSkills.filter((skill) => !matchedSkills.includes(skill)).slice(0, 2),
      summary: `Candidate has relevant experience and ${matchedSkills.length} matching skills for this ${job.title} position.`,
      matchedSkills,
      missingSkills: jobSkills.filter((skill) => !matchedSkills.includes(skill)),
      experienceLevel: resumeData.seniorityLevel || "Mid",
      cultureFit: 75,
      growthPotential: 80,
    }
  }
}

export async function GET(request) {
  const user = verifyToken(request)
  if (!user || user.role !== "candidate") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    const applications = await Application.find({ candidateId: user.userId })
      .populate("jobId", "title company location type salary")
      .sort({ appliedAt: -1 })
      .lean()

    const applicationsWithIds = applications.map((app) => ({
      ...app,
      id: app._id.toString(),
      _id: undefined,
      jobId: app.jobId
        ? {
            ...app.jobId,
            id: app.jobId._id.toString(),
            _id: undefined,
          }
        : null,
    }))

    return NextResponse.json(applicationsWithIds)
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  const user = verifyToken(request)
  if (!user || user.role !== "candidate") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    const { jobId, coverLetter, resumeData } = await request.json()

    // Check if already applied
    const existingApplication = await Application.findOne({
      candidateId: user.userId,
      jobId: jobId,
    })

    if (existingApplication) {
      return NextResponse.json({ message: "Already applied to this job" }, { status: 400 })
    }

    // Get job details
    const job = await Job.findById(jobId).lean()
    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 })
    }

    // Get candidate details
    const candidate = await User.findById(user.userId).lean()

    // Generate AI assessment
    const aiAssessment = await generateAIAssessment(resumeData, job)

    const newApplication = new Application({
      candidateId: user.userId,
      candidateName: resumeData.personalInfo?.name || candidate?.name || "Unknown",
      jobId,
      jobTitle: job.title,
      company: job.company || "Company",
      recruiterId: job.recruiterId,
      coverLetter: coverLetter || "",
      resumeData,
      aiAssessment,
      status: "pending",
      matchScore: aiAssessment.overallScore,
    })

    await newApplication.save()

    // Update job applications count
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } })

    return NextResponse.json({
      ...newApplication.toObject(),
      id: newApplication._id.toString(),
      _id: undefined,
    })
  } catch (error) {
    console.error("Application submission error:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
