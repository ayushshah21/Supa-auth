import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser, getUserRole } from "../lib/supabase/auth";
import type { UserRole } from "../types/supabase";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({
  children,
  allowedRoles,
}: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication...");
        const user = await getCurrentUser();

        if (!user) {
          console.log("No user found, redirecting to login");
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        console.log("User authenticated:", user.id);
        setIsAuthenticated(true);

        // If no specific roles are required, allow access
        if (!allowedRoles) {
          console.log("No roles required, granting access");
          setHasPermission(true);
          setIsLoading(false);
          return;
        }

        console.log("Checking user role for allowed roles:", allowedRoles);
        // Check user's role against allowed roles
        const userRole = await getUserRole(user.id);
        console.log("User role:", userRole);

        const hasRole = userRole ? allowedRoles.includes(userRole) : false;
        console.log("Has permission:", hasRole);

        setHasPermission(hasRole);
        setIsLoading(false);
      } catch (error) {
        console.error("Auth check failed:", {
          error,
          allowedRoles,
          location: location.pathname,
        });
        setIsAuthenticated(false);
        setHasPermission(false);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [allowedRoles, location.pathname]);

  if (isLoading) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
