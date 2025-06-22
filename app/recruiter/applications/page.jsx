"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AdaptiveNavbar } from "@/components/adaptive-navbar";
import { ProtectedRoute } from "@/components/protected-route";
import {
  Calendar,
  Award,
  Mail,
  Phone,
  MapPin,
  Eye,
  User,
  TrendingUp,
  Search,
  Filter,
  Users,
} from "lucide-react";

export default function RecruiterApplicationsPage() {
  const { toast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/recruiter/applications");
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched applications:", data);
        setApplications(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch applications",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const response = await fetch(
        `/api/recruiter/applications/${applicationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        setApplications(
          applications.map((app) =>
            app.id === applicationId ? { ...app, status: newStatus } : app
          )
        );
        toast({
          title: "Status Updated",
          description: `Application status changed to ${newStatus}`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update application status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation?.toLowerCase()) {
      case "highly recommended":
        return "bg-green-100 text-green-800";
      case "recommended":
        return "bg-blue-100 text-blue-800";
      case "not recommended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredAndSortedApplications = applications
    .filter((app) => {
      const matchesSearch =
        app.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.candidate?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.appliedAt) - new Date(a.appliedAt);
        case "oldest":
          return new Date(a.appliedAt) - new Date(b.appliedAt);
        case "score":
          return (
            (b.aiAssessment?.overallScore || 0) -
            (a.aiAssessment?.overallScore || 0)
          );
        case "name":
          return a.candidateName?.localeCompare(b.candidateName);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["recruiter"]}>
        <div className="min-h-screen bg-gray-50">
          <AdaptiveNavbar />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["recruiter"]}>
      <div className="min-h-screen bg-gray-50">
        <AdaptiveNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Applications
            </h1>
            <p className="text-gray-600">
              Review and manage candidate applications with AI-powered insights
            </p>
          </div>

          {/* Filters and Search */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by candidate name, job title, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="score">Highest Score</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Applications List */}
          <div className="space-y-4">
            {filteredAndSortedApplications.map((application) => (
              <Card
                key={application.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">
                          {application.candidateName}
                        </CardTitle>
                        {application.aiAssessment?.overallScore && (
                          <Badge
                            className={`${getScoreColor(
                              application.aiAssessment.overallScore
                            )} font-bold text-sm px-3 py-1 border`}
                          >
                            {application.aiAssessment.overallScore}% Match
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-lg font-medium text-gray-900 mb-3">
                        Applied for: {application.jobTitle} at{" "}
                        {application.company || "Company"}
                      </CardDescription>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Applied{" "}
                          {new Date(application.appliedAt).toLocaleDateString()}
                        </div>
                        {application.aiAssessment?.recommendation && (
                          <Badge
                            className={`${getRecommendationColor(
                              application.aiAssessment.recommendation
                            )} text-xs`}
                          >
                            {application.aiAssessment.recommendation}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        className={`${getStatusColor(
                          application.status
                        )} capitalize`}
                      >
                        {application.status}
                      </Badge>
                      <div className="flex gap-2">
                        <Select
                          value={application.status}
                          onValueChange={(value) =>
                            updateApplicationStatus(application.id, value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* AI Assessment Summary */}
                  {application.aiAssessment && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-4 border border-blue-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Award className="h-5 w-5 text-blue-600" />
                        <h4 className="font-semibold text-blue-900">
                          AI Assessment
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {application.aiAssessment.skillsMatch}%
                          </div>
                          <div className="text-sm text-gray-600">
                            Skills Match
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {application.aiAssessment.experienceMatch}%
                          </div>
                          <div className="text-sm text-gray-600">
                            Experience Match
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {application.aiAssessment.qualificationMatch}%
                          </div>
                          <div className="text-sm text-gray-600">
                            Qualification Match
                          </div>
                        </div>
                      </div>

                      {application.aiAssessment.summary && (
                        <p className="text-sm text-gray-700 bg-white p-3 rounded border-l-4 border-blue-400">
                          <strong>AI Summary:</strong>{" "}
                          {application.aiAssessment.summary}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Key Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {application.candidate && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-gray-900">
                          Contact Information
                        </h5>
                        <div className="text-sm text-gray-600 space-y-1">
                          {application.candidate.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {application.candidate.email}
                            </div>
                          )}
                          {application.candidate.profile?.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {application.candidate.profile.phone}
                            </div>
                          )}
                          {application.candidate.profile?.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {application.candidate.profile.location}
                            </div>
                          )}
                          {!application.candidate.profile?.phone &&
                            !application.candidate.profile?.location && (
                              <div className="text-gray-500 text-xs">
                                Additional contact details not provided
                              </div>
                            )}
                        </div>
                      </div>
                    )}

                    {/* Always show AI Assessment info if available */}
                    {application.aiAssessment && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-gray-900">
                          AI Assessment Details
                        </h5>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>
                            Experience Level:{" "}
                            {application.aiAssessment.experienceLevel ||
                              "Not specified"}
                          </div>
                          <div>
                            Culture Fit: {application.aiAssessment.cultureFit}%
                          </div>
                          <div>
                            Growth Potential:{" "}
                            {application.aiAssessment.growthPotential}%
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Skills Analysis */}
                  {application.aiAssessment && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">
                        Skills Analysis
                      </h5>

                      {application.aiAssessment.matchedSkills &&
                      application.aiAssessment.matchedSkills.length > 0 ? (
                        <div className="mb-3">
                          <h6 className="text-sm font-medium text-green-700 mb-1">
                            Matched Skills
                          </h6>
                          <div className="flex flex-wrap gap-2">
                            {application.aiAssessment.matchedSkills.map(
                              (skill, index) => (
                                <Badge
                                  key={index}
                                  className="bg-green-100 text-green-800 text-xs"
                                >
                                  ✓ {skill}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="mb-3">
                          <div className="text-sm text-gray-500">
                            No matched skills found
                          </div>
                        </div>
                      )}

                      {application.aiAssessment.missingSkills &&
                        application.aiAssessment.missingSkills.length > 0 && (
                          <div>
                            <h6 className="text-sm font-medium text-red-700 mb-1">
                              Missing Skills
                            </h6>
                            <div className="flex flex-wrap gap-2">
                              {application.aiAssessment.missingSkills
                                .slice(0, 5)
                                .map((skill, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-red-600 border-red-200 text-xs"
                                  >
                                    ✗ {skill}
                                  </Badge>
                                ))}
                              {application.aiAssessment.missingSkills.length >
                                5 && (
                                <Badge
                                  variant="outline"
                                  className="text-gray-600 border-gray-200 text-xs"
                                >
                                  +
                                  {application.aiAssessment.missingSkills
                                    .length - 5}{" "}
                                  more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {/* Debug info - remove this after testing */}
                  {process.env.NODE_ENV === "development" && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                      <details>
                        <summary className="cursor-pointer font-medium">
                          Debug: Application Data
                        </summary>
                        <pre className="mt-2 overflow-auto max-h-32">
                          {JSON.stringify(
                            {
                              id: application.id,
                              candidateName: application.candidateName,
                              hasAiAssessment: !!application.aiAssessment,
                              hasCandidate: !!application.candidate,
                              keyStrengthsLength:
                                application.aiAssessment?.keyStrengths
                                  ?.length || 0,
                              matchedSkillsLength:
                                application.aiAssessment?.matchedSkills
                                  ?.length || 0,
                              missingSkillsLength:
                                application.aiAssessment?.missingSkills
                                  ?.length || 0,
                              concernsLength:
                                application.aiAssessment?.concerns?.length || 0,
                            },
                            null,
                            2
                          )}
                        </pre>
                      </details>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Application ID: {application.id}</span>
                      {application.aiAssessment?.growthPotential && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          Growth Potential:{" "}
                          {application.aiAssessment.growthPotential}%
                        </div>
                      )}
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Full Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            {application.candidateName} - Detailed Assessment
                          </DialogTitle>
                          <DialogDescription>
                            Complete AI analysis and application details for{" "}
                            {application.jobTitle}
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                          {/* Comprehensive AI Assessment */}
                          {application.aiAssessment && (
                            <div className="bg-gray-50 p-6 rounded-lg">
                              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Award className="h-5 w-5 text-blue-600" />
                                Complete AI Assessment
                              </h3>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="text-center p-3 bg-white rounded border">
                                  <div className="text-2xl font-bold text-blue-600">
                                    {application.aiAssessment.overallScore}%
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Overall Score
                                  </div>
                                </div>
                                <div className="text-center p-3 bg-white rounded border">
                                  <div className="text-2xl font-bold text-green-600">
                                    {application.aiAssessment.skillsMatch}%
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Skills Match
                                  </div>
                                </div>
                                <div className="text-center p-3 bg-white rounded border">
                                  <div className="text-2xl font-bold text-purple-600">
                                    {application.aiAssessment.experienceMatch}%
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Experience
                                  </div>
                                </div>
                                <div className="text-center p-3 bg-white rounded border">
                                  <div className="text-2xl font-bold text-orange-600">
                                    {application.aiAssessment.cultureFit}%
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Culture Fit
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-medium mb-2 text-green-700">
                                    Key Strengths
                                  </h4>
                                  <ul className="space-y-1 text-sm">
                                    {application.aiAssessment.keyStrengths?.map(
                                      (strength, index) => (
                                        <li
                                          key={index}
                                          className="flex items-center gap-2"
                                        >
                                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                          {strength}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>

                                {application.aiAssessment.concerns &&
                                  application.aiAssessment.concerns.length >
                                    0 && (
                                    <div>
                                      <h4 className="font-medium mb-2 text-orange-700">
                                        Areas of Concern
                                      </h4>
                                      <ul className="space-y-1 text-sm">
                                        {application.aiAssessment.concerns.map(
                                          (concern, index) => (
                                            <li
                                              key={index}
                                              className="flex items-center gap-2"
                                            >
                                              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                              {concern}
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  )}
                              </div>

                              {application.aiAssessment
                                .recommendationReason && (
                                <div className="mt-4 p-4 bg-blue-50 rounded border-l-4 border-blue-400">
                                  <h4 className="font-medium text-blue-900 mb-1">
                                    Recommendation Reasoning
                                  </h4>
                                  <p className="text-sm text-blue-800">
                                    {
                                      application.aiAssessment
                                        .recommendationReason
                                    }
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Skills Analysis */}
                          {application.aiAssessment && (
                            <div>
                              <h3 className="text-lg font-semibold mb-3">
                                Skills Analysis
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {application.aiAssessment.matchedSkills &&
                                  application.aiAssessment.matchedSkills
                                    .length > 0 && (
                                    <div>
                                      <h4 className="font-medium mb-2 text-green-700">
                                        Matched Skills
                                      </h4>
                                      <div className="flex flex-wrap gap-2">
                                        {application.aiAssessment.matchedSkills.map(
                                          (skill, index) => (
                                            <Badge
                                              key={index}
                                              className="bg-green-100 text-green-800 text-xs"
                                            >
                                              ✓ {skill}
                                            </Badge>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}

                                {application.aiAssessment.missingSkills &&
                                  application.aiAssessment.missingSkills
                                    .length > 0 && (
                                    <div>
                                      <h4 className="font-medium mb-2 text-red-700">
                                        Missing Skills
                                      </h4>
                                      <div className="flex flex-wrap gap-2">
                                        {application.aiAssessment.missingSkills.map(
                                          (skill, index) => (
                                            <Badge
                                              key={index}
                                              variant="outline"
                                              className="text-red-600 border-red-200 text-xs"
                                            >
                                              ✗ {skill}
                                            </Badge>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                          )}

                          {/* Resume Information */}
                          {application.resumeData && (
                            <div>
                              <h3 className="text-lg font-semibold mb-3">
                                Resume Information
                              </h3>
                              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                {application.resumeData.experienceSummary && (
                                  <div>
                                    <h4 className="font-medium mb-1">
                                      Experience Summary
                                    </h4>
                                    <p className="text-sm text-gray-700">
                                      {application.resumeData.experienceSummary}
                                    </p>
                                  </div>
                                )}

                                {application.resumeData.education && (
                                  <div>
                                    <h4 className="font-medium mb-1">
                                      Education
                                    </h4>
                                    <p className="text-sm text-gray-700">
                                      {application.resumeData.education}
                                    </p>
                                  </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">
                                      Experience Level:
                                    </span>{" "}
                                    {application.resumeData.seniorityLevel ||
                                      "Not specified"}
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      Years of Experience:
                                    </span>{" "}
                                    {application.resumeData.yearsOfExperience ||
                                      "Not specified"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Cover Letter */}
                          {application.coverLetter && (
                            <div>
                              <h3 className="text-lg font-semibold mb-3">
                                Cover Letter
                              </h3>
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-700 whitespace-pre-line">
                                  {application.coverLetter}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-3 pt-4 border-t">
                            <Button
                              onClick={() =>
                                updateApplicationStatus(
                                  application.id,
                                  "accepted"
                                )
                              }
                              className="bg-green-600 hover:bg-green-700"
                              disabled={application.status === "accepted"}
                            >
                              Accept Candidate
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() =>
                                updateApplicationStatus(
                                  application.id,
                                  "reviewed"
                                )
                              }
                              disabled={application.status === "reviewed"}
                            >
                              Mark as Reviewed
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() =>
                                updateApplicationStatus(
                                  application.id,
                                  "rejected"
                                )
                              }
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              disabled={application.status === "rejected"}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredAndSortedApplications.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Users className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {statusFilter !== "all" || searchTerm
                      ? "No matching applications"
                      : "No applications yet"}
                  </h3>
                  <p className="text-gray-600">
                    {statusFilter !== "all" || searchTerm
                      ? "Try adjusting your filters to see more applications."
                      : "Applications will appear here once candidates start applying to your job postings."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
