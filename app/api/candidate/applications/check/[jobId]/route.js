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

export async function GET(request, { params }) {
  const user = await verifyToken(request);
  if (!user || user.role !== "candidate") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const application = await Application.findOne({
      candidateId: user.id,
      jobId: params.jobId,
    }).lean();

    return NextResponse.json({
      hasApplied: !!application,
      application: application
        ? {
            ...application,
            id: application._id.toString(),
            _id: undefined,
          }
        : null,
    });
  } catch (error) {
    console.error("Error checking application status:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
