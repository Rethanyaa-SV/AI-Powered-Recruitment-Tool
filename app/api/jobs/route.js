import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// Mock database
const jobs = []

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

export async function GET(request) {
  const user = verifyToken(request)
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json(jobs.filter((job) => job.userId === user.userId))
}

export async function POST(request) {
  const user = verifyToken(request)
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { title, description, requiredSkills } = await request.json()

    const newJob = {
      id: Date.now().toString(),
      title,
      description,
      requiredSkills,
      createdAt: new Date().toISOString(),
      userId: user.userId,
    }

    jobs.push(newJob)

    // Trigger matching for new job
    await fetch(`${request.nextUrl.origin}/api/matches/generate`, {
      method: "POST",
      headers: {
        Authorization: request.headers.get("authorization") || "",
      },
    })

    return NextResponse.json(newJob)
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
