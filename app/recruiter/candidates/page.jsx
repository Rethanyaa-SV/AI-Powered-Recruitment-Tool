"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Search, Filter, Eye } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { AdaptiveNavbar } from "@/components/adaptive-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function RecruiterCandidatesPage() {
  const { user } = useAuth()
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [skillFilter, setSkillFilter] = useState("all")
  const [experienceFilter, setExperienceFilter] = useState("all")

  useEffect(() => {
    fetchCandidates()
  }, [])

  const fetchCandidates = async () => {
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/recruiter/candidates", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCandidates(data)
      }
    } catch (error) {
      console.error("Error fetching candidates:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      !searchTerm ||
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills?.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesSkill =
      skillFilter === "all" ||
      candidate.skills?.some((skill) => skill.toLowerCase().includes(skillFilter.toLowerCase()))

    const matchesExperience =
      experienceFilter === "all" || candidate.seniorityLevel?.toLowerCase().includes(experienceFilter.toLowerCase())

    return matchesSearch && matchesSkill && matchesExperience
  })

  const allSkills = [...new Set(candidates.flatMap((c) => c.skills || []))]
  const allExperienceLevels = [...new Set(candidates.map((c) => c.seniorityLevel).filter(Boolean))]

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["recruiter"]}>
        <div className="min-h-screen bg-gray-50">
          <AdaptiveNavbar />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["recruiter"]}>
      <div className="min-h-screen bg-gray-50">
        <AdaptiveNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidate Database</h1>
            <p className="text-gray-600">Browse and search through candidate profiles</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search candidates, skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={skillFilter} onValueChange={setSkillFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  {allSkills.slice(0, 20).map((skill) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {allExperienceLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter className="h-4 w-4" />
                {filteredCandidates.length} of {candidates.length} candidates
              </div>
            </div>
          </div>

          {/* Candidates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCandidates.map((candidate) => (
              <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{candidate.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {candidate.email}
                      </CardDescription>
                    </div>
                  </div>

                  {candidate.seniorityLevel && (
                    <Badge variant="outline" className="w-fit">
                      {candidate.seniorityLevel}
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {candidate.experience && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Experience</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{candidate.experience}</p>
                    </div>
                  )}

                  {candidate.skills && candidate.skills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 4).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {candidate.skills.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{candidate.skills.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <p className="text-xs text-gray-500">Added {new Date(candidate.createdAt).toLocaleDateString()}</p>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <Eye className="h-3 w-3" />
                          View Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            {candidate.name}
                          </DialogTitle>
                          <DialogDescription>Complete candidate profile and information</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                          {/* Contact Information */}
                          <div>
                            <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{candidate.email}</span>
                              </div>
                              {candidate.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm">{candidate.phone}</span>
                                </div>
                              )}
                              {candidate.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm">{candidate.location}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Professional Summary */}
                          {candidate.experience && (
                            <div>
                              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <Briefcase className="h-5 w-5" />
                                Professional Experience
                              </h3>
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-700 whitespace-pre-line">{candidate.experience}</p>
                                {candidate.yearsOfExperience && (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <span className="text-sm font-medium">Years of Experience: </span>
                                    <span className="text-sm text-gray-600">{candidate.yearsOfExperience}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Education */}
                          {candidate.education && (
                            <div>
                              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <GraduationCap className="h-5 w-5" />
                                Education
                              </h3>
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-700 whitespace-pre-line">{candidate.education}</p>
                              </div>
                            </div>
                          )}

                          {/* Skills */}
                          {candidate.skills && candidate.skills.length > 0 && (
                            <div>
                              <h3 className="text-lg font-semibold mb-3">Skills & Technologies</h3>
                              <div className="flex flex-wrap gap-2">
                                {candidate.skills.map((skill, index) => (
                                  <Badge key={index} variant="secondary">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Resume Text Preview */}
                          {candidate.resumeText && (
                            <div>
                              <h3 className="text-lg font-semibold mb-3">Resume Preview</h3>
                              <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                                  {candidate.resumeText.substring(0, 1000)}
                                  {candidate.resumeText.length > 1000 && "..."}
                                </pre>
                              </div>
                            </div>
                          )}

                          {/* Metadata */}
                          <div className="border-t pt-4">
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Added:</span>{" "}
                                {new Date(candidate.createdAt).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="font-medium">Candidate ID:</span> {candidate.id}
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCandidates.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || skillFilter !== "all" || experienceFilter !== "all"
                    ? "No matching candidates"
                    : "No candidates yet"}
                </h3>
                <p className="text-gray-600">
                  {searchTerm || skillFilter !== "all" || experienceFilter !== "all"
                    ? "Try adjusting your search criteria to find more candidates."
                    : "Candidates will appear here once they start applying to your job postings."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
