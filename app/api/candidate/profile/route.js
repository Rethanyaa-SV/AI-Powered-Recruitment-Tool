import { NextResponse } from "next/server"
import connectDB from "@/lib/mongoose"
import User from "@/models/User"
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

    const candidate = await User.findById(user.userId).lean()
    if (!candidate) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...candidate,
      id: candidate._id.toString(),
      _id: undefined,
    })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request) {
  const user = verifyToken(request)
  if (!user || user.role !== "candidate") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    const updateData = await request.json()

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password
    delete updateData.email
    delete updateData.role

    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      { $set: updateData },
      { new: true, runValidators: true },
    ).lean()

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...updatedUser,
      id: updatedUser._id.toString(),
      _id: undefined,
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
