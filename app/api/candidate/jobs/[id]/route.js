import { NextResponse } from "next/server"
import connectDB from "@/lib/mongoose"
import Job from "@/models/Job"
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

export async function GET(request, { params }) {
  const user = verifyToken(request)
  if (!user || user.role !== "candidate") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    const job = await Job.findOne({ _id: params.id, status: "active" }).lean()

    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...job,
      id: job._id.toString(),
      _id: undefined,
      matchScore: Math.floor(Math.random() * 40) + 60, // Mock match score
    })
  } catch (error) {
    console.error("Error fetching job:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
