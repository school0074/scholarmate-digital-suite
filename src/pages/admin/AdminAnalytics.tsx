import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  DollarSign,
  Clock,
  Target,
  Award,
  AlertCircle,
  Download,
  RefreshCw,
  Filter,
  Eye,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface AnalyticsData {
  userStats: {
    totalStudents: number;
    totalTeachers: number;
    totalParents: number;
    activeUsers: number;
    newRegistrations: number;
    userGrowthRate: number;
  };
  academicStats: {
    totalClasses: number;
    averageAttendance: number;
    homeworkCompletion: number;
    examPassRate: number;
    avgGrade: number;
    coursesCompleted: number;
  };
  financialStats: {
    totalRevenue: number;
    pendingFees: number;
    collectionRate: number;
    monthlyGrowth: number;
    averageFeePerStudent: number;
  };
  systemStats: {
    uptime: number;
    activeLogins: number;
    storageUsed: number;
    bandwidthUsed: number;
    errorRate: number;
  };
}

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("last30days");
  const [selectedView, setSelectedView] = useState("overview");
  const { toast } = useToast();

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
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

      // Load fee data
      const { data: payments } = await supabase
        .from("fees")
        .select("paid_amount, amount")
        .eq("paid", true);

      const totalRevenue =
        payments?.reduce(
          (sum, payment) => sum + (payment.paid_amount || 0),
          0,
        ) || 0;
      const totalFees =
        payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

      // Mock data for other analytics (in a real app, you'd calculate these from your database)
      const mockAnalytics: AnalyticsData = {
        userStats: {
          totalStudents: studentsResult.count || 0,
          totalTeachers: teachersResult.count || 0,
          totalParents: Math.floor((studentsResult.count || 0) * 1.8), // Assuming 1.8 parents per student on average
          activeUsers: Math.floor((studentsResult.count || 0) * 0.85),
          newRegistrations: 23,
          userGrowthRate: 12.5,
        },
        academicStats: {
          totalClasses: classesResult.count || 0,
          averageAttendance: 87.5,
          homeworkCompletion: 82.3,
          examPassRate: 91.2,
          avgGrade: 78.9,
          coursesCompleted: 156,
        },
        financialStats: {
          totalRevenue: totalRevenue,
          pendingFees: totalFees - totalRevenue,
          collectionRate: totalFees > 0 ? (totalRevenue / totalFees) * 100 : 0,
          monthlyGrowth: 8.7,
          averageFeePerStudent:
            (studentsResult.count || 0) > 0
              ? totalRevenue / (studentsResult.count || 1)
              : 0,
        },
        systemStats: {
          uptime: 99.8,
          activeLogins: 234,
          storageUsed: 65.4,
          bandwidthUsed: 78.2,
          errorRate: 0.12,
        },
      };

      setAnalyticsData(mockAnalytics);
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    toast({
      title: "Export Started",
      description: "Analytics data export has been initiated",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return <div>No data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your school's performance
          </p>
        </div>
        <div className="flex space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="last90days">Last 90 Days</SelectItem>
              <SelectItem value="lastyear">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadAnalyticsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.userStats.totalStudents +
                analyticsData.userStats.totalTeachers}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />+
              {analyticsData.userStats.userGrowthRate}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Attendance
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.academicStats.averageAttendance}%
            </div>
            <Progress
              value={analyticsData.academicStats.averageAttendance}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Fee Collection
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.financialStats.collectionRate.toFixed(1)}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />+
              {analyticsData.financialStats.monthlyGrowth}% this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.systemStats.uptime}%
            </div>
            <Badge variant="default" className="bg-green-500 mt-2">
              Excellent
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* User Analytics */}
        <TabsContent value="users">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>User Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Students</span>
                    <span className="font-medium">
                      {analyticsData.userStats.totalStudents}
                    </span>
                  </div>
                  <Progress
                    value={
                      (analyticsData.userStats.totalStudents /
                        (analyticsData.userStats.totalStudents +
                          analyticsData.userStats.totalTeachers)) *
                      100
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Teachers</span>
                    <span className="font-medium">
                      {analyticsData.userStats.totalTeachers}
                    </span>
                  </div>
                  <Progress
                    value={
                      (analyticsData.userStats.totalTeachers /
                        (analyticsData.userStats.totalStudents +
                          analyticsData.userStats.totalTeachers)) *
                      100
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Parents</span>
                    <span className="font-medium">
                      {analyticsData.userStats.totalParents}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>User Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {analyticsData.userStats.activeUsers}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Active Users
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {analyticsData.userStats.newRegistrations}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      New This Month
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">User Engagement</span>
                    <span className="font-medium">
                      {(
                        (analyticsData.userStats.activeUsers /
                          (analyticsData.userStats.totalStudents +
                            analyticsData.userStats.totalTeachers)) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      (analyticsData.userStats.activeUsers /
                        (analyticsData.userStats.totalStudents +
                          analyticsData.userStats.totalTeachers)) *
                      100
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Academic Analytics */}
        <TabsContent value="academic">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5" />
                  <span>Attendance Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {analyticsData.academicStats.averageAttendance}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Average attendance rate
                </p>
                <Progress
                  value={analyticsData.academicStats.averageAttendance}
                  className="mt-3"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Academic Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Homework Completion</span>
                    <span>
                      {analyticsData.academicStats.homeworkCompletion}%
                    </span>
                  </div>
                  <Progress
                    value={analyticsData.academicStats.homeworkCompletion}
                    className="mt-1"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Exam Pass Rate</span>
                    <span>{analyticsData.academicStats.examPassRate}%</span>
                  </div>
                  <Progress
                    value={analyticsData.academicStats.examPassRate}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Grade Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {analyticsData.academicStats.avgGrade}%
                </div>
                <p className="text-sm text-muted-foreground">Average grade</p>
                <div className="mt-3">
                  <Badge
                    variant={
                      analyticsData.academicStats.avgGrade >= 80
                        ? "default"
                        : "secondary"
                    }
                  >
                    {analyticsData.academicStats.avgGrade >= 80
                      ? "Excellent"
                      : "Good"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Analytics */}
        <TabsContent value="financial">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Revenue Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-2xl font-bold">
                    ₹
                    {analyticsData.financialStats.totalRevenue.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total Revenue Collected
                  </p>
                </div>
                <div>
                  <div className="text-lg font-semibold text-orange-600">
                    ₹{analyticsData.financialStats.pendingFees.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pending Collections
                  </p>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Collection Rate</span>
                    <span>
                      {analyticsData.financialStats.collectionRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={analyticsData.financialStats.collectionRate}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Financial Growth</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    +{analyticsData.financialStats.monthlyGrowth}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Monthly Growth Rate
                  </p>
                </div>
                <div>
                  <div className="text-lg font-semibold">
                    ₹
                    {analyticsData.financialStats.averageFeePerStudent.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Average Fee per Student
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Analytics */}
        <TabsContent value="system">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>System Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Uptime</span>
                    <span>{analyticsData.systemStats.uptime}%</span>
                  </div>
                  <Progress
                    value={analyticsData.systemStats.uptime}
                    className="mt-1"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Storage Used</span>
                    <span>{analyticsData.systemStats.storageUsed}%</span>
                  </div>
                  <Progress
                    value={analyticsData.systemStats.storageUsed}
                    className="mt-1"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Bandwidth Used</span>
                    <span>{analyticsData.systemStats.bandwidthUsed}%</span>
                  </div>
                  <Progress
                    value={analyticsData.systemStats.bandwidthUsed}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5" />
                  <span>System Health</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-2xl font-bold">
                    {analyticsData.systemStats.activeLogins}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Active Sessions
                  </p>
                </div>
                <div>
                  <div className="text-lg font-semibold text-red-600">
                    {analyticsData.systemStats.errorRate}%
                  </div>
                  <p className="text-sm text-muted-foreground">Error Rate</p>
                </div>
                <div className="pt-2">
                  <Badge
                    variant={
                      analyticsData.systemStats.errorRate < 1
                        ? "default"
                        : "destructive"
                    }
                  >
                    {analyticsData.systemStats.errorRate < 1
                      ? "Healthy"
                      : "Needs Attention"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
