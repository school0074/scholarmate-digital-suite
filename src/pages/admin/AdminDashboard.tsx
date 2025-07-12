import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  TrendingUp,
  AlertCircle,
  UserPlus,
  Settings,
  BarChart3,
  MessageSquare,
  Calendar,
  Award,
  Bell,
  Shield,
  FileText,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";

interface AdminStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalRevenue: number;
  pendingApprovals: number;
  activeAnnouncements: number;
  recentRegistrations: number;
  systemAlerts: number;
}

interface RecentActivity {
  id: string;
  type: "registration" | "payment" | "alert" | "approval";
  title: string;
  description: string;
  time: string;
  priority?: "high" | "medium" | "low";
}

interface SystemAlert {
  id: string;
  title: string;
  message: string;
  type: "warning" | "error" | "info";
  timestamp: string;
}

// Utility function to format relative time
const formatRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInDays < 7) return `${diffInDays} days ago`;
  return date.toLocaleDateString();
};

const AdminDashboard = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activeAnnouncements: 0,
    recentRegistrations: 0,
    systemAlerts: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadAdminData();
    }
  }, [profile]);

  const loadAdminData = async () => {
    try {
      setLoading(true);

      // Load user counts
      const [studentsResult, teachersResult, classesResult] = await Promise.all(
        [
          supabase
            .from("profiles")
            .select("id", { count: "exact" })
            .eq("role", "student"),
          supabase
            .from("profiles")
            .select("id", { count: "exact" })
            .eq("role", "teacher"),
          supabase.from("classes").select("id", { count: "exact" }),
        ],
      );

      // Load pending approvals (study materials)
      const { data: pendingMaterials } = await supabase
        .from("study_materials")
        .select("id", { count: "exact" })
        .eq("approved", false);

      // Load announcements
      const { data: announcements } = await supabase
        .from("announcements")
        .select("id", { count: "exact" })
        .gte("expires_at", new Date().toISOString());

      // Load fee payments (for revenue calculation)
      const { data: payments } = await supabase
        .from("fees")
        .select("paid_amount")
        .eq("paid", true);

      const totalRevenue =
        payments?.reduce(
          (sum, payment) => sum + (payment.paid_amount || 0),
          0,
        ) || 0;

      // Load recent registrations (last 7 days)
      const { data: recentProfiles } = await supabase
        .from("profiles")
        .select("id, created_at")
        .gte(
          "created_at",
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        );

      setStats({
        totalStudents: studentsResult.count || 0,
        totalTeachers: teachersResult.count || 0,
        totalClasses: classesResult.count || 0,
        totalRevenue: totalRevenue,
        pendingApprovals: pendingMaterials?.length || 0,
        activeAnnouncements: announcements?.length || 0,
        recentRegistrations: recentProfiles?.length || 0,
        systemAlerts: 0, // Will be calculated from actual system logs
      });

      // Load real recent activity from multiple sources
      const recentActivityData = [];

      // Recent registrations
      if (recentProfiles && recentProfiles.length > 0) {
        const latestProfile = await supabase
          .from("profiles")
          .select("full_name, role, created_at")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (latestProfile.data) {
          recentActivityData.push({
            id: "reg-" + latestProfile.data.created_at,
            type: "registration",
            title: `New ${latestProfile.data.role} Registration`,
            description: `${latestProfile.data.full_name || "Someone"} has registered as a ${latestProfile.data.role}`,
            time: formatRelativeTime(latestProfile.data.created_at),
            priority: "medium" as const,
          });
        }
      }

      // Recent payments
      const { data: recentPayments } = await supabase
        .from("fees")
        .select("*, profiles(full_name)")
        .eq("paid", true)
        .order("payment_date", { ascending: false })
        .limit(2);

      if (recentPayments) {
        recentPayments.forEach((payment) => {
          recentActivityData.push({
            id: "payment-" + payment.id,
            type: "payment",
            title: "Fee Payment Received",
            description: `${(payment as any).profiles?.full_name || "A student"} paid ₹${payment.paid_amount}`,
            time: payment.payment_date
              ? formatRelativeTime(payment.payment_date)
              : "Recently",
            priority: "low" as const,
          });
        });
      }

      // Pending approvals
      if (pendingMaterials && pendingMaterials.length > 0) {
        const latestPending = await supabase
          .from("study_materials")
          .select("title, created_at, profiles(full_name)")
          .eq("approved", false)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (latestPending.data) {
          recentActivityData.push({
            id: "approval-" + latestPending.data.created_at,
            type: "approval",
            title: "Study Material Pending Approval",
            description: `${latestPending.data.title} requires approval`,
            time: formatRelativeTime(latestPending.data.created_at),
            priority: "high" as const,
          });
        }
      }

      setRecentActivity(recentActivityData);

      // For now, using empty system alerts - in production, this would come from a logging system
      setSystemAlerts([]);
    } catch (error) {
      console.error("Error loading admin data:", error);
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
      title: "Invite Teacher",
      icon: <UserPlus className="h-5 w-5" />,
      href: "/admin/invite-teacher",
      color: "bg-blue-500",
    },
    {
      title: "Manage Users",
      icon: <Users className="h-5 w-5" />,
      href: "/admin/users",
      color: "bg-green-500",
    },
    {
      title: "School Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/admin/settings",
      color: "bg-purple-500",
    },
    {
      title: "Create Announcement",
      icon: <MessageSquare className="h-5 w-5" />,
      href: "/admin/announcements",
      color: "bg-orange-500",
    },
    {
      title: "View Analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/admin/analytics",
      color: "bg-cyan-500",
    },
    {
      title: "Manage Classes",
      icon: <GraduationCap className="h-5 w-5" />,
      href: "/admin/classes",
      color: "bg-indigo-500",
    },
    {
      title: "Fee Management",
      icon: <DollarSign className="h-5 w-5" />,
      href: "/admin/fees",
      color: "bg-yellow-500",
    },
    {
      title: "System Logs",
      icon: <FileText className="h-5 w-5" />,
      href: "/admin/logs",
      color: "bg-gray-500",
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
      case "registration":
        return <UserPlus className="h-4 w-4" />;
      case "payment":
        return <DollarSign className="h-4 w-4" />;
      case "alert":
        return <AlertCircle className="h-4 w-4" />;
      case "approval":
        return <Shield className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "error":
        return "border-red-200 bg-red-50 dark:bg-red-950/20";
      case "warning":
        return "border-orange-200 bg-orange-50 dark:bg-orange-950/20";
      case "info":
        return "border-blue-200 bg-blue-50 dark:bg-blue-950/20";
      default:
        return "border-gray-200 bg-gray-50 dark:bg-gray-950/20";
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your school's operations and monitor system performance
          </p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link to="/admin/invite-teacher">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Teacher
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/announcements">
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.recentRegistrations} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Teachers
            </CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeachers}</div>
            <p className="text-xs text-muted-foreground">active educators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClasses}</div>
            <p className="text-xs text-muted-foreground">across all grades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">total collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approvals
            </CardTitle>
            <Shield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">require review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Announcements</CardTitle>
            <MessageSquare className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activeAnnouncements}
            </div>
            <p className="text-xs text-muted-foreground">currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground">uptime this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.systemAlerts}</div>
            <p className="text-xs text-muted-foreground">need attention</p>
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
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
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
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                View All Activity
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>System Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {alert.timestamp}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {alert.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                View System Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Tasks */}
      {stats.pendingApprovals > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-orange-500" />
              <div className="flex-1">
                <p className="font-medium text-orange-700 dark:text-orange-300">
                  Pending Approvals
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  You have {stats.pendingApprovals} study materials waiting for
                  approval.
                </p>
              </div>
              <Link to="/admin/approvals">
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                  Review Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today's Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                New Registrations
              </span>
              <span className="font-medium">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Fee Payments
              </span>
              <span className="font-medium">₹15,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Active Users
              </span>
              <span className="font-medium">234</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Average Attendance
              </span>
              <span className="font-medium">92%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Assignment Completion
              </span>
              <span className="font-medium">87%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Parent Satisfaction
              </span>
              <span className="font-medium">4.8/5</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Server Status
              </span>
              <Badge variant="default" className="bg-green-500">
                Online
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Database</span>
              <Badge variant="default" className="bg-green-500">
                Healthy
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Backup Status
              </span>
              <Badge variant="default" className="bg-green-500">
                Current
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
