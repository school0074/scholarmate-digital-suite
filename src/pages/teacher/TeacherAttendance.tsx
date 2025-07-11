import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Calendar,
  Save,
  BarChart3,
  Download,
  AlertCircle,
  User,
  FileText,
} from "lucide-react";
import { format, isToday, subDays } from "date-fns";

interface Class {
  id: string;
  name: string;
  section: string;
  studentCount: number;
}

interface Student {
  id: string;
  full_name: string;
  roll_number: string;
  avatar_url?: string;
}

interface AttendanceRecord {
  student_id: string;
  status: "present" | "absent" | "late";
  notes?: string;
}

interface AttendanceStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  averageAttendance: number;
}

const TeacherAttendance = () => {
  const { toast } = useToast();

  // Mock teacher profile data
  const mockProfile = {
    id: "teacher-123",
    full_name: "Prof. Sarah Johnson",
  };
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<
    Record<string, AttendanceRecord>
  >({});
  const [stats, setStats] = useState<AttendanceStats>({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    averageAttendance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );

  useEffect(() => {
    loadMockTeacherClasses();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      loadStudentsAndAttendance();
    }
  }, [selectedClass, selectedDate]);

  const loadMockTeacherClasses = async () => {
    try {
      setLoading(true);

      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockClasses: Class[] = [
        {
          id: "1",
          name: "Grade 10",
          section: "A",
          studentCount: 32,
        },
        {
          id: "2",
          name: "Grade 10",
          section: "B",
          studentCount: 28,
        },
        {
          id: "3",
          name: "Grade 9",
          section: "A",
          studentCount: 30,
        },
      ];

      setClasses(mockClasses);

      if (mockClasses.length > 0 && !selectedClass) {
        setSelectedClass(mockClasses[0].id);
      }
    } catch (error) {
      console.error("Error loading classes:", error);
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStudentsAndAttendance = async () => {
    if (!selectedClass) return;

    try {
      setLoading(true);

      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Generate mock student data based on selected class
      const selectedClassInfo = classes.find((c) => c.id === selectedClass);
      const studentCount = selectedClassInfo?.studentCount || 30;

      const mockStudents: Student[] = [];
      for (let i = 1; i <= studentCount; i++) {
        mockStudents.push({
          id: `student-${selectedClass}-${i}`,
          full_name: `Student ${i.toString().padStart(2, "0")}`,
          roll_number: `${selectedClassInfo?.name?.replace(" ", "")}${selectedClassInfo?.section}${i.toString().padStart(3, "0")}`,
          avatar_url: undefined,
        });
      }

      setStudents(mockStudents);

      // Initialize attendance state with some realistic patterns
      const attendanceMap: Record<string, AttendanceRecord> = {};
      const today = new Date().toISOString().split("T")[0];
      const isToday = selectedDate === today;

      mockStudents.forEach((student, index) => {
        let status: "present" | "absent" | "late";

        if (isToday) {
          // For today, start with all present
          status = "present";
        } else {
          // For other dates, use realistic attendance patterns
          const rand = Math.random();
          if (rand < 0.85) {
            status = "present";
          } else if (rand < 0.92) {
            status = "late";
          } else {
            status = "absent";
          }
        }

        attendanceMap[student.id] = {
          student_id: student.id,
          status,
          notes:
            status === "absent"
              ? "Sick leave"
              : status === "late"
                ? "Traffic delay"
                : "",
        };
      });

      setAttendance(attendanceMap);
      calculateStats(attendanceMap, mockStudents.length);
    } catch (error) {
      console.error("Error loading students and attendance:", error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (
    attendanceData: Record<string, AttendanceRecord>,
    totalStudents: number,
  ) => {
    const statusCounts = Object.values(attendanceData).reduce(
      (acc, record) => {
        acc[record.status]++;
        return acc;
      },
      { present: 0, absent: 0, late: 0 },
    );

    const presentAndLate = statusCounts.present + statusCounts.late;
    const averageAttendance =
      totalStudents > 0 ? (presentAndLate / totalStudents) * 100 : 0;

    setStats({
      totalStudents,
      presentToday: statusCounts.present,
      absentToday: statusCounts.absent,
      lateToday: statusCounts.late,
      averageAttendance: Math.round(averageAttendance),
    });
  };

  const updateAttendance = (
    studentId: string,
    status: "present" | "absent" | "late",
    notes?: string,
  ) => {
    const newAttendance = {
      ...attendance,
      [studentId]: {
        student_id: studentId,
        status,
        notes: notes || attendance[studentId]?.notes || "",
      },
    };

    setAttendance(newAttendance);
    calculateStats(newAttendance, students.length);
  };

  const updateNotes = (studentId: string, notes: string) => {
    const newAttendance = {
      ...attendance,
      [studentId]: {
        ...attendance[studentId],
        notes,
      },
    };

    setAttendance(newAttendance);
  };

  const saveAttendance = async () => {
    if (!selectedClass || !selectedDate) {
      toast({
        title: "Error",
        description: "Please select a class and date",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, this would save to the database
      // For now, we'll just show success message
      toast({
        title: "Success",
        description: "Attendance saved successfully",
      });
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast({
        title: "Error",
        description: "Failed to save attendance",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const markAllPresent = () => {
    const newAttendance: Record<string, AttendanceRecord> = {};
    students.forEach((student) => {
      newAttendance[student.id] = {
        student_id: student.id,
        status: "present",
        notes: attendance[student.id]?.notes || "",
      };
    });

    setAttendance(newAttendance);
    calculateStats(newAttendance, students.length);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "absent":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "late":
        return <Clock className="h-5 w-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-500 hover:bg-green-600";
      case "absent":
        return "bg-red-500 hover:bg-red-600";
      case "late":
        return "bg-orange-500 hover:bg-orange-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance Management</h1>
          <p className="text-muted-foreground">
            Mark and track student attendance for your classes
          </p>
        </div>
        <Button onClick={saveAttendance} disabled={saving || !selectedClass}>
          {saving ? "Saving..." : "Save Attendance"}
          <Save className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="class">Select Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} {cls.section} ({cls.studentCount} students)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Quick Actions</Label>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={markAllPresent} size="sm">
                  Mark All Present
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-2xl font-bold">{stats.presentToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold">{stats.absentToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-2xl font-bold">{stats.averageAttendance}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="mark" className="w-full">
        <TabsList>
          <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
          <TabsTrigger value="reports">Attendance Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="mark" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>
                  Student Attendance -{" "}
                  {selectedDate
                    ? format(new Date(selectedDate), "MMMM dd, yyyy")
                    : ""}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {students.length > 0 ? (
                <div className="space-y-4">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-full">
                          {student.avatar_url ? (
                            <img
                              src={student.avatar_url}
                              alt={student.full_name}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <User className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{student.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Roll No: {student.roll_number}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex space-x-2">
                          {(["present", "absent", "late"] as const).map(
                            (status) => (
                              <Button
                                key={status}
                                variant={
                                  attendance[student.id]?.status === status
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  updateAttendance(student.id, status)
                                }
                                className={
                                  attendance[student.id]?.status === status
                                    ? getStatusColor(status)
                                    : ""
                                }
                              >
                                {getStatusIcon(status)}
                                <span className="ml-2 capitalize">
                                  {status}
                                </span>
                              </Button>
                            ),
                          )}
                        </div>

                        <div className="w-48">
                          <Input
                            placeholder="Notes (optional)"
                            value={attendance[student.id]?.notes || ""}
                            onChange={(e) =>
                              updateNotes(student.id, e.target.value)
                            }
                            size="sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Students Found
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedClass
                      ? "No students enrolled in this class."
                      : "Please select a class to mark attendance."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Attendance Reports</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Attendance Analytics
                </h3>
                <p className="text-muted-foreground">
                  Detailed attendance reports and analytics will be available
                  here.
                </p>
                <Button className="mt-4">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Today's reminder */}
      {isToday(new Date(selectedDate)) && stats.absentToday > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium text-orange-700 dark:text-orange-300">
                  Today's Absentees
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  {stats.absentToday} students are marked absent today. Consider
                  following up with parents.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeacherAttendance;
