import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/mongoose"
import User from "@/models/User"

export async function POST(request) {
  try {
    const { name, email, password, role, company, phone } = await request.json()

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Validate role
    if (!["candidate", "recruiter"].includes(role)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 })
    }

    // Validate company for recruiters
    if (role === "recruiter" && !company) {
      return NextResponse.json({ message: "Company name is required for recruiters" }, { status: 400 })
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "User already exists with this email" }, { status: 400 })
    }

    // Create user profile based on role
    const profile = {
      bio: "",
      location: "",
      skills: [],
      experience: role === "candidate" ? "entry" : undefined,
      company: role === "recruiter" ? company : undefined,
      phone: phone || "",
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role,
      profile,
    })

    await user.save()

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toObject()

    return NextResponse.json(
      {
        message: "User created successfully",
        user: userWithoutPassword,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
