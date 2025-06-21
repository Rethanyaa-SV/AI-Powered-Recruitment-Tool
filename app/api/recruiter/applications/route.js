import { NextResponse } from "next/server"
import connectDB from "@/lib/mongoose"
import Application from "@/models/Application"
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

export async function GET(request) {
  const user = verifyToken(request)
  if (!user || user.role !== "recruiter") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 10
    const status = searchParams.get("status")
    const jobId = searchParams.get("jobId")
    const search = searchParams.get("search")

    // Build query
    const query = { recruiterId: user.userId }

    if (status && status !== "all") {
      query.status = status
    }

    if (jobId) {
      query.jobId = jobId
    }

    if (search) {
      query.$or = [
        { candidateName: { $regex: search, $options: "i" } },
        { jobTitle: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ]
    }

    // Get applications with pagination
    const applications = await Application.find(query)
      .populate("jobId", "title company location type")
      .populate("candidateId", "name email profile")
      .sort({ appliedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const totalApplications = await Application.countDocuments(query)
    const totalPages = Math.ceil(totalApplications / limit)

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
      candidateId: app.candidateId
        ? {
            ...app.candidateId,
            id: app.candidateId._id.toString(),
            _id: undefined,
          }
        : null,
    }))

    return NextResponse.json({
      applications: applicationsWithIds,
      pagination: {
        currentPage: page,
        totalPages,
        totalApplications,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
