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
    // Check for demo access (both student and teacher)
    const demoStudentData = localStorage.getItem("demoStudentData");
    const demoTeacherData = localStorage.getItem("demoTeacherData");

    if (demoStudentData) {
      try {
        setDemoProfile(JSON.parse(demoStudentData));
      } catch (error) {
        console.error("Error parsing demo student data:", error);
        localStorage.removeItem("demoStudentData");
      }
    } else if (demoTeacherData) {
      try {
        setDemoProfile(JSON.parse(demoTeacherData));
      } catch (error) {
        console.error("Error parsing demo teacher data:", error);
        localStorage.removeItem("demoTeacherData");
      }
    }
  }, []);

  // Handle demo access for student and teacher routes
  const isDemoAccess = demoProfile?.isDemo;
  const isStudentRoute = allowedRoles?.includes("student");
  const isTeacherRoute = allowedRoles?.includes("teacher");
  const isDemoStudent = isDemoAccess && demoProfile?.role === "student";
  const isDemoTeacher = isDemoAccess && demoProfile?.role === "teacher";

  if ((isDemoStudent && isStudentRoute) || (isDemoTeacher && isTeacherRoute)) {
    // Allow demo access for matching routes
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
