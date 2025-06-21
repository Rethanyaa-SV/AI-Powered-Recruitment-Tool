import { NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import jwt from "jsonwebtoken"

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

export async function POST(request) {
  const user = verifyToken(request)
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { resumeText } = await request.json()

    if (!resumeText) {
      return NextResponse.json({ message: "Resume text is required" }, { status: 400 })
    }

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: `You are an expert resume parser. Analyze the following resume text and extract structured information.

RESUME TEXT:
${resumeText}

Please extract and return the information in the following JSON format:
{
  "personalInfo": {
    "name": "Full name",
    "email": "Email address",
    "phone": "Phone number",
    "location": "Location/Address"
  },
  "skills": ["Array of technical and soft skills"],
  "experience": [
    {
      "company": "Company name",
      "position": "Job title",
      "duration": "Employment duration",
      "description": "Job description and achievements"
    }
  ],
  "education": [
    {
      "institution": "School/University name",
      "degree": "Degree type and field",
      "year": "Graduation year or duration"
    }
  ],
  "experienceSummary": "Brief summary of overall experience",
  "yearsOfExperience": "Number of years of professional experience",
  "seniorityLevel": "Junior/Mid/Senior based on experience"
}

Be thorough and accurate. If information is not available, use null or empty arrays. Return only valid JSON.`,
    })

    const cleanedText = text.replace(/```json|```/g, "").trim()
    const parsedData = JSON.parse(cleanedText)

    return NextResponse.json({
      success: true,
      data: parsedData,
    })
  } catch (error) {
    console.error("Resume analysis error:", error)

    // Fallback parsing logic
    const fallbackData = {
      personalInfo: {
        name: "Unknown",
        email: null,
        phone: null,
        location: null,
      },
      skills: [],
      experience: [],
      education: [],
      experienceSummary: "Unable to parse resume automatically",
      yearsOfExperience: 0,
      seniorityLevel: "Unknown",
    }

    return NextResponse.json({
      success: true,
      data: fallbackData,
      warning: "Resume parsed with limited accuracy. Please review and edit the information.",
    })
  }
}
