import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // adjust path to your actual authOptions file
import connectDB from "@/lib/mongoose";
import Job from "@/models/Job";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  console.log(session);
  try {
    await connectDB();

    if (!session || !session?.user || session?.user.role != "recruiter") {
      throw new Error("Unauthorized");
    }

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page")) || 1;
    const limit = Number.parseInt(searchParams.get("limit")) || 10;
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const query = { recruiterId: session.user.id };

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalJobs = await Job.countDocuments(query);
    const totalPages = Math.ceil(totalJobs / limit);

    const jobsWithIds = jobs.map((job) => ({
      ...job,
      id: job._id.toString(),
      _id: undefined,
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

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "recruiter") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const {
      title,
      description,
      requirements,
      location,
      type,
      salary,
      skills,
      company,
    } = await request.json();

    if (!title || !description || !location || !type) {
      return NextResponse.json(
        { message: "Required fields are missing" },
        { status: 400 }
      );
    }

    const newJob = new Job({
      title,
      description,
      requirements: requirements || "",
      location,
      type,
      salary,
      skills: skills || [],
      company: company || "",
      recruiterId: session.user.id,
      status: "active",
    });

    await newJob.save();

    return NextResponse.json({
      ...newJob.toObject(),
      id: newJob._id.toString(),
      _id: undefined,
    });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
