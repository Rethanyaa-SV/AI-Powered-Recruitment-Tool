"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function JobForm({ job, onSave, onCancel }) {
  const [title, setTitle] = useState(job?.title || "")
  const [description, setDescription] = useState(job?.description || "")
  const [skills, setSkills] = useState(job?.requiredSkills || [])
  const [skillInput, setSkillInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()])
      setSkillInput("")
    }
  }

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = job ? `/api/jobs/${job.id}` : "/api/jobs"
      const method = job ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({
          title,
          description,
          requiredSkills: skills,
        }),
      })

      if (response.ok) {
        toast({
          title: job ? "Job updated" : "Job created",
          description: job
            ? "Job posting has been updated successfully."
            : "New job posting has been created successfully.",
        })
        onSave()
      } else {
        throw new Error("Failed to save job")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save job posting. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Job Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Senior Software Engineer"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Job Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the role, responsibilities, and requirements..."
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="skills">Required Skills</Label>
        <div className="flex gap-2">
          <Input
            id="skills"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="e.g. React, Node.js, Python"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addSkill()
              }
            }}
          />
          <Button type="button" onClick={addSkill}>
            Add
          </Button>
        </div>

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                {skill}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : job ? "Update Job" : "Create Job"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
