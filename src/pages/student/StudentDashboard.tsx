import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Calculate attendance percentage (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      const { data: attendanceRecords } = await supabase
        .from("attendance")
        .select("status")
        .eq("student_id", user.id)
        .gte("date", thirtyDaysAgo);

      const presentCount =
        attendanceRecords?.filter((record) => record.status === "present")
          .length || 0;
      const totalRecords = attendanceRecords?.length || 1;
      const attendancePercentage = Math.round(
        (presentCount / totalRecords) * 100,
      );

      // Get pending homework count
      const { data: allHomework } = await supabase
        .from("homework")
        .select("id")
        .gte("due_date", new Date().toISOString());

      const { data: submittedHomework } = await supabase
        .from("student_submissions")
        .select("homework_id")
        .eq("student_id", user.id);

      const submittedIds =
        submittedHomework?.map((sub) => sub.homework_id) || [];
      const pendingHomework =
        allHomework?.filter((hw) => !submittedIds.includes(hw.id)).length || 0;

      // Get upcoming exams
      const { data: upcomingExams } = await supabase
        .from("exams")
        .select("*")
        .gte("exam_date", new Date().toISOString().split("T")[0])
        .order("exam_date", { ascending: true });

      // Get unread messages
      const { data: unreadMessages } = await supabase
        .from("messages")
        .select("id")
        .eq("recipient_id", user.id)
        .eq("read", false);

      // Get total achievement points
      const { data: userAchievements } = await supabase
        .from("achievements")
        .select("points")
        .eq("student_id", user.id);

      const totalPoints =
        userAchievements?.reduce(
          (sum, achievement) => sum + (achievement.points || 0),
          0,
        ) || 0;

      // Get pending fees
      const { data: pendingFees } = await supabase
        .from("fees")
        .select("amount")
        .eq("student_id", user.id)
        .eq("paid", false);

      const totalPendingFees =
        pendingFees?.reduce((sum, fee) => sum + fee.amount, 0) || 0;

      setStats({
        attendancePercentage,
        pendingHomework,
        upcomingExams: upcomingExams?.length || 0,
        unreadMessages: unreadMessages?.length || 0,
        totalPoints,
        currentRank: 1, // This would need a more complex calculation
        pendingFees: totalPendingFees,
      });

      // Set upcoming events from exams and homework
      const events = [];

      if (upcomingExams) {
        upcomingExams.slice(0, 2).forEach((exam) => {
          events.push({
            id: exam.id,
            title: exam.title,
            date: exam.exam_date,
            type: "exam" as const,
            subject: "Subject", // Would need to join with subjects table
          });
        });
      }

      // Get recent homework with due dates
      const { data: recentHomework } = await supabase
        .from("homework")
        .select("*, subjects(name)")
        .gte("due_date", new Date().toISOString())
        .order("due_date", { ascending: true })
        .limit(1);

      if (recentHomework && recentHomework[0]) {
        events.push({
          id: recentHomework[0].id,
          title: recentHomework[0].title,
          date:
            recentHomework[0].due_date?.split("T")[0] ||
            new Date().toISOString().split("T")[0],
          type: "assignment" as const,
          subject: recentHomework[0].subjects?.name || "General",
        });
      }

      setUpcomingEvents(events);

      // Get real achievements
      const { data: realAchievements } = await supabase
        .from("achievements")
        .select("*")
        .eq("student_id", user.id)
        .order("achieved_at", { ascending: false })
        .limit(3);

      setRecentAchievements(realAchievements || []);

      // Get daily quote
      const { data: dailyQuoteData } = await supabase
        .from("daily_quotes")
        .select("quote_text, author")
        .eq("date_featured", new Date().toISOString().split("T")[0])
        .single();

      if (dailyQuoteData) {
        setDailyQuote(
          `"${dailyQuoteData.quote_text}" - ${dailyQuoteData.author || "Unknown"}`,
        );
      } else {
        // Fallback quote
        setDailyQuote(
          '"Education is the most powerful weapon which you can use to change the world." - Nelson Mandela',
        );
      }
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
