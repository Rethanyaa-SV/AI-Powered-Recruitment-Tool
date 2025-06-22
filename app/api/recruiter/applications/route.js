import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
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
  if (!user || user.role !== "recruiter") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page")) || 1;
    const limit = Number.parseInt(searchParams.get("limit")) || 10;
    const status = searchParams.get("status");
    const jobId = searchParams.get("jobId");
    const search = searchParams.get("search");

    const query = { recruiterId: user.id };

    if (status && status !== "all") {
      query.status = status;
    }

    if (jobId) {
      query.jobId = jobId;
    }

    if (search) {
      query.$or = [
        { candidateName: { $regex: search, $options: "i" } },
        { jobTitle: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }

    const applications = await Application.find(query)
      .populate("jobId", "title company location type")
      .populate("candidateId", "name email profile")
      .sort({ appliedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalApplications = await Application.countDocuments(query);

    const applicationsWithIds = applications.map((app) => ({
      ...app,
      id: app._id.toString(),
      _id: undefined,
      jobId: app.jobId
        ? {
            ...app.jobId,
            id: app.jobId._id.toString(),
            _id: undefined,
          }
        : null,
      candidateId: app.candidateId
        ? {
            ...app.candidateId,
            id: app.candidateId._id.toString(),
            _id: undefined,
          }
        : null,
    }));

    return NextResponse.json(applicationsWithIds);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
