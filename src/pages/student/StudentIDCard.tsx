import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  User, 
  Phone, 
  MapPin, 
  Calendar,
  GraduationCap,
  IdCard
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface StudentData {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  avatar_url?: string;
  class_name?: string;
  section?: string;
  roll_number?: string;
}

const StudentIDCard = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadStudentData();
    }
  }, [profile]);

  const loadStudentData = async () => {
    try {
      setLoading(true);

      // Get basic profile data
      const profileData: StudentData = {
        id: profile?.id || "",
        full_name: profile?.full_name || "Student Name",
        email: profile?.email || "",
        phone: profile?.phone || "N/A",
        address: profile?.address || "N/A",
        date_of_birth: profile?.date_of_birth || "",
        avatar_url: profile?.avatar_url || undefined,
      };

      // Try to get enrollment data
      const { data: enrollment, error } = await supabase
        .from("student_enrollments")
        .select(`
          roll_number,
          classes (
            name,
            section
          )
        `)
        .eq("student_id", profile?.id)
        .single();

      if (!error && enrollment) {
        profileData.class_name = enrollment.classes?.name;
        profileData.section = enrollment.classes?.section;
        profileData.roll_number = enrollment.roll_number;
      }

      setStudentData(profileData);
    } catch (error) {
      console.error("Error loading student data:", error);
      toast({
        title: "Error",
        description: "Failed to load student information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadIDCard = () => {
    toast({
      title: "Download Started",
      description: "Your ID card is being prepared for download",
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!studentData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load student data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Student ID Card</h1>
          <p className="text-muted-foreground">
            Your digital student identification
          </p>
        </div>
        <Button onClick={downloadIDCard}>
          <Download className="h-4 w-4 mr-2" />
          Download ID
        </Button>
      </div>

      {/* ID Card */}
      <div className="max-w-2xl mx-auto">
        <Card className="overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-white">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-2">
                <GraduationCap className="h-8 w-8 mr-2" />
                <h2 className="text-2xl font-bold">School Management System</h2>
              </div>
              <p className="text-primary-foreground/80">Student ID Card</p>
            </div>

            {/* Student Info */}
            <div className="flex items-center space-x-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-white/20 rounded-lg flex items-center justify-center">
                  {studentData.avatar_url ? (
                    <img
                      src={studentData.avatar_url}
                      alt="Student"
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-white/60" />
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-xl font-bold">{studentData.full_name}</h3>
                  <p className="text-primary-foreground/80">{studentData.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <IdCard className="h-4 w-4" />
                    <span>ID: {studentData.id.slice(0, 8)}</span>
                  </div>
                  {studentData.roll_number && (
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="h-4 w-4" />
                      <span>Roll: {studentData.roll_number}</span>
                    </div>
                  )}
                  {studentData.class_name && (
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="h-4 w-4" />
                      <span>Class: {studentData.class_name} {studentData.section}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>{studentData.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-white/20 text-center text-sm text-primary-foreground/80">
              <p>Valid for Academic Year 2024-25</p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Additional Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Address: {studentData.address}</span>
              </div>
              {studentData.date_of_birth && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    DOB: {new Date(studentData.date_of_birth).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentIDCard;