import { NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function verifyToken(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return null;
    }
    return session.user;
  } catch (error) {
    return null;
  }
}

export async function POST(request) {
  const user = await verifyToken(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { resumeText } = await request.json();
    console.log(resumeText);
    if (!resumeText) {
      return NextResponse.json(
        { message: "Resume text is required" },
        { status: 400 }
      );
    }

    console.log(resumeText);

    const generated = await generateText({
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
    });

    console.log(generated);

    const { text } = generated;

    const cleanedText = text.replace(/```json|```/g, "").trim();
    const parsedData = JSON.parse(cleanedText);

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error) {
    console.error("Resume analysis error:", error);

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
    };

    return NextResponse.json({
      success: true,
      data: fallbackData,
      warning:
        "Resume parsed with limited accuracy. Please review and edit the information.",
    });
  }
}
