import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Job from "@/models/Job";
import Application from "@/models/Application";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    await connectDB();
    // const session=await getServerSession(authOptions);

    const job = await Job.findOne({
      _id: params.id,
      recruiterId: user.userId,
    }).lean();

    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...job,
      id: job._id.toString(),
      _id: undefined,
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      throw new Error("Unauthorized");
    }
    const {
      title,
      description,
      requirements,
      location,
      type,
      salary,
      skills,
      company,
      status,
    } = await request.json();

    // Validation
    if (!title || !description || !location || !type) {
      return NextResponse.json(
        { message: "Required fields are missing" },
        { status: 400 }
      );
    }

    const updatedJob = await Job.findOneAndUpdate(
      { _id: params.id, recruiterId: session.user.id },
      {
        title,
        description,
        requirements: requirements || "",
        location,
        type,
        salary,
        skills: skills || [],
        company: company || "",
        status: status || "active",
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedJob) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...updatedJob,
      id: updatedJob._id.toString(),
      _id: undefined,
    });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      throw new Error("Unauthorized");
    }

    const job = await Job.findOneAndDelete({
      _id: params.id,
      recruiterId: session.user.id,
    });

    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    // Also delete all applications for this job
    await Application.deleteMany({ jobId: params.id });

    return NextResponse.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
