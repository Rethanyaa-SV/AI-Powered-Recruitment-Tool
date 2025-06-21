"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function CandidateUpload({ onUpload }) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
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

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("resume", file)

      const response = await fetch("/api/candidates/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: formData,
      })

      if (response.ok) {
        toast({
          title: "Resume uploaded",
          description: "Resume has been processed and candidate profile created.",
        })
        onUpload()
      } else {
        const error = await response.json()
        throw new Error(error.message || "Upload failed")
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload resume. Please try again.",
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
    <Card>
      <CardHeader>
        <CardTitle>Upload Candidate Resume</CardTitle>
        <CardDescription>
          Upload PDF or Word documents. AI will extract candidate information automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400"
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

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">AI Processing</p>
              <p className="text-blue-700 mt-1">
                Our AI will automatically extract skills, experience, and education information from the resume.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
