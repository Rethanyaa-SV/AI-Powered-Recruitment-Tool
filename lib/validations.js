import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["candidate", "recruiter"], {
      required_error: "Please select a role",
    }),
    company: z.string().optional(),
    phone: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.role === "recruiter") {
        return data.company && data.company.trim().length > 0
      }
      return true
    },
    {
      message: "Company name is required for recruiters",
      path: ["company"],
    },
  )

export const jobSchema = z.object({
  title: z.string().min(3, "Job title must be at least 3 characters"),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  type: z.enum(["full-time", "part-time", "contract", "internship"], {
    required_error: "Please select a job type",
  }),
  description: z.string().min(50, "Job description must be at least 50 characters"),
  requirements: z.string().min(20, "Requirements must be at least 20 characters"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  salary: z.object({
    min: z.number().min(0, "Minimum salary must be positive"),
    max: z.number().min(0, "Maximum salary must be positive"),
    currency: z.string().default("USD"),
  }),
  remote: z.boolean().default(false),
  experience: z.enum(["entry", "mid", "senior", "lead"], {
    required_error: "Please select experience level",
  }),
})

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  location: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  skills: z.array(z.string()).optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  company: z.string().optional(),
})

export const applicationSchema = z.object({
  coverLetter: z.string().min(50, "Cover letter must be at least 50 characters"),
  resumeFile: z.any().optional(),
})
