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

export async function GET(request) {
  const user = verifyToken(request)
  if (!user || user.role !== "recruiter") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    // Get basic stats
    const totalJobs = await Job.countDocuments({ recruiterId: user.userId })
    const activeJobs = await Job.countDocuments({ recruiterId: user.userId, status: "active" })
    const totalApplications = await Application.countDocuments({ recruiterId: user.userId })
    const pendingApplications = await Application.countDocuments({ recruiterId: user.userId, status: "pending" })

    // Get application status breakdown
    const applicationStats = await Application.aggregate([
      { $match: { recruiterId: user.userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ])

    // Get recent applications (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentApplications = await Application.countDocuments({
      recruiterId: user.userId,
      appliedAt: { $gte: thirtyDaysAgo },
    })

    // Get top performing jobs
    const topJobs = await Application.aggregate([
      { $match: { recruiterId: user.userId } },
      { $group: { _id: "$jobId", count: { $sum: 1 }, jobTitle: { $first: "$jobTitle" } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ])

    return NextResponse.json({
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApplications,
      recentApplications,
      applicationStatusBreakdown: applicationStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count
        return acc
      }, {}),
      topPerformingJobs: topJobs,
    })
  } catch (error) {
    console.error("Error fetching recruiter stats:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
