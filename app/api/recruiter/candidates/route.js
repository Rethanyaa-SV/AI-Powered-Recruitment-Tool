import connectDB from "@/lib/mongoose";
import Application from "@/models/Application";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

async function fetchApplicationsForRecruiter({
  recruiterId,
  page = 1,
  limit = 10,
  status,
  jobId,
  search,
}) {
  if (!recruiterId) {
    throw new Error("Recruiter ID is required");
  }

  await connectDB();

  // Build query object
  const query = { recruiterId };

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

  // Fetch applications with pagination and population
  const applications = await Application.find(query)
    .populate("jobId", "title company location type")
    .populate("candidateId")
    .sort({ appliedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const totalApplications = await Application.countDocuments(query);
  const totalPages = Math.ceil(totalApplications / limit);

  // Format response (replace _id with id)
  const formattedApps = applications.map((app) => ({
    ...app,
    id: app._id.toString(),
    _id: undefined,
    jobId: app.jobId
      ? { ...app.jobId, id: app.jobId._id.toString(), _id: undefined }
      : null,
    candidate: app.candidateId
      ? {
          ...app.candidateId,
          id: app.candidateId._id.toString(),
          _id: undefined,
        }
      : null,
  }));

  return formattedApps;
}

export async function GET(request) {
  const user = await getServerSession(authOptions);
  if (!user || user.user.role !== "recruiter") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const status = searchParams.get("status");
  const jobId = searchParams.get("jobId");
  const search = searchParams.get("search");

  try {
    const result = await fetchApplicationsForRecruiter({
      recruiterId: user.user.id,
      page,
      limit,
      status,
      jobId,
      search,
    });

    console.log(result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
