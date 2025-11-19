"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchCurrentUser } from "@/lib/serverUtils";
import { retrieveSessionToken } from "@/lib/utils";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requireAnyRole?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requiredRoles = [],
  requireAnyRole = true,
  redirectTo = "/auth/login"
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const token = retrieveSessionToken();
      
      if (!token) {
        router.push(redirectTo);
        return;
      }

      const user = await fetchCurrentUser(token, false);
      
      if (!user) {
        router.push(redirectTo);
        return;
      }
      if (requiredRoles.length === 0) {
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }

      const userRoles = user.roles || [];
      
      let hasAccess = false;
      
      if (requireAnyRole) {
        hasAccess = requiredRoles.some(role => userRoles.includes(role));
      } else {
        hasAccess = requiredRoles.every(role => userRoles.includes(role));
      }

      if (hasAccess) {
        setIsAuthorized(true);
        setIsLoading(false);
      } else {
        setIsAuthorized(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error checking access:", error);
      router.push(redirectTo);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. 
            {requiredRoles.length > 0 && (
              <span className="block mt-2 text-sm">
                Required role{requiredRoles.length > 1 ? 's' : ''}: {requiredRoles.join(', ')}
              </span>
            )}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => router.back()}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
