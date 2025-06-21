import { NextResponse } from "next/server"
import connectDB from "@/lib/mongoose"
import User from "@/models/User"
import bcrypt from "bcryptjs"

export async function POST(request) {
  try {
    await connectDB()

    const { name, email, password, role } = await request.json()


    // Validation
    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 })
    }

    if (!["recruiter", "candidate"].includes(role)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 })
    }
    const hashedPassword = await bcrypt.hash(password, 10)

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "User already exists with this email" }, { status: 400 })
    }

    // Create new user
    const user = new User({
      name,
      email,
      hashedPassword,
      role,
    })

    await user.save()


    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
