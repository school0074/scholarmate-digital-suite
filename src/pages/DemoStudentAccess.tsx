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
  CreditCard,
  MessageCircle,
  Trophy,
} from "lucide-react";

const DemoStudentAccess = () => {
  const [studentName, setStudentName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDemoAccess = () => {
    if (!studentName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to access the demo",
        variant: "destructive",
      });
      return;
    }

    // Store demo student data in localStorage
    localStorage.setItem(
      "demoStudentData",
      JSON.stringify({
        id: "demo-student-123",
        full_name: studentName,
        email: `${studentName.toLowerCase().replace(/\s+/g, ".")}@demo.school.com`,
        role: "student",
        isDemo: true,
      }),
    );

    toast({
      title: "Demo Access Granted!",
      description: `Welcome ${studentName}! Exploring student features...`,
    });

    // Navigate to student dashboard
    setTimeout(() => {
      navigate("/student/dashboard");
    }, 1000);
  };

  const features = [
    {
      icon: <User className="h-8 w-8 text-blue-500" />,
      title: "Digital ID Card",
      description: "View and download your student ID card with QR code",
    },
    {
      icon: <Calendar className="h-8 w-8 text-green-500" />,
      title: "Attendance Tracker",
      description: "Track your daily attendance and view patterns",
    },
    {
      icon: <FileText className="h-8 w-8 text-orange-500" />,
      title: "Homework System",
      description: "View assignments, submit work, and track deadlines",
    },
    {
      icon: <Clock className="h-8 w-8 text-purple-500" />,
      title: "Timetable & Alerts",
      description: "Access your class schedule with reminders",
    },
    {
      icon: <BookOpen className="h-8 w-8 text-red-500" />,
      title: "Exam Schedule",
      description: "View upcoming exams with countdown timers",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-indigo-500" />,
      title: "Gradebook",
      description: "Check your marks and academic progress",
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-cyan-500" />,
      title: "Ask a Doubt",
      description: "Chat with teachers and get help",
    },
    {
      icon: <Trophy className="h-8 w-8 text-yellow-500" />,
      title: "Progress Tracker",
      description: "View achievements and progress reports",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Student Portal Demo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Experience all the student features without needing to sign up
          </p>

          {/* Demo Access Card */}
          <Card className="max-w-md mx-auto mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2">
                <User className="h-6 w-6" />
                <span>Quick Demo Access</span>
              </CardTitle>
              <CardDescription>
                Enter your name to explore the student dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter your name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleDemoAccess()}
              />
              <Button onClick={handleDemoAccess} className="w-full" size="lg">
                Access Student Demo
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>🎯 What You Can Do</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• View comprehensive student dashboard</li>
                <li>• Check attendance records and statistics</li>
                <li>• Browse homework assignments</li>
                <li>• Generate and download digital ID card</li>
                <li>• View class timetable and exam schedule</li>
                <li>• Check grades and academic progress</li>
                <li>• Explore achievement system</li>
                <li>• Experience all UI/UX features</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ℹ️ Demo Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• All data is simulated for demonstration</li>
                <li>• No real database connections required</li>
                <li>• Features work offline-ready</li>
                <li>• Data resets on page refresh</li>
                <li>• No personal information stored</li>
                <li>• Safe to explore all features</li>
                <li>• Perfect for testing and evaluation</li>
                <li>• Built with React + TypeScript</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Buttons */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-4">
            Or jump directly to specific features:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/student/dashboard")}
            >
              Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/student/id-card")}
            >
              ID Card
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/student/attendance")}
            >
              Attendance
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/student/homework")}
            >
              Homework
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/student/timetable")}
            >
              Timetable
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/student/exams")}
            >
              Exams
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/student/grades")}
            >
              Grades
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoStudentAccess;
