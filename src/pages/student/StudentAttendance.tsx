import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Filter,
  Download,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import {
  format,
  isToday,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";

interface AttendanceRecord {
  id: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  notes?: string;
  marked_by?: string;
}

interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  percentage: number;
}

const StudentAttendance = () => {
  const { toast } = useToast();

  // Mock student profile data
  const mockProfile = {
    id: "student-123",
    full_name: "John Doe",
  };
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    percentage: 0,
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");

  useEffect(() => {
    loadMockAttendanceData();
  }, [selectedDate]);

  const loadMockAttendanceData = async () => {
    try {
      setLoading(true);

      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const startDate = startOfMonth(selectedDate);
      const endDate = endOfMonth(selectedDate);

      // Generate mock attendance data for the selected month
      const mockAttendanceRecords: AttendanceRecord[] = [];
      const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

      daysInMonth.forEach((day, index) => {
        // Skip weekends
        if (day.getDay() === 0 || day.getDay() === 6) return;

        // Skip future dates
        if (day > new Date()) return;

        const dayOfWeek = day.getDay();
        let status: "present" | "absent" | "late" | "excused";

        // Generate realistic attendance patterns
        const rand = Math.random();
        if (rand < 0.85) {
          status = "present";
        } else if (rand < 0.92) {
          status = "late";
        } else if (rand < 0.98) {
          status = "excused";
        } else {
          status = "absent";
        }

        mockAttendanceRecords.push({
          id: `attendance-${index}`,
          date: format(day, "yyyy-MM-dd"),
          status,
          notes:
            status === "excused"
              ? "Medical appointment"
              : status === "late"
                ? "Traffic delay"
                : undefined,
          marked_by: "Mrs. Smith",
        });
      });

      mockAttendanceRecords.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      setAttendanceRecords(mockAttendanceRecords);
      calculateStats(mockAttendanceRecords);
    } catch (error) {
      console.error("Error loading attendance data:", error);
      toast({
        title: "Error",
        description: "Failed to load attendance data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (records: AttendanceRecord[]) => {
    const totalDays = records.length;
    const presentDays = records.filter((r) => r.status === "present").length;
    const absentDays = records.filter((r) => r.status === "absent").length;
    const lateDays = records.filter((r) => r.status === "late").length;
    const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    setStats({
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      percentage: Math.round(percentage * 100) / 100,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "absent":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "late":
        return <Clock className="h-4 w-4 text-orange-500" />;
      case "excused":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      present: "default" as const,
      absent: "destructive" as const,
      late: "secondary" as const,
      excused: "outline" as const,
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getAttendanceForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return attendanceRecords.find((record) => record.date === dateStr);
  };

  const isAttendanceDate = (date: Date) => {
    return !!getAttendanceForDate(date);
  };

  const getDateStatus = (date: Date) => {
    const attendance = getAttendanceForDate(date);
    return attendance?.status;
  };

  const generateReport = () => {
    const reportData = {
      student: mockProfile.full_name,
      month: format(selectedDate, "MMMM yyyy"),
      stats,
      records: attendanceRecords,
    };

    // In a real app, this would generate a PDF or Excel file
    toast({
      title: "Report Generated",
      description: "Attendance report has been prepared for download",
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance Tracker</h1>
          <p className="text-muted-foreground">
            Track your daily attendance and view patterns
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={generateReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Attendance
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.percentage}%</div>
            <Progress value={stats.percentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {stats.presentDays} of {stats.totalDays} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Days</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.presentDays}
            </div>
            <p className="text-xs text-muted-foreground">days attended</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.absentDays}
            </div>
            <p className="text-xs text-muted-foreground">days missed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.lateDays}
            </div>
            <p className="text-xs text-muted-foreground">late arrivals</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Calendar View */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarDays className="h-5 w-5" />
              <span>Calendar View</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              modifiers={{
                present: (date) => getDateStatus(date) === "present",
                absent: (date) => getDateStatus(date) === "absent",
                late: (date) => getDateStatus(date) === "late",
                excused: (date) => getDateStatus(date) === "excused",
              }}
              modifiersStyles={{
                present: { backgroundColor: "#22c55e", color: "white" },
                absent: { backgroundColor: "#ef4444", color: "white" },
                late: { backgroundColor: "#f97316", color: "white" },
                excused: { backgroundColor: "#3b82f6", color: "white" },
              }}
              className="rounded-md border"
            />

            {/* Legend */}
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium">Legend:</p>
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Present</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Absent</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span>Late</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Excused</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Records */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Recent Records</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {attendanceRecords.slice(0, 10).map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(record.status)}
                    <div>
                      <p className="font-medium">
                        {format(new Date(record.date), "MMM dd, yyyy")}
                      </p>
                      {record.notes && (
                        <p className="text-sm text-muted-foreground">
                          {record.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(record.status)}
                </div>
              ))}

              {attendanceRecords.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  No attendance records found for this period
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="font-medium">Best Month</p>
              <p className="text-2xl font-bold text-green-600">95.2%</p>
              <p className="text-sm text-muted-foreground">September 2024</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Current Streak</p>
              <p className="text-2xl font-bold text-blue-600">7 days</p>
              <p className="text-sm text-muted-foreground">
                consecutive attendance
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Improvement</p>
              <p className="text-2xl font-bold text-green-600">+2.3%</p>
              <p className="text-sm text-muted-foreground">from last month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Low Attendance Warning */}
      {stats.percentage < 75 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium text-orange-700 dark:text-orange-300">
                  Low Attendance Warning
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  Your attendance is below 75%. You need to maintain at least
                  75% attendance to be eligible for exams.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentAttendance;
