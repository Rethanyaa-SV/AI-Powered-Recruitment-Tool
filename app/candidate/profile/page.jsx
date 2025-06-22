import { getCurrentUser } from "@/lib/data-service";
import { AdaptiveNavbar } from "@/components/adaptive-navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { ProfileEditForm } from "@/components/ProfileEditForm";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  const initialData = {
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.profile?.phone || "",
    location: user?.profile?.location || "",
    summary: user?.profile?.bio || "",
    experience: user?.profile?.experience || "",
    education: user?.profile?.education || "",
    yearsOfExperience: user?.profile?.yearsOfExperience || "",
    seniorityLevel: user?.profile?.seniorityLevel || "",
    skills: user?.profile?.skills || [],
  };

  return (
    <ProtectedRoute allowedRoles={["candidate"]}>
      <div className="min-h-screen bg-gray-50">
        <AdaptiveNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              My Profile
            </h1>
            <p className="text-gray-600">
              Manage your professional information
            </p>
          </div>

          <ProfileEditForm initialData={initialData} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
