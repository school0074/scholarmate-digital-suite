import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import TeacherDashboard from "./dashboards/TeacherDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";

const DashboardPage = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/auth" replace />;
  }

  switch (profile.role) {
    case "student":
      return <Navigate to="/student/dashboard" replace />;
    case "teacher":
      return <TeacherDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return <Navigate to="/auth" replace />;
  }
};

export default DashboardPage;
