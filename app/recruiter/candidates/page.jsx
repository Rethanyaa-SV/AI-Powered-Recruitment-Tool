"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Search,
  Filter,
  Eye,
  Award,
  Check,
  X,
  Clock,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { AdaptiveNavbar } from "@/components/adaptive-navbar";
import { ProtectedRoute } from "@/components/protected-route";
import {
  approveApplication,
  rejectApplication,
  updateApplicationStatus,
} from "@/lib/server-actions";

export default function RecruiterCandidatesPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState({});
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const getApplicationId = (app) => {
    return app._id || app.id || app.applicationId || null;
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await fetch("/api/recruiter/candidates");

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched candidates:", data);
        // Add detailed logging to see application structure
        if (data.length > 0) {
          console.log("First application structure:", data[0]);
          console.log("Application keys:", Object.keys(data[0]));
        }
        setApplications(data);
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveApplication = async (applicationId) => {
    setActionLoading((prev) => ({ ...prev, [applicationId]: "approving" }));

    try {
      console.log("Application ID being passed:", applicationId);
      if (!applicationId) {
        alert("Application ID is missing");
        return;
      }

      const result = await approveApplication(applicationId);

      if (result.success) {
        // Update local state using multiple possible ID fields
        setApplications((prev) =>
          prev.map((app) =>
            app._id === applicationId ||
            app.id === applicationId ||
            app.applicationId === applicationId
              ? { ...app, status: "accepted" }
              : app
          )
        );
        alert(result.message);
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error approving application:", error);
      alert("Failed to approve application");
    } finally {
      setActionLoading((prev) => ({ ...prev, [applicationId]: null }));
    }
  };

  const handleRejectApplication = async (applicationId, reason = "") => {
    setActionLoading((prev) => ({ ...prev, [applicationId]: "rejecting" }));

    try {
      console.log("Rejecting application ID:", applicationId);
      if (!applicationId) {
        alert("Application ID is missing");
        return;
      }

      const result = await rejectApplication(applicationId, reason);

      if (result.success) {
        // Update local state using multiple possible ID fields
        setApplications((prev) =>
          prev.map((app) =>
            app._id === applicationId ||
            app.id === applicationId ||
            app.applicationId === applicationId
              ? { ...app, status: "rejected", rejectionReason: reason }
              : app
          )
        );
        alert(result.message);
        setShowRejectionDialog(false);
        setRejectionReason("");
        setSelectedApplication(null);
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error rejecting application:", error);
      alert("Failed to reject application");
    } finally {
      setActionLoading((prev) => ({ ...prev, [applicationId]: null }));
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    setActionLoading((prev) => ({ ...prev, [applicationId]: "updating" }));

    try {
      console.log("Updating status for application ID:", applicationId);
      if (!applicationId) {
        alert("Application ID is missing");
        return;
      }

      const result = await updateApplicationStatus(applicationId, newStatus);

      if (result.success) {
        // Update local state using multiple possible ID fields
        setApplications((prev) =>
          prev.map((app) =>
            app._id === applicationId ||
            app.id === applicationId ||
            app.applicationId === applicationId
              ? { ...app, status: newStatus }
              : app
          )
        );
        alert(result.message);
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    } finally {
      setActionLoading((prev) => ({ ...prev, [applicationId]: null }));
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "reviewed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "accepted":
        return <Check className="h-3 w-3" />;
      case "rejected":
        return <X className="h-3 w-3" />;
      case "reviewed":
        return <Eye className="h-3 w-3" />;
      case "pending":
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  // Extract unique candidates from applications
  const uniqueCandidates = applications.reduce((acc, app) => {
    const candidateId = app.candidate?.id || app.candidateId?.id;
    if (candidateId && !acc.find((c) => c.id === candidateId)) {
      const candidate = {
        id: candidateId,
        name: app.candidateName || app.candidate?.name || app.candidateId?.name,
        email: app.candidate?.email || app.candidateId?.email,
        phone: app.candidate?.profile?.phone || app.candidateId?.profile?.phone,
        location:
          app.candidate?.profile?.location ||
          app.candidateId?.profile?.location,
        experience:
          app.candidate?.profile?.experience ||
          app.candidateId?.profile?.experience,
        education:
          app.candidate?.profile?.education ||
          app.candidateId?.profile?.education,
        skills:
          app.candidate?.profile?.skills ||
          app.candidateId?.profile?.skills ||
          [],
        seniorityLevel:
          app.candidate?.profile?.seniorityLevel ||
          app.candidateId?.profile?.seniorityLevel ||
          app.aiAssessment?.experienceLevel,
        yearsOfExperience:
          app.candidate?.profile?.yearsOfExperience ||
          app.candidateId?.profile?.yearsOfExperience,
        createdAt:
          app.candidate?.createdAt ||
          app.candidateId?.createdAt ||
          app.appliedAt,
        // Include application data for context
        applications: applications.filter(
          (a) => (a.candidate?.id || a.candidateId?.id) === candidateId
        ),
        // Latest AI assessment
        latestAssessment: app.aiAssessment,
      };
      acc.push(candidate);
    }
    return acc;
  }, []);

  const filteredCandidates = uniqueCandidates.filter((candidate) => {
    const matchesSearch =
      !searchTerm ||
      candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills?.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesSkill =
      skillFilter === "all" ||
      candidate.skills?.some((skill) =>
        skill.toLowerCase().includes(skillFilter.toLowerCase())
      );

    const matchesExperience =
      experienceFilter === "all" ||
      candidate.seniorityLevel
        ?.toLowerCase()
        .includes(experienceFilter.toLowerCase());

    return matchesSearch && matchesSkill && matchesExperience;
  });

  const allSkills = [
    ...new Set(uniqueCandidates.flatMap((c) => c.skills || [])),
  ];
  const allExperienceLevels = [
    ...new Set(uniqueCandidates.map((c) => c.seniorityLevel).filter(Boolean)),
  ];

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
    );
  }

  return (
    <ProtectedRoute allowedRoles={["recruiter"]}>
      <div className="min-h-screen bg-gray-50">
        <AdaptiveNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Candidate Database
            </h1>
            <p className="text-gray-600">
              Browse and search through candidate profiles who have applied to
              your jobs
            </p>
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
              <Select
                value={experienceFilter}
                onValueChange={setExperienceFilter}
              >
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
                {filteredCandidates.length} of {uniqueCandidates.length}{" "}
                candidates
              </div>
            </div>
          </div>

          {/* Candidates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCandidates.map((candidate) => (
              <Card
                key={candidate.id}
                className="hover:shadow-lg transition-all duration-200 border-0 shadow-md"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                        <User className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                          {candidate.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          {candidate.email}
                        </CardDescription>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {candidate.seniorityLevel && (
                      <Badge
                        variant="secondary"
                        className="text-xs font-medium bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {candidate.seniorityLevel}
                      </Badge>
                    )}
                    {candidate.yearsOfExperience && (
                      <Badge
                        variant="outline"
                        className="text-xs text-gray-600 border-gray-300"
                      >
                        {candidate.yearsOfExperience} exp
                      </Badge>
                    )}
                    {candidate.location && (
                      <Badge
                        variant="outline"
                        className="text-xs text-gray-600 border-gray-300 flex items-center gap-1"
                      >
                        <MapPin className="h-2.5 w-2.5" />
                        {candidate.location}
                      </Badge>
                    )}
                    {candidate.latestAssessment?.overallScore && (
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          candidate.latestAssessment.overallScore >= 70
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : candidate.latestAssessment.overallScore >= 50
                            ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                            : "bg-red-100 text-red-700 border border-red-200"
                        }`}
                      >
                        {candidate.latestAssessment.overallScore}% Match
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-2 pt-0">
                  {/* Application Status Summary */}
                  {candidate.applications &&
                    candidate.applications.length > 0 && (
                      <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                          Application Status
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {candidate.applications
                            .slice(0, 3)
                            .map((app, index) => (
                              <Badge
                                key={index}
                                className={`text-xs px-2 py-1 flex items-center gap-1 ${getStatusBadgeColor(
                                  app.status
                                )}`}
                              >
                                {getStatusIcon(app.status)}
                                {app.status}
                              </Badge>
                            ))}
                          {candidate.applications.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-xs px-2 py-1 text-gray-500 border-gray-300 bg-gray-50"
                            >
                              +{candidate.applications.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Experience Summary */}
                  {candidate.experience && (
                    <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                      <p className="text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">
                        Experience
                      </p>
                      <p className="text-sm text-gray-800 line-clamp-2 leading-relaxed">
                        {candidate.experience}
                      </p>
                    </div>
                  )}

                  {/* Skills */}
                  {candidate.skills && candidate.skills.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                        Skills
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {candidate.skills.slice(0, 3).map((skill, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 border-indigo-200 font-medium"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {candidate.skills.length > 3 && (
                          <Badge
                            variant="outline"
                            className="text-xs px-2 py-1 text-gray-500 border-gray-300 bg-gray-50"
                          >
                            +{candidate.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* AI Assessment Preview */}
                  {candidate.latestAssessment && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-4 w-4 text-blue-600" />
                        <p className="text-xs font-medium text-blue-900 uppercase tracking-wide">
                          AI Assessment
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-sm font-bold text-blue-600">
                            {candidate.latestAssessment.skillsMatch}%
                          </div>
                          <div className="text-xs text-gray-600">Skills</div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-green-600">
                            {candidate.latestAssessment.experienceMatch}%
                          </div>
                          <div className="text-xs text-gray-600">
                            Experience
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-purple-600">
                            {candidate.latestAssessment.cultureFit}%
                          </div>
                          <div className="text-xs text-gray-600">Culture</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        <span>
                          {candidate.applications?.length || 0} applications
                        </span>
                      </div>
                      <div>
                        Added{" "}
                        {new Date(candidate.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          View Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            {candidate.name}
                          </DialogTitle>
                          <DialogDescription>
                            Complete candidate profile and application history
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                          {/* Contact Information */}
                          <div>
                            <h3 className="text-lg font-semibold mb-3">
                              Contact Information
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">
                                  {candidate.email}
                                </span>
                              </div>
                              {candidate.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm">
                                    {candidate.phone}
                                  </span>
                                </div>
                              )}
                              {candidate.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm">
                                    {candidate.location}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* AI Assessment */}
                          {candidate.latestAssessment && (
                            <div>
                              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <Award className="h-5 w-5" />
                                Latest AI Assessment
                              </h3>
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-blue-600">
                                      {candidate.latestAssessment.overallScore}%
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      Overall
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-green-600">
                                      {candidate.latestAssessment.skillsMatch}%
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      Skills
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-purple-600">
                                      {
                                        candidate.latestAssessment
                                          .experienceMatch
                                      }
                                      %
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      Experience
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-orange-600">
                                      {candidate.latestAssessment.cultureFit}%
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      Culture Fit
                                    </div>
                                  </div>
                                </div>
                                {candidate.latestAssessment.summary && (
                                  <p className="text-sm text-gray-700 bg-white p-3 rounded border-l-4 border-blue-400">
                                    <strong>AI Summary:</strong>{" "}
                                    {candidate.latestAssessment.summary}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Professional Experience */}
                          {candidate.experience && (
                            <div>
                              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <Briefcase className="h-5 w-5" />
                                Professional Experience
                              </h3>
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-700 whitespace-pre-line">
                                  {candidate.experience}
                                </p>
                                {candidate.yearsOfExperience && (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <span className="text-sm font-medium">
                                      Years of Experience:{" "}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                      {candidate.yearsOfExperience}
                                    </span>
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
                                <p className="text-sm text-gray-700 whitespace-pre-line">
                                  {candidate.education}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Skills */}
                          {candidate.skills && candidate.skills.length > 0 && (
                            <div>
                              <h3 className="text-lg font-semibold mb-3">
                                Skills & Technologies
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {candidate.skills.map((skill, index) => (
                                  <Badge key={index} variant="secondary">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Application History with Actions */}
                          {candidate.applications &&
                            candidate.applications.length > 0 && (
                              <div>
                                <h3 className="text-lg font-semibold mb-3">
                                  Application History & Actions
                                </h3>
                                <div className="space-y-4">
                                  {candidate.applications.map((app, index) => {
                                    const appId = getApplicationId(app);
                                    console.log(
                                      "Application ID for",
                                      app.jobTitle,
                                      ":",
                                      appId
                                    );

                                    return (
                                      <div
                                        key={index}
                                        className="bg-gray-50 p-4 rounded-lg border"
                                      >
                                        <div className="flex justify-between items-start mb-3">
                                          <div className="flex-1">
                                            <p className="font-medium text-sm mb-1">
                                              {app.jobTitle}
                                            </p>
                                            <p className="text-xs text-gray-600 mb-2">
                                              Applied{" "}
                                              {new Date(
                                                app.appliedAt
                                              ).toLocaleDateString()}
                                            </p>
                                            {app.aiAssessment?.overallScore && (
                                              <p className="text-xs text-gray-600">
                                                AI Match Score:{" "}
                                                {app.aiAssessment.overallScore}%
                                              </p>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Badge
                                              className={`text-xs flex items-center gap-1 ${getStatusBadgeColor(
                                                app.status
                                              )}`}
                                            >
                                              {getStatusIcon(app.status)}
                                              {app.status}
                                            </Badge>
                                          </div>
                                        </div>

                                        {/* Status Update Dropdown */}
                                        <div className="flex items-center gap-2 mb-3">
                                          <label className="text-xs font-medium text-gray-700">
                                            Update Status:
                                          </label>
                                          <Select
                                            value={app.status}
                                            onValueChange={(newStatus) =>
                                              handleStatusChange(
                                                appId,
                                                newStatus
                                              )
                                            }
                                            disabled={
                                              actionLoading[appId] || !appId
                                            }
                                          >
                                            <SelectTrigger className="w-32 h-8 text-xs">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="pending">
                                                Pending
                                              </SelectItem>
                                              <SelectItem value="reviewed">
                                                Reviewed
                                              </SelectItem>
                                              <SelectItem value="accepted">
                                                Accepted
                                              </SelectItem>
                                              <SelectItem value="rejected">
                                                Rejected
                                              </SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                          <Button
                                            size="sm"
                                            onClick={() =>
                                              handleApproveApplication(appId)
                                            }
                                            disabled={
                                              app.status === "accepted" ||
                                              actionLoading[appId] ||
                                              !appId
                                            }
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                          >
                                            {actionLoading[appId] ===
                                            "approving" ? (
                                              "Approving..."
                                            ) : (
                                              <>
                                                <Check className="h-3 w-3 mr-1" />
                                                Approve
                                              </>
                                            )}
                                          </Button>

                                          <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => {
                                              setSelectedApplication({
                                                ...app,
                                                _id: appId,
                                              });
                                              setShowRejectionDialog(true);
                                            }}
                                            disabled={
                                              app.status === "rejected" ||
                                              actionLoading[appId] ||
                                              !appId
                                            }
                                          >
                                            {actionLoading[appId] ===
                                            "rejecting" ? (
                                              "Rejecting..."
                                            ) : (
                                              <>
                                                <X className="h-3 w-3 mr-1" />
                                                Reject
                                              </>
                                            )}
                                          </Button>
                                        </div>

                                        {/* Show rejection reason if exists */}
                                        {app.rejectionReason && (
                                          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs">
                                            <strong>Rejection Reason:</strong>{" "}
                                            {app.rejectionReason}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                          {/* Metadata */}
                          <div className="border-t pt-4">
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">
                                  First Applied:
                                </span>{" "}
                                {new Date(
                                  candidate.createdAt
                                ).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="font-medium">
                                  Candidate ID:
                                </span>{" "}
                                {candidate.id}
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
                  <User className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ||
                  skillFilter !== "all" ||
                  experienceFilter !== "all"
                    ? "No matching candidates"
                    : "No candidates yet"}
                </h3>
                <p className="text-gray-600">
                  {searchTerm ||
                  skillFilter !== "all" ||
                  experienceFilter !== "all"
                    ? "Try adjusting your search criteria to find more candidates."
                    : "Candidates will appear here once they start applying to your job postings."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Rejection Dialog */}
        <Dialog
          open={showRejectionDialog}
          onOpenChange={setShowRejectionDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Application</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this application
                (optional).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectionDialog(false);
                    setRejectionReason("");
                    setSelectedApplication(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() =>
                    selectedApplication &&
                    handleRejectApplication(
                      selectedApplication._id,
                      rejectionReason
                    )
                  }
                  disabled={
                    !selectedApplication ||
                    actionLoading[selectedApplication?._id]
                  }
                >
                  {actionLoading[selectedApplication?._id] === "rejecting"
                    ? "Rejecting..."
                    : "Reject Application"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
