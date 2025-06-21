import mongoose from "mongoose"

const ApplicationSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    candidateName: {
      type: String,
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coverLetter: {
      type: String,
      default: "",
    },
    resumeData: {
      personalInfo: {
        name: String,
        email: String,
        phone: String,
        location: String,
      },
      skills: [String],
      experience: [
        {
          company: String,
          position: String,
          duration: String,
          description: String,
        },
      ],
      education: [
        {
          institution: String,
          degree: String,
          year: String,
        },
      ],
      experienceSummary: String,
      yearsOfExperience: Number,
      seniorityLevel: String,
    },
    aiAssessment: {
      overallScore: Number,
      skillsMatch: Number,
      experienceMatch: Number,
      qualificationMatch: Number,
      recommendation: {
        type: String,
        enum: ["Highly Recommended", "Recommended", "Consider", "Not Recommended"],
      },
      recommendationReason: String,
      keyStrengths: [String],
      concerns: [String],
      summary: String,
      matchedSkills: [String],
      missingSkills: [String],
      experienceLevel: String,
      cultureFit: Number,
      growthPotential: Number,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "accepted", "rejected"],
      default: "pending",
    },
    matchScore: {
      type: Number,
      default: 0,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Application || mongoose.model("Application", ApplicationSchema)
