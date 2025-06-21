"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  CheckCircle,
  XCircle,
  Eye,
  TrendingUp,
  AlertTriangle,
  Target,
  Award,
} from "lucide-react"

export function ApplicationDetails({ application, onStatusUpdate }) {
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBgColor = (score) => {
    if (score >= 80) return "bg-green-50 border-green-200"
    if (score >= 60) return "bg-yellow-50 border-yellow-200"
    return "bg-red-50 border-red-200"
  }

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case "Highly Recommended":
        return "text-green-600 bg-green-50 border-green-200"
      case "Recommended":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "Consider":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "Not Recommended":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{application.candidateName}</CardTitle>
              <CardDescription className="text-lg mt-1">Applied for {application.jobTitle}</CardDescription>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getScoreColor(application.aiAssessment?.overallScore || 0)}`}>
                {application.aiAssessment?.overallScore || 0}%
              </div>
              <p className="text-sm text-gray-500">AI Match Score</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge
                variant={
                  application.status === "pending"
                    ? "secondary"
                    : application.status === "reviewed"
                      ? "outline"
                      : application.status === "accepted"
                        ? "default"
                        : "destructive"
                }
              >
                {application.status}
              </Badge>
              <span className="text-sm text-gray-600">
                Applied {new Date(application.appliedAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex gap-2">
              {application.status === "pending" && (
                <>
                  <Button size="sm" variant="outline" onClick={() => onStatusUpdate(application.id, "reviewed")}>
                    <Eye className="h-4 w-4 mr-1" />
                    Mark Reviewed
                  </Button>
                  <Button size="sm" onClick={() => onStatusUpdate(application.id, "accepted")}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onStatusUpdate(application.id, "rejected")}>
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </>
              )}
              {application.status === "reviewed" && (
                <>
                  <Button size="sm" onClick={() => onStatusUpdate(application.id, "accepted")}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onStatusUpdate(application.id, "rejected")}>
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Assessment */}
      {application.aiAssessment && (
        <Card className={getScoreBgColor(application.aiAssessment.overallScore)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              AI Assessment & Recommendation
            </CardTitle>
            <CardDescription>Comprehensive analysis powered by Gemini AI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Score */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Match Score</span>
                <span className={`text-lg font-bold ${getScoreColor(application.aiAssessment.overallScore)}`}>
                  {application.aiAssessment.overallScore}%
                </span>
              </div>
              <Progress value={application.aiAssessment.overallScore} className="h-3" />
            </div>

            {/* Recommendation */}
            {application.aiAssessment.recommendation && (
              <div
                className={`p-4 rounded-lg border ${getRecommendationColor(application.aiAssessment.recommendation)}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5" />
                  <span className="font-medium">AI Recommendation</span>
                </div>
                <p className="text-sm font-semibold">{application.aiAssessment.recommendation}</p>
                {application.aiAssessment.recommendationReason && (
                  <p className="text-sm mt-1">{application.aiAssessment.recommendationReason}</p>
                )}
              </div>
            )}

            {/* Detailed Scores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white/50 rounded-lg">
                <div className={`text-2xl font-bold ${getScoreColor(application.aiAssessment.skillsMatch || 0)}`}>
                  {application.aiAssessment.skillsMatch || 0}%
                </div>
                <p className="text-sm text-gray-600">Skills Match</p>
              </div>
              <div className="text-center p-3 bg-white/50 rounded-lg">
                <div className={`text-2xl font-bold ${getScoreColor(application.aiAssessment.experienceMatch || 0)}`}>
                  {application.aiAssessment.experienceMatch || 0}%
                </div>
                <p className="text-sm text-gray-600">Experience Match</p>
              </div>
              <div className="text-center p-3 bg-white/50 rounded-lg">
                <div
                  className={`text-2xl font-bold ${getScoreColor(application.aiAssessment.qualificationMatch || 0)}`}
                >
                  {application.aiAssessment.qualificationMatch || 0}%
                </div>
                <p className="text-sm text-gray-600">Qualification Match</p>
              </div>
            </div>

            {/* Key Strengths */}
            {application.aiAssessment.keyStrengths && application.aiAssessment.keyStrengths.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Key Strengths
                </h4>
                <div className="flex flex-wrap gap-2">
                  {application.aiAssessment.keyStrengths.map((strength, index) => (
                    <Badge key={index} variant="default" className="bg-green-100 text-green-800">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Areas of Concern */}
            {application.aiAssessment.concerns && application.aiAssessment.concerns.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Areas of Concern
                </h4>
                <div className="flex flex-wrap gap-2">
                  {application.aiAssessment.concerns.map((concern, index) => (
                    <Badge key={index} variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                      {concern}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* AI Summary */}
            {application.aiAssessment.summary && (
              <div>
                <h4 className="font-medium mb-2">AI Summary</h4>
                <p className="text-sm text-gray-700 bg-white/50 p-3 rounded-lg">{application.aiAssessment.summary}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Candidate Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {application.resumeData?.personalInfo?.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{application.resumeData.personalInfo.email}</span>
              </div>
            )}
            {application.resumeData?.personalInfo?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{application.resumeData.personalInfo.phone}</span>
              </div>
            )}
            {application.resumeData?.personalInfo?.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{application.resumeData.personalInfo.location}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Skills ({application.resumeData?.skills?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {application.resumeData?.skills && application.resumeData.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {application.resumeData.skills.map((skill, index) => (
                  <Badge key={index} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No skills extracted</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Experience & Education */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Experience */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            {application.resumeData?.experienceSummary ? (
              <p className="text-sm text-gray-700">{application.resumeData.experienceSummary}</p>
            ) : (
              <p className="text-sm text-gray-500">No experience information available</p>
            )}
          </CardContent>
        </Card>

        {/* Education */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent>
            {application.resumeData?.education ? (
              <p className="text-sm text-gray-700">{application.resumeData.education}</p>
            ) : (
              <p className="text-sm text-gray-500">No education information available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cover Letter */}
      {application.coverLetter && (
        <Card>
          <CardHeader>
            <CardTitle>Cover Letter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm whitespace-pre-line">{application.coverLetter}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
