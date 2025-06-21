"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, Loader2, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ResumeUpload({ onUploadComplete, existingData = null }) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedData, setUploadedData] = useState(existingData)
  const { toast } = useToast()

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return

    const file = files[0]

    // Check file type
    if (!file.type.includes("pdf") && !file.type.includes("document")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document.",
        variant: "destructive",
      })
      return
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("resume", file)

      const response = await fetch("/api/resume/analyze", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setUploadedData(data)
        onUploadComplete(data)
        toast({
          title: "Resume processed",
          description: "Your resume has been analyzed successfully.",
        })
      } else {
        const error = await response.json()
        throw new Error(error.message || "Upload failed")
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to process resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Resume Upload
          </CardTitle>
          <CardDescription>
            Upload your resume in PDF or Word format. Our AI will extract your information automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : uploadedData
                  ? "border-green-300 bg-green-50"
                  : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-gray-600">Processing resume...</p>
              </div>
            ) : uploadedData ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-900">Resume processed successfully!</p>
                  <p className="text-xs text-green-700 mt-1">
                    {uploadedData.personalInfo?.name && `Name: ${uploadedData.personalInfo.name}`}
                    {uploadedData.skills?.length > 0 && ` • ${uploadedData.skills.length} skills detected`}
                  </p>
                </div>
                <Label htmlFor="file-upload-replace" className="text-primary cursor-pointer hover:underline text-sm">
                  Upload different resume
                </Label>
                <Input
                  id="file-upload-replace"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                  <Upload className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Drop your resume here, or{" "}
                    <Label htmlFor="file-upload" className="text-primary cursor-pointer hover:underline">
                      browse
                    </Label>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX up to 10MB</p>
                </div>
                <Input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </div>
            )}
          </div>

          {/* AI Processing Info */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">AI-Powered Analysis</p>
                <p className="text-blue-700 mt-1">
                  Our AI will automatically extract your personal information, skills, work experience, and education to
                  create a comprehensive profile for job matching.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resume Data Preview */}
      {uploadedData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Extracted Information</CardTitle>
            <CardDescription>Review the information extracted from your resume</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadedData.personalInfo && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {uploadedData.personalInfo.name && (
                    <p>
                      <span className="font-medium">Name:</span> {uploadedData.personalInfo.name}
                    </p>
                  )}
                  {uploadedData.personalInfo.email && (
                    <p>
                      <span className="font-medium">Email:</span> {uploadedData.personalInfo.email}
                    </p>
                  )}
                  {uploadedData.personalInfo.phone && (
                    <p>
                      <span className="font-medium">Phone:</span> {uploadedData.personalInfo.phone}
                    </p>
                  )}
                  {uploadedData.personalInfo.location && (
                    <p>
                      <span className="font-medium">Location:</span> {uploadedData.personalInfo.location}
                    </p>
                  )}
                </div>
              </div>
            )}

            {uploadedData.skills && uploadedData.skills.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Skills ({uploadedData.skills.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {uploadedData.skills.slice(0, 10).map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                      {skill}
                    </span>
                  ))}
                  {uploadedData.skills.length > 10 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                      +{uploadedData.skills.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {uploadedData.yearsOfExperience && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Experience</h4>
                <p className="text-sm text-gray-600">
                  {uploadedData.yearsOfExperience} years • {uploadedData.seniorityLevel || "Mid"} level
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
