import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

// Mock database (shared with candidates/route.js)
const candidates = []

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

async function extractResumeText(file) {
  // In a real application, you would use a PDF/DOCX parser
  // For this demo, we'll simulate resume text extraction
  const fileName = file.name.toLowerCase()

  // Mock resume text based on file name for demo purposes
  const mockResumeTexts = [
    `John Smith
    Software Engineer
    Email: john.smith@email.com
    
    EXPERIENCE:
    Senior Software Engineer at TechCorp (2020-2023)
    - Developed web applications using React, Node.js, and MongoDB
    - Led a team of 5 developers on multiple projects
    - Implemented CI/CD pipelines using Docker and AWS
    
    Software Developer at StartupXYZ (2018-2020)
    - Built REST APIs using Python and Django
    - Worked with PostgreSQL and Redis
    - Collaborated with cross-functional teams
    
    EDUCATION:
    Bachelor of Science in Computer Science
    University of Technology (2014-2018)
    
    SKILLS:
    JavaScript, React, Node.js, Python, Django, MongoDB, PostgreSQL, AWS, Docker, Git`,

    `Sarah Johnson
    Data Scientist
    Email: sarah.johnson@email.com
    
    EXPERIENCE:
    Senior Data Scientist at DataCorp (2021-2023)
    - Developed machine learning models using Python and TensorFlow
    - Analyzed large datasets using SQL and Pandas
    - Created data visualizations with Tableau and matplotlib
    
    Data Analyst at Analytics Inc (2019-2021)
    - Performed statistical analysis on customer data
    - Built predictive models using R and scikit-learn
    - Collaborated with business stakeholders
    
    EDUCATION:
    Master of Science in Data Science
    Data University (2017-2019)
    
    Bachelor of Science in Mathematics
    Math College (2013-2017)
    
    SKILLS:
    Python, R, SQL, TensorFlow, scikit-learn, Pandas, Tableau, Statistics, Machine Learning`,

    `Mike Chen
    Product Manager
    Email: mike.chen@email.com
    
    EXPERIENCE:
    Senior Product Manager at ProductCorp (2020-2023)
    - Led product strategy for mobile applications
    - Managed cross-functional teams of 15+ people
    - Increased user engagement by 40% through feature optimization
    
    Product Manager at AppCompany (2018-2020)
    - Defined product roadmaps and requirements
    - Conducted user research and A/B testing
    - Worked closely with engineering and design teams
    
    EDUCATION:
    MBA in Business Administration
    Business School (2016-2018)
    
    Bachelor of Science in Engineering
    Engineering University (2012-2016)
    
    SKILLS:
    Product Strategy, Agile, Scrum, User Research, A/B Testing, Analytics, Leadership`,
  ]

  // Return a random mock resume for demo
  return mockResumeTexts[Math.floor(Math.random() * mockResumeTexts.length)]
}

async function extractCandidateInfo(resumeText) {
  try {
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: `Extract the following information from this resume text and return it as JSON:
      - name: candidate's full name
      - email: candidate's email address
      - skills: array of technical skills (programming languages, tools, technologies)
      - experience: brief summary of work experience (2-3 sentences)
      - education: highest education level and field of study

      Resume text:
      ${resumeText}

      Return only valid JSON without any markdown formatting.`,
    })

    // Parse the AI response
    const cleanedText = text.replace(/```json|```/g, "").trim()
    return JSON.parse(cleanedText)
  } catch (error) {
    console.error("AI extraction failed:", error)

    // Fallback: basic text parsing
    const lines = resumeText.split("\n")
    const name =
      lines
        .find(
          (line) =>
            line.trim() &&
            !line.includes("@") &&
            !line.includes("EXPERIENCE") &&
            !line.includes("EDUCATION") &&
            !line.includes("SKILLS"),
        )
        ?.trim() || "Unknown"
    const emailMatch = resumeText.match(/[\w.-]+@[\w.-]+\.\w+/)
    const email = emailMatch ? emailMatch[0] : "unknown@email.com"

    // Extract skills (look for common tech terms)
    const skillKeywords = [
      "JavaScript",
      "Python",
      "React",
      "Node.js",
      "Java",
      "C++",
      "SQL",
      "MongoDB",
      "PostgreSQL",
      "AWS",
      "Docker",
      "Git",
      "HTML",
      "CSS",
      "TypeScript",
      "Angular",
      "Vue",
      "Django",
      "Flask",
      "TensorFlow",
      "scikit-learn",
      "Pandas",
      "R",
      "Tableau",
      "Excel",
      "Agile",
      "Scrum",
    ]
    const skills = skillKeywords.filter((skill) => resumeText.toLowerCase().includes(skill.toLowerCase()))

    return {
      name,
      email,
      skills,
      experience: "Experience details extracted from resume",
      education: "Education details extracted from resume",
    }
  }
}

export async function POST(request) {
  const user = verifyToken(request)
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("resume")

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 })
    }

    // Extract text from resume
    const resumeText = await extractResumeText(file)

    // Use AI to extract structured information
    const candidateInfo = await extractCandidateInfo(resumeText)

    // Create candidate record
    const newCandidate = {
      id: Date.now().toString(),
      name: candidateInfo.name,
      email: candidateInfo.email,
      skills: candidateInfo.skills || [],
      experience: candidateInfo.experience || "",
      education: candidateInfo.education || "",
      resumeText,
      createdAt: new Date().toISOString(),
      userId: user.userId,
    }

    candidates.push(newCandidate)

    // Trigger matching for new candidate
    await fetch(`${request.nextUrl.origin}/api/matches/generate`, {
      method: "POST",
      headers: {
        Authorization: request.headers.get("authorization") || "",
      },
    })

    return NextResponse.json(newCandidate)
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ message: "Failed to process resume" }, { status: 500 })
  }
}
