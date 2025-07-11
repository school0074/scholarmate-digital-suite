import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("student" | "teacher" | "admin")[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const [demoProfile, setDemoProfile] = useState<{
    isDemo?: boolean;
    role?: string;
  } | null>(null);

  useEffect(() => {
    // Check for demo access
    const demoData = localStorage.getItem("demoStudentData");
    if (demoData) {
      try {
        setDemoProfile(JSON.parse(demoData));
      } catch (error) {
        console.error("Error parsing demo data:", error);
        localStorage.removeItem("demoStudentData");
      }
    }
  }, []);

  // Handle demo access for student routes
  const isDemoAccess = demoProfile?.isDemo;
  const isStudentRoute = allowedRoles?.includes("student");

  if (isDemoAccess && isStudentRoute) {
    // Allow demo access for student routes
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
