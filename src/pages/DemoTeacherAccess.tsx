import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  BookOpen,
  Calendar,
  FileText,
  BarChart3,
  Clock,
  Users,
  MessageCircle,
  Upload,
  CheckCircle2,
  Bell,
  Award,
  Target,
} from "lucide-react";

const DemoTeacherAccess = () => {
  const [teacherName, setTeacherName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDemoAccess = () => {
    if (!teacherName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to access the demo",
        variant: "destructive",
      });
      return;
    }

    // Store demo teacher data in localStorage
    localStorage.setItem(
      "demoTeacherData",
      JSON.stringify({
        id: "demo-teacher-123",
        full_name: teacherName,
        email: `${teacherName.toLowerCase().replace(/\s+/g, ".")}@demo.school.edu`,
        role: "teacher",
        isDemo: true,
      }),
    );

    toast({
      title: "Demo Access Granted!",
      description: `Welcome ${teacherName}! Exploring teacher features...`,
    });

    // Navigate to teacher dashboard
    setTimeout(() => {
      navigate("/teacher/dashboard");
    }, 1000);
  };

  const features = [
    {
      icon: <FileText className="h-8 w-8 text-blue-500" />,
      title: "Create & Assign Homework",
      description: "Create assignments and track student submissions",
    },
    {
      icon: <CheckCircle2 className="h-8 w-8 text-green-500" />,
      title: "Mark Attendance Digitally",
      description: "Quick and easy digital attendance marking system",
    },
    {
      icon: <Upload className="h-8 w-8 text-purple-500" />,
      title: "Upload Study Materials",
      description: "Share PDFs, videos, and links with students",
    },
    {
      icon: <Calendar className="h-8 w-8 text-orange-500" />,
      title: "Manage Timetable",
      description: "View and manage your teaching schedule",
    },
    {
      icon: <Bell className="h-8 w-8 text-red-500" />,
      title: "Broadcast Announcements",
      description: "Send announcements to all students in your classes",
    },
    {
      icon: <Award className="h-8 w-8 text-yellow-500" />,
      title: "Review & Grade Assignments",
      description: "Grade student submissions and provide feedback",
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-cyan-500" />,
      title: "Send Private Notes",
      description: "Communicate privately with students and parents",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-indigo-500" />,
      title: "Analytics & Reports",
      description: "View class performance and attendance analytics",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Teacher Portal Demo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Experience comprehensive teaching tools and classroom management
            features
          </p>

          {/* Demo Access Card */}
          <Card className="max-w-md mx-auto mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2">
                <User className="h-6 w-6" />
                <span>Quick Demo Access</span>
              </CardTitle>
              <CardDescription>
                Enter your name to explore the teacher dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter your name"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleDemoAccess()}
              />
              <Button onClick={handleDemoAccess} className="w-full" size="lg">
                Access Teacher Demo
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                No registration required • All data is mock/demo data
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>🎯 What You Can Do</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Create and assign homework to your classes</li>
                <li>• Mark attendance digitally with quick actions</li>
                <li>• Upload and share study materials (PDFs, videos)</li>
                <li>• Manage your teaching timetable and schedule</li>
                <li>• Broadcast announcements to all students</li>
                <li>• Review and grade student submissions</li>
                <li>• Send private notes to students and parents</li>
                <li>• View class analytics and performance reports</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📱 Mobile-Friendly Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Responsive design works on all devices</li>
                <li>• Touch-friendly attendance marking</li>
                <li>• Quick access to common teacher tasks</li>
                <li>• Mobile-optimized grading interface</li>
                <li>• Real-time notifications and alerts</li>
                <li>• Offline-capable features</li>
                <li>• Easy file upload from mobile devices</li>
                <li>• Swipe gestures for quick navigation</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Teacher Dashboard Preview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>📊 Teacher Dashboard Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-700 dark:text-blue-300">
                  Class Management
                </h4>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Manage multiple classes
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-semibold text-green-700 dark:text-green-300">
                  Assignment Tracking
                </h4>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Track submissions & grades
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <Clock className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <h4 className="font-semibold text-purple-700 dark:text-purple-300">
                  Time Management
                </h4>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  Schedule & timetable
                </p>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <BarChart3 className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <h4 className="font-semibold text-orange-700 dark:text-orange-300">
                  Analytics
                </h4>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  Performance insights
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access Buttons */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Or jump directly to specific features:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/teacher/dashboard")}
            >
              Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/teacher/homework")}
            >
              Homework
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/teacher/attendance")}
            >
              Attendance
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/teacher/materials")}
            >
              Materials
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/teacher/timetable")}
            >
              Timetable
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/teacher/announcements")}
            >
              Announcements
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/teacher/grading")}
            >
              Grading
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/teacher/messages")}
            >
              Messages
            </Button>
          </div>
        </div>

        {/* Demo Info */}
        <Card className="mt-8">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Demo Note:</strong> All features are fully functional
              with realistic mock data. No database connection required -
              perfect for testing and evaluation.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DemoTeacherAccess;
