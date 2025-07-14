import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Calendar as CalendarIcon,
  Check,
  X,
  Clock,
  Save,
  UserCheck,
  UserX,
  Timer,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Student {
  id: string;
  full_name: string;
  email: string;
  roll_number?: string;
}

interface Class {
  id: string;
  name: string;
  section: string;
}

interface AttendanceRecord {
  student_id: string;
  status: "present" | "absent" | "late";
  notes: string;
}

const TeacherAttendance = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceRecord>>({});
  const [existingAttendance, setExistingAttendance] = useState<any[]>([]);

  useEffect(() => {
    if (user && profile) {
      loadClasses();
    }
  }, [user, profile]);

  useEffect(() => {
    if (selectedClass) {
      loadStudents();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      loadExistingAttendance();
    }
  }, [selectedClass, selectedDate]);

  const loadClasses = async () => {
    try {
      setLoading(true);

      // Load teacher's classes
      const { data: classData, error: classError } = await supabase
        .from("classes")
        .select("*")
        .order("name");

      if (classError) {
        console.error("Error loading classes:", classError);
        throw classError;
      }

      setClasses(classData || []);
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

  const loadStudents = async () => {
    if (!selectedClass) return;

    try {
      // Get enrolled students for the selected class
      const { data: enrollments, error: enrollmentError } = await supabase
        .from("student_enrollments")
        .select(`
          student_id,
          roll_number,
          profiles!student_enrollments_student_id_fkey(full_name, email)
        `)
        .eq("class_id", selectedClass)
        .eq("status", "active");

      if (enrollmentError) {
        console.error("Error loading students:", enrollmentError);
        throw enrollmentError;
      }

      const studentsData = enrollments?.map((enrollment: any) => ({
        id: enrollment.student_id,
        full_name: enrollment.profiles.full_name || "Unknown Student",
        email: enrollment.profiles.email,
        roll_number: enrollment.roll_number,
      })) || [];

      setStudents(studentsData);

      // Initialize attendance map
      const initialAttendance: Record<string, AttendanceRecord> = {};
      studentsData.forEach((student) => {
        initialAttendance[student.id] = {
          student_id: student.id,
          status: "present",
          notes: "",
        };
      });
      setAttendanceMap(initialAttendance);
    } catch (error) {
      console.error("Error loading students:", error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    }
  };

  const loadExistingAttendance = async () => {
    if (!selectedClass || !selectedDate) return;

    try {
      const dateString = format(selectedDate, "yyyy-MM-dd");

      const { data: attendanceData, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("class_id", selectedClass)
        .eq("date", dateString);

      if (error) {
        console.error("Error loading existing attendance:", error);
        return;
      }

      setExistingAttendance(attendanceData || []);

      // Update attendance map with existing data
      const updatedAttendanceMap = { ...attendanceMap };
      students.forEach((student) => {
        const existingRecord = attendanceData?.find(
          (record) => record.student_id === student.id,
        );

        if (existingRecord) {
          updatedAttendanceMap[student.id] = {
            student_id: student.id,
            status: existingRecord.status as "present" | "absent" | "late",
            notes: existingRecord.notes || "",
          };
        } else {
          updatedAttendanceMap[student.id] = {
            student_id: student.id,
            status: "present",
            notes: "",
          };
        }
      });

      setAttendanceMap(updatedAttendanceMap);
    } catch (error) {
      console.error("Error loading existing attendance:", error);
    }
  };

  const updateAttendance = (studentId: string, field: keyof AttendanceRecord, value: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const saveAttendance = async () => {
    if (!selectedClass || !user?.id) {
      toast({
        title: "Validation Error",
        description: "Please select a class and date",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const dateString = format(selectedDate, "yyyy-MM-dd");

      // Delete existing attendance for this date and class
      await supabase
        .from("attendance")
        .delete()
        .eq("class_id", selectedClass)
        .eq("date", dateString);

      // Insert new attendance records
      const attendanceRecords = Object.values(attendanceMap).map((record) => ({
        student_id: record.student_id,
        class_id: selectedClass,
        date: dateString,
        status: record.status,
        notes: record.notes || null,
        marked_by: user.id,
      }));

      const { error } = await supabase
        .from("attendance")
        .insert(attendanceRecords);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Attendance saved successfully",
      });

      await loadExistingAttendance();
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

  const getAttendanceStats = () => {
    const records = Object.values(attendanceMap);
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const late = records.filter((r) => r.status === "late").length;
    const total = records.length;

    return { present, absent, late, total };
  };

  const stats = getAttendanceStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attendance Management</h1>
        <p className="text-muted-foreground">
          Mark and track student attendance for your classes
        </p>
      </div>

      {/* Class and Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Class & Date Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="class">Select Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} {cls.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4" />
                <span>{format(selectedDate, "PPP")}</span>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => date > new Date()}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {selectedClass && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Present</p>
                  <p className="text-2xl font-bold">{stats.present}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserX className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Absent</p>
                  <p className="text-2xl font-bold">{stats.absent}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Timer className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Late</p>
                  <p className="text-2xl font-bold">{stats.late}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance List */}
      {selectedClass && students.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Student Attendance</CardTitle>
              <Button onClick={saveAttendance} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Attendance"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.map((student) => {
                const attendance = attendanceMap[student.id];
                if (!attendance) return null;

                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {student.full_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{student.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.roll_number && `Roll: ${student.roll_number} • `}
                          {student.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <Select
                        value={attendance.status}
                        onValueChange={(value: "present" | "absent" | "late") =>
                          updateAttendance(student.id, "status", value)
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">
                            <div className="flex items-center space-x-2">
                              <Check className="h-4 w-4 text-green-500" />
                              <span>Present</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="absent">
                            <div className="flex items-center space-x-2">
                              <X className="h-4 w-4 text-red-500" />
                              <span>Absent</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="late">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-orange-500" />
                              <span>Late</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        placeholder="Notes (optional)"
                        value={attendance.notes}
                        onChange={(e) =>
                          updateAttendance(student.id, "notes", e.target.value)
                        }
                        className="w-[200px]"
                      />

                      <Badge
                        variant={
                          attendance.status === "present"
                            ? "default"
                            : attendance.status === "late"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {attendance.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedClass && students.length === 0 && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No students found in this class</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeacherAttendance;