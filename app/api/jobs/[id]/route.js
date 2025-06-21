import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// Mock database (shared with jobs/route.js)
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

export async function PUT(request, { params }) {
  const user = verifyToken(request)
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { title, description, requiredSkills } = await request.json()
    const jobIndex = jobs.findIndex((job) => job.id === params.id && job.userId === user.userId)

    if (jobIndex === -1) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 })
    }

    jobs[jobIndex] = {
      ...jobs[jobIndex],
      title,
      description,
      requiredSkills,
    }

    // Trigger matching for updated job
    await fetch(`${request.nextUrl.origin}/api/matches/generate`, {
      method: "POST",
      headers: {
        Authorization: request.headers.get("authorization") || "",
      },
    })

    return NextResponse.json(jobs[jobIndex])
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const user = verifyToken(request)
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const jobIndex = jobs.findIndex((job) => job.id === params.id && job.userId === user.userId)

  if (jobIndex === -1) {
    return NextResponse.json({ message: "Job not found" }, { status: 404 })
  }

  jobs.splice(jobIndex, 1)
  return NextResponse.json({ message: "Job deleted successfully" })
}
