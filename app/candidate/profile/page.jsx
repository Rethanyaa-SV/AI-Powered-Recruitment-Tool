"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, Edit, Save, X, Plus } from "lucide-react"
import { AdaptiveNavbar } from "@/components/adaptive-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useToast } from "@/hooks/use-toast"
import { ResumeUpload } from "@/components/resume-upload"
import { updateUserProfile } from "@/lib/server-actions"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  location: z.string().optional(),
  summary: z.string().optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  yearsOfExperience: z.string().optional(),
  seniorityLevel: z.string().optional(),
})

export default function CandidateProfilePage() {
  const { data: session, update } = useSession()
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [skills, setSkills] = useState([])
  const [newSkill, setNewSkill] = useState("")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
    reset,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      phone: "",
      location: "",
      summary: "",
      experience: "",
      education: "",
      yearsOfExperience: "",
      seniorityLevel: "",
    },
  })

  // Load user data when session is available
  useEffect(() => {
    if (session?.user) {
      const user = session.user
      reset({
        name: user.name || "",
        phone: user.phone || "",
        location: user.location || "",
        summary: user.summary || "",
        experience: user.experience || "",
        education: user.education || "",
        yearsOfExperience: user.yearsOfExperience || "",
        seniorityLevel: user.seniorityLevel || "",
      })
      setSkills(user.skills || [])
    }
  }, [session, reset])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const formData = {
        ...data,
        skills,
      }

      const result = await updateUserProfile(formData)

      if (result.success) {
        // Update the session with new data
        await update({
          ...session,
          user: {
            ...session.user,
            ...formData,
          },
        })

        setEditing(false)
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update profile.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    // Reset form to original values
    if (session?.user) {
      const user = session.user
      reset({
        name: user.name || "",
        phone: user.phone || "",
        location: user.location || "",
        summary: user.summary || "",
        experience: user.experience || "",
        education: user.education || "",
        yearsOfExperience: user.yearsOfExperience || "",
        seniorityLevel: user.seniorityLevel || "",
      })
      setSkills(user.skills || [])
    }
  }

  const handleResumeUpload = (resumeData) => {
    if (resumeData.personalInfo) {
      setValue("name", resumeData.personalInfo.name || "")
      setValue("phone", resumeData.personalInfo.phone || "")
      setValue("location", resumeData.personalInfo.location || "")
    }

    setValue("experience", resumeData.experienceSummary || "")
    setValue("education", resumeData.education || "")
    setValue("yearsOfExperience", resumeData.yearsOfExperience || "")
    setValue("seniorityLevel", resumeData.seniorityLevel || "")

    if (resumeData.skills) {
      setSkills(resumeData.skills)
    }

    toast({
      title: "Resume Processed",
      description: "Your profile has been updated with resume information.",
    })
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addSkill()
    }
  }

  if (!session?.user) {
    return null
  }

  return (
    <ProtectedRoute allowedRoles={["candidate"]}>
      <div className="min-h-screen bg-gray-50">
        <AdaptiveNavbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
              <p className="text-gray-600">Manage your professional information</p>
            </div>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline">Cancel</span>
                  </Button>
                  <Button
                    onClick={handleSubmit(onSubmit)}
                    disabled={loading || !isDirty}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? "Saving..." : <span className="hidden sm:inline">Save Changes</span>}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setEditing(true)} className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Edit Profile</span>
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Resume Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Award className="h-5 w-5" />
                  Update from Resume
                </CardTitle>
                <CardDescription>
                  Upload your latest resume to automatically update your profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResumeUpload onUploadComplete={handleResumeUpload} />
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    {editing ? (
                      <div className="mt-1">
                        <Input id="name" {...register("name")} className={errors.name ? "border-red-500" : ""} />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                      </div>
                    ) : (
                      <div className="mt-1 p-2 bg-gray-50 rounded-md flex items-center gap-2 min-h-[40px]">
                        <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <span className="truncate">{watch("name") || "Not provided"}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="mt-1 p-2 bg-gray-100 rounded-md flex items-center gap-2 min-h-[40px]">
                      <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="truncate">{session.user.email}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    {editing ? (
                      <Input id="phone" {...register("phone")} className="mt-1" placeholder="Enter your phone number" />
                    ) : (
                      <div className="mt-1 p-2 bg-gray-50 rounded-md flex items-center gap-2 min-h-[40px]">
                        <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <span className="truncate">{watch("phone") || "Not provided"}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    {editing ? (
                      <Input
                        id="location"
                        {...register("location")}
                        className="mt-1"
                        placeholder="Enter your location"
                      />
                    ) : (
                      <div className="mt-1 p-2 bg-gray-50 rounded-md flex items-center gap-2 min-h-[40px]">
                        <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <span className="truncate">{watch("location") || "Not provided"}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Professional Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <Textarea
                    {...register("summary")}
                    placeholder="Write a brief summary of your professional background and career objectives..."
                    rows={4}
                    className="resize-none"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md min-h-[100px]">
                    {watch("summary") || "No professional summary provided. Click edit to add one."}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Skills</CardTitle>
                <CardDescription>Your technical and professional skills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                        <span className="text-sm">{skill}</span>
                        {editing && (
                          <button
                            onClick={() => removeSkill(skill)}
                            className="ml-1 hover:text-red-600 transition-colors"
                            type="button"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                    {skills.length === 0 && <p className="text-gray-500 text-sm">No skills added yet</p>}
                  </div>

                  {editing && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill..."
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addSkill}
                        disabled={!newSkill.trim()}
                        className="flex items-center gap-2 px-4"
                      >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Add</span>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Briefcase className="h-5 w-5" />
                  Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                    {editing ? (
                      <Input
                        id="yearsOfExperience"
                        {...register("yearsOfExperience")}
                        placeholder="e.g., 3-5 years"
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 p-2 bg-gray-50 rounded-md min-h-[40px] flex items-center">
                        {watch("yearsOfExperience") || "Not specified"}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="seniorityLevel">Seniority Level</Label>
                    {editing ? (
                      <Input
                        id="seniorityLevel"
                        {...register("seniorityLevel")}
                        placeholder="e.g., Mid-level, Senior"
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 p-2 bg-gray-50 rounded-md min-h-[40px] flex items-center">
                        {watch("seniorityLevel") || "Not specified"}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="experience">Experience Summary</Label>
                  {editing ? (
                    <Textarea
                      id="experience"
                      {...register("experience")}
                      placeholder="Describe your work experience, key achievements, and responsibilities..."
                      rows={4}
                      className="mt-1 resize-none"
                    />
                  ) : (
                    <div className="mt-1 p-3 bg-gray-50 rounded-md min-h-[100px]">
                      {watch("experience") || "No experience summary provided"}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <GraduationCap className="h-5 w-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <Textarea
                    {...register("education")}
                    placeholder="List your educational background, degrees, certifications..."
                    rows={3}
                    className="resize-none"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md min-h-[80px]">
                    {watch("education") || "No education information provided"}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
