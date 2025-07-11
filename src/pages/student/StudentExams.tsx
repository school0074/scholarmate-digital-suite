import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Clock,
  BookOpen,
  Timer,
  AlertCircle,
  CheckCircle2,
  Download,
  Bell,
  Target,
  TrendingUp,
  User,
  MapPin,
} from "lucide-react";
import {
  format,
  formatDistance,
  isPast,
  isToday,
  addDays,
  differenceInDays,
} from "date-fns";

interface Exam {
  id: string;
  title: string;
  description: string;
  exam_date: string;
  start_time: string;
  duration_minutes: number;
  total_marks: number;
  subject_name: string;
  teacher_name: string;
  room_number?: string;
}

interface ExamResult {
  id: string;
  exam_id: string;
  marks_obtained: number;
  total_marks: number;
  percentage: number;
  grade: string;
  exam_title: string;
}

const StudentExams = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
  const [pastExams, setPastExams] = useState<Exam[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadExamsData();
    }
  }, [profile]);

  const loadExamsData = async () => {
    try {
      setLoading(true);

      // Get student's class
      const { data: enrollment } = await supabase
        .from("student_enrollments")
        .select("class_id")
        .eq("student_id", profile?.id)
        .single();

      if (!enrollment) return;

      // Get all exams for the class
      const { data: exams, error } = await supabase
        .from("exams")
        .select(
          `
          id,
          title,
          description,
          exam_date,
          start_time,
          duration_minutes,
          total_marks,
          subjects(name),
          profiles(full_name)
        `,
        )
        .eq("class_id", enrollment.class_id)
        .order("exam_date", { ascending: true });

      if (error) throw error;

      const transformedExams =
        exams?.map((exam) => ({
          id: exam.id,
          title: exam.title,
          description: exam.description || "",
          exam_date: exam.exam_date,
          start_time: exam.start_time,
          duration_minutes: exam.duration_minutes,
          total_marks: exam.total_marks,
          subject_name: exam.subjects?.name || "Unknown Subject",
          teacher_name: exam.profiles?.full_name || "TBA",
          room_number: "Room 101", // This would come from a room assignment table
        })) || [];

      const today = new Date();
      const upcoming = transformedExams.filter(
        (exam) => !isPast(new Date(exam.exam_date)),
      );
      const past = transformedExams.filter((exam) =>
        isPast(new Date(exam.exam_date)),
      );

      setUpcomingExams(upcoming);
      setPastExams(past);

      // Load exam results
      await loadExamResults();
    } catch (error) {
      console.error("Error loading exams:", error);
      toast({
        title: "Error",
        description: "Failed to load exams data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExamResults = async () => {
    try {
      const { data: results } = await supabase
        .from("marks")
        .select(
          `
          id,
          marks_obtained,
          total_marks,
          exam_type,
          subject_id,
          subjects(name)
        `,
        )
        .eq("student_id", profile?.id)
        .eq("exam_type", "exam");

      const transformedResults =
        results?.map((result) => {
          const percentage =
            result.total_marks > 0
              ? (result.marks_obtained / result.total_marks) * 100
              : 0;
          const grade = getGrade(percentage);

          return {
            id: result.id,
            exam_id: "",
            marks_obtained: result.marks_obtained || 0,
            total_marks: result.total_marks || 0,
            percentage: Math.round(percentage),
            grade,
            exam_title: result.subjects?.name || "Unknown Subject",
          };
        }) || [];

      setExamResults(transformedResults);
    } catch (error) {
      console.error("Error loading exam results:", error);
    }
  };

  const getGrade = (percentage: number): string => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    if (percentage >= 40) return "D";
    return "F";
  };

  const getCountdown = (examDate: string, examTime: string) => {
    const examDateTime = new Date(`${examDate}T${examTime}`);
    const now = new Date();

    if (isPast(examDateTime)) {
      return "Exam completed";
    }

    const daysUntil = differenceInDays(examDateTime, now);

    if (daysUntil === 0) {
      return "Today!";
    } else if (daysUntil === 1) {
      return "Tomorrow";
    } else {
      return `${daysUntil} days left`;
    }
  };

  const getUrgencyColor = (examDate: string) => {
    const daysUntil = differenceInDays(new Date(examDate), new Date());

    if (daysUntil <= 1) return "bg-red-500";
    if (daysUntil <= 3) return "bg-orange-500";
    if (daysUntil <= 7) return "bg-yellow-500";
    return "bg-green-500";
  };

  const downloadExamSchedule = () => {
    // In a real app, this would generate a PDF
    toast({
      title: "Download Started",
      description: "Exam schedule is being prepared for download",
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
          <h1 className="text-3xl font-bold">Exams & Schedule</h1>
          <p className="text-muted-foreground">
            Track your upcoming exams and view results
          </p>
        </div>
        <Button variant="outline" onClick={downloadExamSchedule}>
          <Download className="h-4 w-4 mr-2" />
          Download Schedule
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Timer className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold">{upcomingExams.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{pastExams.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">
                  {examResults.length > 0
                    ? Math.round(
                        examResults.reduce(
                          (sum, result) => sum + result.percentage,
                          0,
                        ) / examResults.length,
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Best Grade</p>
                <p className="text-2xl font-bold">
                  {examResults.length > 0
                    ? examResults.reduce((best, result) =>
                        result.percentage > best.percentage ? result : best,
                      ).grade
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Exams */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Upcoming Exams</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingExams.length > 0 ? (
            <div className="space-y-4">
              {upcomingExams.map((exam) => (
                <Card key={exam.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            {exam.title}
                          </h3>
                          <Badge
                            className={`text-white ${getUrgencyColor(exam.exam_date)}`}
                          >
                            {getCountdown(exam.exam_date, exam.start_time)}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          {exam.description}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-4 w-4 text-blue-500" />
                            <span>{exam.subject_name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-green-500" />
                            <span>
                              {format(new Date(exam.exam_date), "MMM dd, yyyy")}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-orange-500" />
                            <span>
                              {exam.start_time} ({exam.duration_minutes}m)
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4 text-purple-500" />
                            <span>{exam.total_marks} marks</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{exam.teacher_name}</span>
                          </div>
                          {exam.room_number && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{exam.room_number}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Button variant="outline" size="sm">
                        <Bell className="h-4 w-4 mr-2" />
                        Set Reminder
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Upcoming Exams</h3>
              <p className="text-muted-foreground">
                You're all caught up! No exams scheduled.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Recent Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {examResults.length > 0 ? (
              <div className="space-y-3">
                {examResults.slice(0, 5).map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{result.exam_title}</p>
                      <p className="text-sm text-muted-foreground">
                        {result.marks_obtained}/{result.total_marks} marks
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          result.percentage >= 60 ? "default" : "destructive"
                        }
                      >
                        {result.grade}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {result.percentage}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No results available yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Performance Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Overall Average</span>
                  <span>
                    {examResults.length > 0
                      ? Math.round(
                          examResults.reduce(
                            (sum, result) => sum + result.percentage,
                            0,
                          ) / examResults.length,
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${
                        examResults.length > 0
                          ? Math.round(
                              examResults.reduce(
                                (sum, result) => sum + result.percentage,
                                0,
                              ) / examResults.length,
                            )
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <p className="font-medium text-green-700 dark:text-green-300">
                    Passed
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {examResults.filter((r) => r.percentage >= 40).length}
                  </p>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <p className="font-medium text-red-700 dark:text-red-300">
                    Failed
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {examResults.filter((r) => r.percentage < 40).length}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Study Tips for Upcoming Exams */}
      {upcomingExams.some(
        (exam) => differenceInDays(new Date(exam.exam_date), new Date()) <= 7,
      ) && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-orange-700 dark:text-orange-300 mb-2">
                  Exam Week Ahead!
                </h3>
                <ul className="text-sm text-orange-600 dark:text-orange-400 space-y-1">
                  <li>• Create a study schedule and stick to it</li>
                  <li>• Review past papers and practice questions</li>
                  <li>• Get adequate sleep and stay hydrated</li>
                  <li>• Clarify doubts with your teachers</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentExams;
