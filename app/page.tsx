'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check for auth token in localStorage
    const token = localStorage.getItem('auth_token');

    if (token) {
      // User is authenticated, redirect to dashboard
      router.replace(ROUTES.dashboard);
    } else {
      // No token, redirect to login
      router.replace(ROUTES.login);
    }
    setIsChecking(false);
  }, [router]);

  // Show loading state while checking auth
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-white"></div>
        </div>
      </div>
    );
  }

  return null;
}
