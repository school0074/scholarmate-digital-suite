import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, GraduationCap } from "lucide-react";

const DemoStudentAccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to authentication page after a short delay
    const timer = setTimeout(() => {
      navigate("/auth");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Demo Access Disabled</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Demo access has been disabled. Please use your school-provided
            credentials to access the system.
          </p>
          <p className="text-sm text-muted-foreground">
            You will be redirected to the login page automatically, or click
            below to proceed immediately.
          </p>
          <Button onClick={() => navigate("/auth")} className="w-full">
            Go to Login
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoStudentAccess;
