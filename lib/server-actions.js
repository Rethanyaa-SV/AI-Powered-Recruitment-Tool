"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import Job from "@/models/Job";
import Application from "@/models/Application";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(formData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, message: "Unauthorized" };
    }

    await connectDB();

    const update = {};

    if (formData.name) update.name = formData.name;

    update.profile = {};

    if (formData.phone) update.profile.phone = formData.phone;
    if (formData.location) update.profile.location = formData.location;
    if (formData.summary) update.profile.bio = formData.summary;
    if (formData.skills && formData.skills.length > 0)
      update.profile.skills = formData.skills;
    if (formData.experience) update.profile.experience = formData.experience;
    if (formData.education) update.profile.education = formData.education;
    if (formData.yearsOfExperience)
      update.profile.yearsOfExperience = formData.yearsOfExperience;
    if (formData.seniorityLevel)
      update.profile.seniorityLevel = formData.seniorityLevel;

    if (Object.keys(update.profile).length === 0) delete update.profile;

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: update },
      { new: true, runValidators: true }
    )
      .select("-password")
      .lean();
    console.log(updatedUser);
    if (!updatedUser) {
      return { success: false, message: "User not found" };
    }

    revalidatePath("/candidate/profile");

    return {
      success: true,
      message: "Profile updated successfully",
      user: {
        ...updatedUser,
        id: updatedUser._id.toString(),
        _id: undefined,
      },
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, message: "Failed to update profile" };
  }
}

export async function createJob(formData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "recruiter") {
      return { success: false, message: "Unauthorized" };
    }

    await connectDB();

    const job = new Job({
      ...formData,
      recruiterId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await job.save();

    revalidatePath("/recruiter/jobs");
    revalidatePath("/candidate/jobs");

    return {
      success: true,
      message: "Job created successfully",
      job: {
        ...job.toObject(),
        id: job._id.toString(),
        _id: undefined,
      },
    };
  } catch (error) {
    console.error("Error creating job:", error);
    return { success: false, message: "Failed to create job" };
  }
}

export async function updateJob(jobId, formData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "recruiter") {
      return { success: false, message: "Unauthorized" };
    }

    await connectDB();

    const updateData = {
      ...formData,
      updatedAt: new Date(),
    };

    const job = await Job.findOneAndUpdate(
      { _id: jobId, recruiterId: session.user.id },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!job) {
      return { success: false, message: "Job not found or unauthorized" };
    }

    revalidatePath("/recruiter/jobs");
    revalidatePath("/candidate/jobs");

    return {
      success: true,
      message: "Job updated successfully",
      job: {
        ...job,
        id: job._id.toString(),
        _id: undefined,
      },
    };
  } catch (error) {
    console.error("Error updating job:", error);
    return { success: false, message: "Failed to update job" };
  }
}

export async function deleteJob(jobId) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "recruiter") {
      return { success: false, message: "Unauthorized" };
    }

    await connectDB();

    const job = await Job.findOneAndDelete({
      _id: jobId,
      recruiterId: session.user.id,
    }).lean();

    if (!job) {
      return { success: false, message: "Job not found or unauthorized" };
    }

    // Also delete related applications
    await Application.deleteMany({ jobId });

    revalidatePath("/recruiter/jobs");
    revalidatePath("/candidate/jobs");

    return {
      success: true,
      message: "Job deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting job:", error);
    return { success: false, message: "Failed to delete job" };
  }
}

export async function approveApplication(applicationId) {
  try {
    await connectDB();
    console.log(applicationId);
    const application = await Application.findById(applicationId);
    console.log(application);
    if (!application) {
      return {
        success: false,
        error: "Application not found",
      };
    }

    // Update application status to accepted
    application.status = "accepted";
    await application.save();

    // Revalidate the applications page to show updated data
    revalidatePath("/recruiter/applications");

    return {
      success: true,
      message: `Application for ${application.candidateName} has been approved`,
      application: {
        id: application._id.toString(),
        candidateName: application.candidateName,
        jobTitle: application.jobTitle,
        status: application.status,
      },
    };
  } catch (error) {
    console.error("Error approving application:", error);
    return {
      success: false,
      error: "Failed to approve application. Please try again.",
    };
  }
}

export async function rejectApplication(applicationId, rejectionReason) {
  try {
    await connectDB();

    const application = await Application.findById(applicationId);

    if (!application) {
      return {
        success: false,
        error: "Application not found",
      };
    }

    // Update application status to rejected
    application.status = "rejected";

    // Optionally store rejection reason in a custom field
    if (rejectionReason) {
      application.rejectionReason = rejectionReason;
    }

    await application.save();

    // Revalidate the applications page to show updated data
    revalidatePath("/recruiter/applications");

    return {
      success: true,
      message: `Application for ${application.candidateName} has been rejected`,
      application: {
        id: application._id.toString(),
        candidateName: application.candidateName,
        jobTitle: application.jobTitle,
        status: application.status,
      },
    };
  } catch (error) {
    console.error("Error rejecting application:", error);
    return {
      success: false,
      error: "Failed to reject application. Please try again.",
    };
  }
}

export async function updateApplicationStatus(applicationId, newStatus) {
  try {
    await connectDB();

    const application = await Application.findById(applicationId);

    if (!application) {
      return {
        success: false,
        error: "Application not found",
      };
    }

    // Validate status
    const validStatuses = ["pending", "reviewed", "accepted", "rejected"];
    if (!validStatuses.includes(newStatus)) {
      return {
        success: false,
        error: "Invalid status provided",
      };
    }

    // Update application status
    application.status = newStatus;
    await application.save();

    // Revalidate the applications page to show updated data
    revalidatePath("/recruiter/applications");

    return {
      success: true,
      message: `Application status updated to ${newStatus}`,
      application: {
        id: application._id.toString(),
        candidateName: application.candidateName,
        jobTitle: application.jobTitle,
        status: application.status,
      },
    };
  } catch (error) {
    console.error("Error updating application status:", error);
    return {
      success: false,
      error: "Failed to update application status. Please try again.",
    };
  }
}

export async function bulkUpdateApplications(applicationIds, newStatus) {
  try {
    await connectDB();

    const validStatuses = ["pending", "reviewed", "accepted", "rejected"];
    if (!validStatuses.includes(newStatus)) {
      return {
        success: false,
        error: "Invalid status provided",
      };
    }

    const result = await Application.updateMany(
      { _id: { $in: applicationIds } },
      { status: newStatus }
    );

    // Revalidate the applications page to show updated data
    revalidatePath("/recruiter/applications");

    return {
      success: true,
      message: `${result.modifiedCount} applications updated to ${newStatus}`,
      updatedCount: result.modifiedCount,
    };
  } catch (error) {
    console.error("Error bulk updating applications:", error);
    return {
      success: false,
      error: "Failed to update applications. Please try again.",
    };
  }
}
