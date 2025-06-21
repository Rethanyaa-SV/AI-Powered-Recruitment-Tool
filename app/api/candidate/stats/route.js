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
  if (!user || user.role !== "candidate") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    // Get basic stats
    const totalApplications = await Application.countDocuments({ candidateId: user.userId })
    const pendingApplications = await Application.countDocuments({ candidateId: user.userId, status: "pending" })
    const acceptedApplications = await Application.countDocuments({ candidateId: user.userId, status: "accepted" })
    const rejectedApplications = await Application.countDocuments({ candidateId: user.userId, status: "rejected" })

    // Get application status breakdown
    const applicationStats = await Application.aggregate([
      { $match: { candidateId: user.userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ])

    // Get average match score
    const matchScoreStats = await Application.aggregate([
      { $match: { candidateId: user.userId, matchScore: { $exists: true } } },
      { $group: { _id: null, avgScore: { $avg: "$matchScore" }, maxScore: { $max: "$matchScore" } } },
    ])

    // Get recent applications (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentApplications = await Application.countDocuments({
      candidateId: user.userId,
      appliedAt: { $gte: thirtyDaysAgo },
    })

    return NextResponse.json({
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
      recentApplications,
      applicationStatusBreakdown: applicationStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count
        return acc
      }, {}),
      averageMatchScore: matchScoreStats[0]?.avgScore || 0,
      bestMatchScore: matchScoreStats[0]?.maxScore || 0,
    })
  } catch (error) {
    console.error("Error fetching candidate stats:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
