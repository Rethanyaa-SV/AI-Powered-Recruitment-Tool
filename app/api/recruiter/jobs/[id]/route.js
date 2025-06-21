import { NextResponse } from "next/server"
import connectDB from "@/lib/mongoose"
import Job from "@/models/Job"
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

export async function GET(request, { params }) {
  const user = verifyToken(request)
  if (!user || user.role !== "recruiter") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    const job = await Job.findOne({ _id: params.id, recruiterId: user.userId }).lean()

    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...job,
      id: job._id.toString(),
      _id: undefined,
    })
  } catch (error) {
    console.error("Error fetching job:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  const user = verifyToken(request)
  if (!user || user.role !== "recruiter") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    const { title, description, requirements, location, type, salary, skills, company, status } = await request.json()

    // Validation
    if (!title || !description || !location || !type) {
      return NextResponse.json({ message: "Required fields are missing" }, { status: 400 })
    }

    const updatedJob = await Job.findOneAndUpdate(
      { _id: params.id, recruiterId: user.userId },
      {
        title,
        description,
        requirements: requirements || "",
        location,
        type,
        salary,
        skills: skills || [],
        company: company || "",
        status: status || "active",
      },
      { new: true, runValidators: true },
    ).lean()

    if (!updatedJob) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...updatedJob,
      id: updatedJob._id.toString(),
      _id: undefined,
    })
  } catch (error) {
    console.error("Error updating job:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const user = verifyToken(request)
  if (!user || user.role !== "recruiter") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    const job = await Job.findOneAndDelete({ _id: params.id, recruiterId: user.userId })

    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 })
    }

    // Also delete all applications for this job
    await Application.deleteMany({ jobId: params.id })

    return NextResponse.json({ message: "Job deleted successfully" })
  } catch (error) {
    console.error("Error deleting job:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
