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

export async function GET(request, { params }) {
  const user = verifyToken(request)
  if (!user || user.role !== "candidate") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    const application = await Application.findOne({
      candidateId: user.userId,
      jobId: params.jobId,
    }).lean()

    return NextResponse.json({
      hasApplied: !!application,
      application: application
        ? {
            ...application,
            id: application._id.toString(),
            _id: undefined,
          }
        : null,
    })
  } catch (error) {
    console.error("Error checking application status:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
