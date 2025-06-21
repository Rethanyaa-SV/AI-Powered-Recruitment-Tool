import { NextResponse } from "next/server"
import connectDB from "@/lib/mongoose"
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

async function extractResumeText(file) {
  // In a real application, you would use a PDF/DOCX parser
  // For this demo, we'll simulate resume text extraction
  const fileName = file.name.toLowerCase()

  // Mock resume text based on file name for demo purposes
  const mockResumeTexts = [
    `John Smith
    Software Engineer
    Email: john.smith@email.com
    Phone: (555) 123-4567
    Location: San Francisco, CA
    
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
    Phone: (555) 987-6543
    Location: New York, NY
    
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
  ]

  // Return a random mock resume for demo
  return mockResumeTexts[Math.floor(Math.random() * mockResumeTexts.length)]
}

async function extractCandidateInfo(resumeText) {
  try {
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: `Extract the following information from this resume text and return it as JSON:

Resume text:
${resumeText}

Please extract and return the following information in this exact JSON format:
{
  "personalInfo": {
    "name": "candidate's full name",
    "email": "candidate's email address",
    "phone": "phone number if available",
    "location": "location/address if available"
  },
  "skills": ["array", "of", "technical", "skills"],
  "experience": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "duration": "2020-2023",
      "description": "Brief description of role and achievements"
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Degree Name",
      "year": "Graduation Year"
    }
  ],
  "experienceSummary": "2-3 sentence summary of work experience",
  "yearsOfExperience": 5,
  "seniorityLevel": "Junior/Mid/Senior/Lead"
}

Return only valid JSON without any markdown formatting.`,
    })

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
    const email = emailMatch ? emailMatch[0] : ""

    const phoneMatch = resumeText.match(/$$?\d{3}$$?[-.\s]?\d{3}[-.\s]?\d{4}/)
    const phone = phoneMatch ? phoneMatch[0] : ""

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
      personalInfo: {
        name,
        email,
        phone,
        location: "",
      },
      skills,
      experience: [],
      education: [],
      experienceSummary: "Experience details extracted from resume",
      yearsOfExperience: 3,
      seniorityLevel: "Mid",
    }
  }
}

export async function POST(request) {
  const user = verifyToken(request)
  if (!user || user.role !== "candidate") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    const formData = await request.formData()
    const file = formData.get("resume")

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 })
    }

    // Extract text from resume
    const resumeText = await extractResumeText(file)

    // Use AI to extract structured information
    const resumeData = await extractCandidateInfo(resumeText)

    // Update user's resume data in database
    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      {
        resumeData,
        profileComplete: true,
      },
      { new: true },
    ).select("-password")

    return NextResponse.json({
      message: "Resume processed successfully",
      resumeData,
      user: {
        ...updatedUser.toObject(),
        id: updatedUser._id.toString(),
        _id: undefined,
      },
    })
  } catch (error) {
    console.error("Resume upload error:", error)
    return NextResponse.json({ message: "Failed to process resume" }, { status: 500 })
  }
}
