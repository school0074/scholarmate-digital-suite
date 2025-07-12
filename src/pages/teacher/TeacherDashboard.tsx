import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Calendar,
  MessageCircle,
  BarChart3,
  FileText,
  Clock,
  Award,
  AlertCircle,
  Plus,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Helper function to format time ago
const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60),
  );

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
};

interface TeacherStats {
  totalStudents: number;
  totalClasses: number;
  pendingGrading: number;
  upcomingLessons: number;
  unreadMessages: number;
  completedAssignments: number;
}

interface ClassInfo {
  id: string;
  name: string;
  section: string;
  studentCount: number;
  subjects: string[];
}

interface RecentActivity {
  id: string;
  type: "homework" | "submission" | "message" | "attendance";
  title: string;
  description: string;
  time: string;
  priority?: "high" | "medium" | "low";
}

const TeacherDashboard = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<TeacherStats>({
    totalStudents: 0,
    totalClasses: 0,
    pendingGrading: 0,
    upcomingLessons: 0,
    unreadMessages: 0,
    completedAssignments: 0,
  });
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile) {
      loadTeacherData();
    }
  }, [user, profile]);

  const loadTeacherData = async () => {
    try {
      setLoading(true);

      if (!user) return;

      // Load teacher's classes from database
      const { data: teacherClasses, error: classesError } = await supabase
        .from("classes")
        .select(
          `
          id,
          name,
          section,
          student_enrollments(count),
          class_subjects(subjects(name))
        `,
        )
        .eq("teacher_id", user.id);

      if (classesError) {
        console.error("Error loading classes:", classesError);
      }

      const formattedClasses: ClassInfo[] =
        teacherClasses?.map((cls: any) => ({
          id: cls.id,
          name: cls.name,
          section: cls.section,
          studentCount: cls.student_enrollments?.[0]?.count || 0,
          subjects:
            cls.class_subjects?.map((cs: any) => cs.subjects?.name) || [],
        })) || [];

      setClasses(formattedClasses);

      // Calculate stats from real data
      const totalStudents = formattedClasses.reduce(
        (sum, cls) => sum + cls.studentCount,
        0,
      );

      // Get pending homework submissions for grading
      const { data: pendingSubmissions } = await supabase
        .from("student_submissions")
        .select("id")
        .is("grade", null)
        .in(
          "homework_id",
          await supabase
            .from("homework")
            .select("id")
            .eq("teacher_id", user.id)
            .then((res) => res.data?.map((h) => h.id) || []),
        );

      // Get upcoming lessons/classes
      const { data: upcomingLessons } = await supabase
        .from("timetable")
        .select("id")
        .eq("teacher_id", user.id)
        .gte("date", new Date().toISOString())
        .lt(
          "date",
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        );

      // Get unread messages
      const { data: unreadMessages } = await supabase
        .from("messages")
        .select("id")
        .eq("recipient_id", user.id)
        .eq("read", false);

      // Get completed assignments (graded)
      const { data: completedAssignments } = await supabase
        .from("student_submissions")
        .select("id")
        .not("grade", "is", null)
        .in(
          "homework_id",
          await supabase
            .from("homework")
            .select("id")
            .eq("teacher_id", user.id)
            .then((res) => res.data?.map((h) => h.id) || []),
        );

      setStats({
        totalStudents,
        totalClasses: formattedClasses.length,
        pendingGrading: pendingSubmissions?.length || 0,
        upcomingLessons: upcomingLessons?.length || 0,
        unreadMessages: unreadMessages?.length || 0,
        completedAssignments: completedAssignments?.length || 0,
      });

      // Load recent activity from database
      const { data: recentSubmissions } = await supabase
        .from("student_submissions")
        .select(
          `
          id,
          created_at,
          homework(title),
          profiles(full_name)
        `,
        )
        .in(
          "homework_id",
          await supabase
            .from("homework")
            .select("id")
            .eq("teacher_id", user.id)
            .then((res) => res.data?.map((h) => h.id) || []),
        )
        .order("created_at", { ascending: false })
        .limit(3);

      const { data: recentHomework } = await supabase
        .from("homework")
        .select("id, title, due_date, created_at")
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false })
        .limit(2);

      const activity: RecentActivity[] = [];

      // Add recent submissions
      recentSubmissions?.forEach((submission: any) => {
        activity.push({
          id: submission.id,
          type: "submission",
          title: "New Assignment Submission",
          description: `${submission.homework?.title} submitted by ${submission.profiles?.full_name}`,
          time: getTimeAgo(submission.created_at),
          priority: "medium",
        });
      });

      // Add recent homework
      recentHomework?.forEach((homework: any) => {
        const isOverdue =
          homework.due_date && new Date(homework.due_date) < new Date();
        activity.push({
          id: homework.id,
          type: "homework",
          title: isOverdue ? "Assignment Overdue" : "Assignment Created",
          description: homework.title,
          time: getTimeAgo(homework.created_at),
          priority: isOverdue ? "high" : "low",
        });
      });

      setRecentActivity(activity.slice(0, 5));
    } catch (error) {
      console.error("Error loading teacher data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });

      // Set fallback empty data on error
      setClasses([]);
      setStats({
        totalStudents: 0,
        totalClasses: 0,
        pendingGrading: 0,
        upcomingLessons: 0,
        unreadMessages: 0,
        completedAssignments: 0,
      });
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Create Homework",
      icon: <Plus className="h-5 w-5" />,
      href: "/teacher/homework/create",
      color: "bg-blue-500",
    },
    {
      title: "Mark Attendance",
      icon: <CheckCircle2 className="h-5 w-5" />,
      href: "/teacher/attendance",
      color: "bg-green-500",
    },
    {
      title: "Grade Submissions",
      icon: <Award className="h-5 w-5" />,
      href: "/teacher/grading",
      color: "bg-purple-500",
    },
    {
      title: "View Classes",
      icon: <Users className="h-5 w-5" />,
      href: "/teacher/classes",
      color: "bg-orange-500",
    },
    {
      title: "Messages",
      icon: <MessageCircle className="h-5 w-5" />,
      href: "/teacher/messages",
      color: "bg-cyan-500",
    },
    {
      title: "Timetable",
      icon: <Calendar className="h-5 w-5" />,
      href: "/teacher/timetable",
      color: "bg-indigo-500",
    },
    {
      title: "Analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/teacher/analytics",
      color: "bg-pink-500",
    },
    {
      title: "Study Materials",
      icon: <BookOpen className="h-5 w-5" />,
      href: "/teacher/materials",
      color: "bg-teal-500",
    },
  ];

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-orange-500";
      case "low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "homework":
        return <FileText className="h-4 w-4" />;
      case "submission":
        return <ClipboardList className="h-4 w-4" />;
      case "message":
        return <MessageCircle className="h-4 w-4" />;
      case "attendance":
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome back, {profile?.full_name || "Teacher"}!
          </h1>
          <p className="text-muted-foreground">
            Manage your classes and track student progress
          </p>
        </div>
        <Button asChild>
          <Link to="/teacher/homework/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              across {stats.totalClasses} classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Grading
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingGrading}</div>
            <p className="text-xs text-muted-foreground">
              submissions to review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Lessons
            </CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingLessons}</div>
            <p className="text-xs text-muted-foreground">this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageCircle className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">unread messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.completedAssignments}
            </div>
            <p className="text-xs text-muted-foreground">assignments graded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Class Performance
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">average score</p>
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
        {/* My Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>My Classes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {classes.length > 0 ? (
                classes.map((classInfo) => (
                  <div
                    key={classInfo.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {classInfo.name} {classInfo.section}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {classInfo.studentCount} students •{" "}
                        {classInfo.subjects.join(", ")}
                      </p>
                    </div>
                    <Link to={`/teacher/classes/${classInfo.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No classes assigned yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg"
                >
                  <div
                    className={`p-1 rounded ${getPriorityColor(activity.priority)}`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.time}
                    </p>
                  </div>
                  {activity.priority === "high" && (
                    <Badge variant="destructive" className="text-xs">
                      Urgent
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {stats.pendingGrading > 10 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium text-orange-700 dark:text-orange-300">
                  High Grading Backlog
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  You have {stats.pendingGrading} assignments pending review.
                  Consider grading them soon.
                </p>
              </div>
              <Link to="/teacher/grading">
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                  Review Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeacherDashboard;
