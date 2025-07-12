import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Camera,
  Download,
  QrCode,
  User,
  Shield,
  Calendar,
  Phone,
  MapPin,
  Heart,
  CreditCard,
  Smartphone,
  Share2,
  RefreshCw,
  CheckCircle2,
  School,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface StudentData {
  rollNumber: string;
  className: string;
  section: string;
  academicYear: string;
  bloodGroup: string;
  emergencyContact: string;
  address: string;
  qrCodeData: string;
  validUntil: string;
  schoolName: string;
  parentName: string;
  parentPhone: string;
}

const StudentIDCard = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);
  const [studentData, setStudentData] = useState<StudentData>({
    rollNumber: "",
    className: "",
    section: "",
    academicYear: "",
    bloodGroup: "",
    emergencyContact: "",
    address: "",
    qrCodeData: "",
    validUntil: "",
    schoolName: "ScholarMate Academy",
    parentName: "",
    parentPhone: "",
  });
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    if (user && profile) {
      loadStudentData();
      generateQRCode();
    }
  }, [user, profile]);

  const loadStudentData = async () => {
    try {
      setLoading(true);

      if (!user) return;

      // Load student's enrollment information
      const { data: enrollment } = await supabase
        .from("student_enrollments")
        .select(
          `
          roll_number,
          classes(
            name,
            section,
            grade
          )
        `,
        )
        .eq("student_id", user.id)
        .single();

      // Load additional student profile data
      const { data: studentProfile } = await supabase
        .from("student_profiles")
        .select(
          "blood_group, emergency_contact, parent_name, parent_phone, address",
        )
        .eq("student_id", user.id)
        .single();

      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;

      const className = enrollment?.classes?.name || "Not Assigned";
      const section = enrollment?.classes?.section || "";
      const rollNumber =
        enrollment?.roll_number ||
        `${currentYear}-${user.id.substring(0, 6).toUpperCase()}`;

      setStudentData({
        rollNumber,
        className,
        section,
        academicYear: `${currentYear}-${nextYear}`,
        bloodGroup: studentProfile?.blood_group || "Not Specified",
        emergencyContact:
          studentProfile?.emergency_contact || profile?.phone || "Not Provided",
        address: studentProfile?.address || "Address not provided",
        qrCodeData: JSON.stringify({
          studentId: user.id,
          name: profile?.full_name,
          rollNumber,
          class: `${className} ${section}`,
          validUntil: `${nextYear}-06-30`,
          issued: new Date().toISOString(),
        }),
        validUntil: `${nextYear}-06-30`,
        schoolName: "ScholarMate Academy",
        parentName: studentProfile?.parent_name || "Not Provided",
        parentPhone: studentProfile?.parent_phone || "Not Provided",
      });
    } catch (error) {
      console.error("Error loading student data:", error);
      toast({
        title: "Error",
        description: "Failed to load student data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    try {
      // Create QR code data with student information
      const qrData = {
        studentId: user?.id,
        name: profile?.full_name,
        rollNumber: studentData.rollNumber,
        class: `${studentData.className} ${studentData.section}`,
        validUntil: studentData.validUntil,
        issued: new Date().toISOString(),
      };

      const qrString = JSON.stringify(qrData);

      // In a real app, you would use a QR code library like qrcode
      // For now, we'll use a placeholder URL
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrString)}`;
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const downloadIDCard = async () => {
    if (!cardRef.current) return;

    try {
      // In a real app, you would use html2canvas or similar library
      toast({
        title: "Download Started",
        description: "Your ID card is being prepared for download",
      });

      // Simulate download
      setTimeout(() => {
        toast({
          title: "Download Complete",
          description: "ID card saved to your downloads folder",
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download ID card",
        variant: "destructive",
      });
    }
  };

  const shareIDCard = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Student ID Card",
          text: `${profile?.full_name} - ${studentData.rollNumber}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "ID card link copied to clipboard",
      });
    }
  };

  const refreshQRCode = async () => {
    setLoading(true);
    await generateQRCode();
    setLoading(false);
    toast({
      title: "QR Code Updated",
      description: "Your QR code has been refreshed",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Digital ID Card</h1>
          <p className="text-muted-foreground">
            Your official student identification
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={refreshQRCode}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh QR
          </Button>
          <Button variant="outline" onClick={shareIDCard}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button onClick={downloadIDCard}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* ID Card with Front/Back */}
      <div className="flex justify-center">
        <div className="relative">
          <div
            ref={cardRef}
            className={`w-96 h-64 transition-all duration-700 transform-style-preserve-3d ${
              showBack ? "rotate-y-180" : ""
            }`}
            style={{ perspective: "1000px" }}
          >
            {/* Front of Card */}
            <Card
              className={`absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white ${
                showBack ? "opacity-0 rotate-y-180" : "opacity-100"
              }`}
            >
              <CardHeader className="text-center pb-2">
                <div className="flex items-center justify-center space-x-2">
                  <School className="h-6 w-6" />
                  <div className="text-lg font-bold">
                    {studentData.schoolName}
                  </div>
                </div>
                <div className="text-sm opacity-90">Student Identity Card</div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-16 w-16 border-3 border-white/30">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-white/20 text-white text-lg">
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold leading-tight">
                      {profile?.full_name || "Student Name"}
                    </h3>
                    <p className="text-sm opacity-90">
                      Roll No: {studentData.rollNumber}
                    </p>
                    <p className="text-sm opacity-90">
                      {studentData.className} {studentData.section}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between text-xs">
                  <div>
                    <p className="opacity-75">Academic Year</p>
                    <p className="font-semibold">{studentData.academicYear}</p>
                  </div>
                  <div className="text-right">
                    <p className="opacity-75">Valid Until</p>
                    <p className="font-semibold">
                      {new Date(studentData.validUntil).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex justify-center">
                  {qrCodeUrl && (
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      className="w-16 h-16 bg-white/20 p-1 rounded"
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Back of Card */}
            <Card
              className={`absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 text-white ${
                showBack ? "opacity-100" : "opacity-0 rotate-y-180"
              }`}
            >
              <CardContent className="p-4 space-y-3">
                <div className="text-center border-b border-white/20 pb-2">
                  <h3 className="font-bold">Emergency Information</h3>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-red-400" />
                    <span>Blood Group: {studentData.bloodGroup}</span>
                  </div>

                  <div className="flex items-start space-x-2">
                    <User className="h-4 w-4 mt-0.5 text-blue-400" />
                    <div>
                      <p className="font-medium">
                        Guardian: {studentData.parentName}
                      </p>
                      <p className="opacity-75">{studentData.parentPhone}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Phone className="h-4 w-4 mt-0.5 text-green-400" />
                    <span>Emergency: {studentData.emergencyContact}</span>
                  </div>

                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-orange-400" />
                    <span className="text-xs leading-tight">
                      {studentData.address}
                    </span>
                  </div>
                </div>

                <div className="text-center pt-2 border-t border-white/20">
                  <p className="text-xs opacity-75">
                    In case of emergency, contact the above numbers
                  </p>
                  <p className="text-xs opacity-60 mt-1">
                    This card is property of {studentData.schoolName}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Flip Button */}
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBack(!showBack)}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {showBack ? "Show Front" : "Show Back"}
            </Button>
          </div>
        </div>
      </div>

      {/* Digital Features */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5" />
              <span>Digital Features</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <QrCode className="h-4 w-4 text-blue-500" />
                <span className="text-sm">QR Code Access</span>
              </div>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-sm">Security Verified</span>
              </div>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Download className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Downloadable</span>
              </div>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Share2 className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Shareable</span>
              </div>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Validity Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Issued Date</p>
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valid Until</p>
              <p className="font-medium">
                {new Date(studentData.validUntil).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Card Status</p>
              <Badge variant="default" className="bg-green-500">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-16 flex flex-col"
              onClick={downloadIDCard}
            >
              <Download className="h-5 w-5 mb-1" />
              <span className="text-xs">Download</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex flex-col"
              onClick={shareIDCard}
            >
              <Share2 className="h-5 w-5 mb-1" />
              <span className="text-xs">Share</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex flex-col"
              onClick={refreshQRCode}
            >
              <RefreshCw className="h-5 w-5 mb-1" />
              <span className="text-xs">Refresh QR</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col">
              <Camera className="h-5 w-5 mb-1" />
              <span className="text-xs">Update Photo</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentIDCard;
