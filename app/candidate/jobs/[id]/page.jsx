"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { AdaptiveNavbar } from "@/components/adaptive-navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { ResumeUpload } from "@/components/resume-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Clock,
  DollarSign,
  Users,
  Calendar,
  CheckCircle,
  ArrowLeft,
  Briefcase,
  Building,
  Send,
  Target,
  TrendingUp,
} from "lucide-react";

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeData, setResumeData] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    fetchJobDetails();
    checkApplicationStatus();
  }, [params.id]);

  const fetchJobDetails = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch(`/api/candidate/jobs/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setJob(data);
      } else {
        toast({
          title: "Error",
          description: "Job not found",
          variant: "destructive",
        });
        router.push("/candidate/jobs");
      }
    } catch (error) {
      console.error("Error fetching job:", error);
      toast({
        title: "Error",
        description: "Failed to load job details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch(
        `/api/candidate/applications/check/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setHasApplied(data.hasApplied);
      }
    } catch (error) {
      console.error("Error checking application status:", error);
    }
  };

  const handleApply = async () => {
    if (!resumeData) {
      toast({
        title: "Resume Required",
        description: "Please upload your resume before applying",
        variant: "destructive",
      });
      return;
    }

    setApplying(true);
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/candidate/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId: params.id,
          coverLetter,
          resumeData,
        }),
      });

      if (response.ok) {
        setHasApplied(true);
        setShowApplicationForm(false);
        toast({
          title: "Application Submitted",
          description: "Your application has been submitted successfully!",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Application Failed",
          description: error.message || "Failed to submit application",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setApplying(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const formatSalary = (salary) => {
    if (!salary) return "Salary not specified";
    if (typeof salary === "object") {
      const { min, max, currency = "USD" } = salary;
      if (min && max) {
        return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
      }
      return `${currency} ${(min || max).toLocaleString()}`;
    }
    return salary;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["candidate"]}>
        <div className="min-h-screen bg-gray-50">
          <AdaptiveNavbar />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!job) {
    return (
      <ProtectedRoute allowedRoles={["candidate"]}>
        <div className="min-h-screen bg-gray-50">
          <AdaptiveNavbar />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Job not found
              </h1>
              <p className="text-gray-600 mt-2">
                The job you're looking for doesn't exist or has been removed.
              </p>
              <Button
                onClick={() => router.push("/candidate/jobs")}
                className="mt-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["candidate"]}>
      <div className="min-h-screen bg-gray-50">
        <AdaptiveNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.push("/candidate/jobs")}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Header */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                        {job.title}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-4 text-gray-600">
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          <span className="font-medium">{job.company}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          <span className="capitalize">{job.type}</span>
                        </div>
                      </div>
                    </div>
                    {job.matchScore && (
                      <div
                        className={`px-3 py-2 rounded-lg border ${getScoreColor(
                          job.matchScore
                        )}`}
                      >
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          <span className="font-semibold">
                            {job.matchScore}% Match
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Salary</p>
                        <p className="font-semibold">
                          {formatSalary(job.salary)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Posted</p>
                        <p className="font-semibold">
                          {formatDate(job.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Users className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Applications</p>
                        <p className="font-semibold">
                          {job.applicationsCount || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Job Description */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Job Description
                    </h3>
                    <div className="prose prose-sm max-w-none text-gray-700">
                      <p className="whitespace-pre-wrap">{job.description}</p>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Requirements */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Requirements
                    </h3>
                    <div className="prose prose-sm max-w-none text-gray-700">
                      <p className="whitespace-pre-wrap">{job.requirements}</p>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Skills */}
                  {job.skills && job.skills.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Required Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="px-3 py-1"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Application Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Application Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hasApplied ? (
                    <div className="text-center py-4">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-green-900 mb-2">
                        Application Submitted
                      </h3>
                      <p className="text-sm text-green-700">
                        You have already applied to this position. Check your
                        applications page for updates.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => router.push("/candidate/applications")}
                        className="mt-4 w-full"
                      >
                        View Applications
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {!showApplicationForm ? (
                        <Button
                          onClick={() => setShowApplicationForm(true)}
                          className="w-full"
                          size="lg"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Apply Now
                        </Button>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="cover-letter">
                              Cover Letter (Optional)
                            </Label>
                            <Textarea
                              id="cover-letter"
                              placeholder="Tell the employer why you're interested in this role..."
                              value={coverLetter}
                              onChange={(e) => setCoverLetter(e.target.value)}
                              rows={4}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label>Resume Upload</Label>
                            <div className="mt-2">
                              <ResumeUpload
                                onUploadComplete={setResumeData}
                                existingData={resumeData}
                              />
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={handleApply}
                              disabled={applying || !resumeData}
                              className="flex-1"
                            >
                              {applying ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-2" />
                                  Submit Application
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowApplicationForm(false)}
                              disabled={applying}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Job Insights */}
              {job.matchScore && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Job Match Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Overall Match
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-sm font-medium ${getScoreColor(
                            job.matchScore
                          )}`}
                        >
                          {job.matchScore}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${job.matchScore}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600">
                        This score is based on your skills, experience, and the
                        job requirements. Upload your resume to get a more
                        accurate match score.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Company Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    About {job.company}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      <span className="text-sm capitalize">
                        {job.type} Position
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        Posted {formatDate(job.createdAt)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
