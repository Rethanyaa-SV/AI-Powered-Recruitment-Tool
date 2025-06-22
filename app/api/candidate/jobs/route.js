import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Job from "@/models/Job";
import Application from "@/models/Application";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function verifyToken(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return null;
    }
    return session.user;
  } catch (error) {
    return null;
  }
}

export async function GET(request) {
  const user = await verifyToken(request);
  console.log(user);
  if (!user || user.role !== "candidate") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page")) || 1;
    const limit = Number.parseInt(searchParams.get("limit")) || 12;
    const search = searchParams.get("search");
    const location = searchParams.get("location");
    const type = searchParams.get("type");
    const skills = searchParams.get("skills");

    // Build query
    const query = { status: "active" };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (location && location !== "all") {
      query.location = { $regex: location, $options: "i" };
    }

    if (type && type !== "all") {
      query.type = type;
    }

    if (skills) {
      const skillsArray = skills.split(",").map((s) => s.trim());
      query.skills = {
        $in: skillsArray.map((skill) => new RegExp(skill, "i")),
      };
    }

    // Get jobs with pagination
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalJobs = await Job.countDocuments(query);
    const totalPages = Math.ceil(totalJobs / limit);

    // Get user's applications to mark applied jobs
    const userApplications = await Application.find({
      candidateId: user.userId,
    })
      .select("jobId")
      .lean();
    const appliedJobIds = userApplications.map((app) => app.jobId.toString());

    const jobsWithIds = jobs.map((job) => ({
      ...job,
      id: job._id.toString(),
      _id: undefined,
      hasApplied: appliedJobIds.includes(job._id.toString()),
      matchScore: Math.floor(Math.random() * 40) + 60, // Mock match score - replace with real logic
    }));

    return NextResponse.json(jobsWithIds);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
