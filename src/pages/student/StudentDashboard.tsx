import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  CalendarDays,
  BookOpen,
  FileText,
  Bell,
  Clock,
  Trophy,
  Users,
  MessageCircle,
  CreditCard,
  BarChart3,
  Camera,
  Bus,
  Heart,
  Quote,
  Star,
  CheckCircle2,
  AlertCircle,
  Timer,
  Target,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardStats {
  attendancePercentage: number;
  pendingHomework: number;
  upcomingExams: number;
  unreadMessages: number;
  totalPoints: number;
  currentRank: number;
  pendingFees: number;
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  subject?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  badge_icon: string;
  achieved_at: string;
}

const StudentDashboard = () => {
  const { toast } = useToast();

  // Mock student profile data
  const mockProfile = {
    id: "student-123",
    full_name: "John Doe",
    email: "john.doe@student.school.com",
    avatar_url: null,
  };
  const [stats, setStats] = useState<DashboardStats>({
    attendancePercentage: 0,
    pendingHomework: 0,
    upcomingExams: 0,
    unreadMessages: 0,
    totalPoints: 0,
    currentRank: 0,
    pendingFees: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>(
    [],
  );
  const [dailyQuote, setDailyQuote] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMockDashboardData();
  }, []);

  const loadMockDashboardData = async () => {
    try {
      setLoading(true);

      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Set mock stats
      setStats({
        attendancePercentage: 92,
        pendingHomework: 3,
        upcomingExams: 2,
        unreadMessages: 5,
        totalPoints: 450,
        currentRank: 1,
        pendingFees: 0,
      });

      // Set mock upcoming events
      setUpcomingEvents([
        {
          id: "1",
          title: "Mathematics Test",
          date: "2024-12-20",
          type: "exam",
          subject: "Mathematics",
        },
        {
          id: "2",
          title: "Physics Assignment Due",
          date: "2024-12-18",
          type: "assignment",
          subject: "Physics",
        },
        {
          id: "3",
          title: "English Literature Quiz",
          date: "2024-12-22",
          type: "exam",
          subject: "English",
        },
      ]);

      // Set mock achievements
      setRecentAchievements([
        {
          id: "1",
          title: "Perfect Attendance",
          description: "Attended all classes this month",
          badge_icon: "🏆",
          achieved_at: "2024-12-10",
        },
        {
          id: "2",
          title: "Top Performer",
          description: "Scored highest in Mathematics test",
          badge_icon: "⭐",
          achieved_at: "2024-12-08",
        },
        {
          id: "3",
          title: "Assignment Master",
          description: "Submitted all assignments on time",
          badge_icon: "📚",
          achieved_at: "2024-12-05",
        },
      ]);

      setDailyQuote(
        '"The future belongs to those who believe in the beauty of their dreams." - Eleanor Roosevelt',
      );
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Digital ID Card",
      icon: <Camera className="h-5 w-5" />,
      href: "/student/id-card",
      color: "bg-blue-500",
    },
    {
      title: "Attendance",
      icon: <CheckCircle2 className="h-5 w-5" />,
      href: "/student/attendance",
      color: "bg-green-500",
    },
    {
      title: "Homework",
      icon: <FileText className="h-5 w-5" />,
      href: "/student/homework",
      color: "bg-orange-500",
    },
    {
      title: "Timetable",
      icon: <CalendarDays className="h-5 w-5" />,
      href: "/student/timetable",
      color: "bg-purple-500",
    },
    {
      title: "Exams",
      icon: <Clock className="h-5 w-5" />,
      href: "/student/exams",
      color: "bg-red-500",
    },
    {
      title: "Grades",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/student/grades",
      color: "bg-indigo-500",
    },
    {
      title: "Messages",
      icon: <MessageCircle className="h-5 w-5" />,
      href: "/student/messages",
      color: "bg-cyan-500",
    },
    {
      title: "Library",
      icon: <BookOpen className="h-5 w-5" />,
      href: "/student/library",
      color: "bg-teal-500",
    },
    {
      title: "Fees",
      icon: <CreditCard className="h-5 w-5" />,
      href: "/student/fees",
      color: "bg-yellow-500",
    },
    {
      title: "Quiz",
      icon: <Target className="h-5 w-5" />,
      href: "/student/quiz",
      color: "bg-pink-500",
    },
    {
      title: "Bus Tracker",
      icon: <Bus className="h-5 w-5" />,
      href: "/student/bus",
      color: "bg-gray-500",
    },
    {
      title: "Ask Doubt",
      icon: <Users className="h-5 w-5" />,
      href: "/student/doubts",
      color: "bg-emerald-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mobile Navigation Info */}
      <MobileNavInfo />

      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {mockProfile.full_name}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your studies today.
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          <Star className="h-4 w-4 mr-1" />
          {stats.totalPoints} Points
        </Badge>
      </div>

      {/* Daily Quote */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-0">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Quote className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
            <div>
              <p className="text-lg font-medium italic text-gray-700 dark:text-gray-300">
                {dailyQuote}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.attendancePercentage}%
            </div>
            <Progress value={stats.attendancePercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Homework
            </CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingHomework}</div>
            <p className="text-xs text-muted-foreground">assignments due</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Exams
            </CardTitle>
            <Timer className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingExams}</div>
            <p className="text-xs text-muted-foreground">exams scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">unread messages</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {quickActions.map((action) => (
              <Link key={action.title} to={action.href}>
                <Button
                  variant="outline"
                  className="h-20 w-full flex flex-col items-center justify-center space-y-2 hover:bg-muted/50"
                >
                  <div className={`p-2 rounded-lg text-white ${action.color}`}>
                    {action.icon}
                  </div>
                  <span className="text-xs font-medium text-center">
                    {action.title}
                  </span>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarDays className="h-5 w-5" />
              <span>Upcoming Events</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                      {event.subject && (
                        <p className="text-xs text-muted-foreground">
                          {event.subject}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={
                        event.type === "exam" ? "destructive" : "default"
                      }
                    >
                      {event.type}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No upcoming events
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Recent Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAchievements.length > 0 ? (
                recentAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="text-2xl">
                      {achievement.badge_icon || "🏆"}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{achievement.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No achievements yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Fees Alert */}
      {stats.pendingFees > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div className="flex-1">
                <p className="font-medium text-orange-700 dark:text-orange-300">
                  Pending Fee Payment
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  You have ₹{stats.pendingFees} in pending fees. Pay now to
                  avoid late charges.
                </p>
              </div>
              <Link to="/student/fees">
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                  Pay Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentDashboard;
