"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongoose"
import User from "@/models/User"
import Job from "@/models/Job"
import Application from "@/models/Application"
import { revalidatePath } from "next/cache"

export async function updateUserProfile(formData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, message: "Unauthorized" }
    }

    await connectDB()

    // Remove undefined values and prepare update data
    const updateData = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) => value !== undefined && value !== ""),
    )

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateData },
      { new: true, runValidators: true },
    )
      .select("-password")
      .lean()

    if (!updatedUser) {
      return { success: false, message: "User not found" }
    }

    revalidatePath("/candidate/profile")
    revalidatePath("/recruiter/profile")

    return {
      success: true,
      message: "Profile updated successfully",
      user: {
        ...updatedUser,
        id: updatedUser._id.toString(),
        _id: undefined,
      },
    }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { success: false, message: "Failed to update profile" }
  }
}

export async function createJob(formData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "recruiter") {
      return { success: false, message: "Unauthorized" }
    }

    await connectDB()

    const job = new Job({
      ...formData,
      recruiterId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await job.save()

    revalidatePath("/recruiter/jobs")
    revalidatePath("/candidate/jobs")

    return {
      success: true,
      message: "Job created successfully",
      job: {
        ...job.toObject(),
        id: job._id.toString(),
        _id: undefined,
      },
    }
  } catch (error) {
    console.error("Error creating job:", error)
    return { success: false, message: "Failed to create job" }
  }
}

export async function updateJob(jobId, formData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "recruiter") {
      return { success: false, message: "Unauthorized" }
    }

    await connectDB()

    const updateData = {
      ...formData,
      updatedAt: new Date(),
    }

    const job = await Job.findOneAndUpdate(
      { _id: jobId, recruiterId: session.user.id },
      { $set: updateData },
      { new: true, runValidators: true },
    ).lean()

    if (!job) {
      return { success: false, message: "Job not found or unauthorized" }
    }

    revalidatePath("/recruiter/jobs")
    revalidatePath("/candidate/jobs")

    return {
      success: true,
      message: "Job updated successfully",
      job: {
        ...job,
        id: job._id.toString(),
        _id: undefined,
      },
    }
  } catch (error) {
    console.error("Error updating job:", error)
    return { success: false, message: "Failed to update job" }
  }
}

export async function deleteJob(jobId) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "recruiter") {
      return { success: false, message: "Unauthorized" }
    }

    await connectDB()

    const job = await Job.findOneAndDelete({
      _id: jobId,
      recruiterId: session.user.id,
    }).lean()

    if (!job) {
      return { success: false, message: "Job not found or unauthorized" }
    }

    // Also delete related applications
    await Application.deleteMany({ jobId })

    revalidatePath("/recruiter/jobs")
    revalidatePath("/candidate/jobs")

    return {
      success: true,
      message: "Job deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting job:", error)
    return { success: false, message: "Failed to delete job" }
  }
}

export async function submitApplication(jobId, formData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "candidate") {
      return { success: false, message: "Unauthorized" }
    }

    await connectDB()

    // Check if already applied
    const existingApplication = await Application.findOne({
      jobId,
      candidateId: session.user.id,
    }).lean()

    if (existingApplication) {
      return { success: false, message: "You have already applied to this job" }
    }

    const application = new Application({
      jobId,
      candidateId: session.user.id,
      ...formData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await application.save()

    revalidatePath("/candidate/applications")
    revalidatePath("/recruiter/applications")

    return {
      success: true,
      message: "Application submitted successfully",
      application: {
        ...application.toObject(),
        id: application._id.toString(),
        _id: undefined,
      },
    }
  } catch (error) {
    console.error("Error submitting application:", error)
    return { success: false, message: "Failed to submit application" }
  }
}

export async function updateApplicationStatus(applicationId, status) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "recruiter") {
      return { success: false, message: "Unauthorized" }
    }

    await connectDB()

    const application = await Application.findById(applicationId).populate("jobId").lean()

    if (!application || application.jobId.recruiterId.toString() !== session.user.id) {
      return { success: false, message: "Application not found or unauthorized" }
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
      { new: true },
    ).lean()

    revalidatePath("/recruiter/applications")
    revalidatePath("/candidate/applications")

    return {
      success: true,
      message: "Application status updated successfully",
      application: {
        ...updatedApplication,
        id: updatedApplication._id.toString(),
        _id: undefined,
      },
    }
  } catch (error) {
    console.error("Error updating application status:", error)
    return { success: false, message: "Failed to update application status" }
  }
}
