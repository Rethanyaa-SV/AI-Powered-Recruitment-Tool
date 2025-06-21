import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongoose"
import Application from "@/models/Application"

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "recruiter") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    const { status, feedback } = await request.json()

    if (!["pending", "reviewed", "accepted", "rejected"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 })
    }

    const updatedApplication = await Application.findOneAndUpdate(
      { _id: params.id, recruiterId: session.user.id },
      {
        status,
        feedback: feedback || "",
        updatedAt: new Date(),
      },
      { new: true },
    ).lean()

    if (!updatedApplication) {
      return NextResponse.json({ message: "Application not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...updatedApplication,
      id: updatedApplication._id.toString(),
      _id: undefined,
    })
  } catch (error) {
    console.error("Error updating application status:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
