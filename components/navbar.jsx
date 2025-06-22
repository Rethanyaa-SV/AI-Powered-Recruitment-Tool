"use client";

import { Button } from "@/components/ui/button";
import { signOut, signIn, useSession } from "next-auth/react";
import { LogOut, User, Briefcase, Users } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  const { data: session } = useSession();

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  const handleSignIn = () => {
    signIn();
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-900">
              AI Recruitment Tool
            </Link>

            <nav className="flex space-x-4">
              <Link href="/recruiter">
                <Button variant="ghost" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Recruiter
                </Button>
              </Link>
              <Link href="/candidate">
                <Button variant="ghost" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Candidate
                </Button>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {session?.user ? (
              <>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{session.user.name}</span>
                </div>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Button onClick={handleSignIn}>Sign In</Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
