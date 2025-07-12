import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
  const [pastExams, setPastExams] = useState<Exam[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile) {
      loadExamsData();
    }
  }, [user, profile]);

  const loadExamsData = async () => {
    try {
      setLoading(true);

      if (!user) return;

      const today = new Date();

      // Load real exams for student's classes
      const { data: studentEnrollment } = await supabase
        .from("student_enrollments")
        .select("class_id")
        .eq("student_id", user.id);

      if (!studentEnrollment || studentEnrollment.length === 0) {
        setUpcomingExams([]);
        setPastExams([]);
        setExamResults([]);
        return;
      }

      const classIds = studentEnrollment.map((e) => e.class_id);

      // Load exams for student's classes
      const { data: examsData, error: examsError } = await supabase
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
          room_number,
          subjects(name),
          profiles(full_name)
        `,
        )
        .in("class_id", classIds)
        .order("exam_date", { ascending: true });

      if (examsError) {
        console.error("Error loading exams:", examsError);
        throw examsError;
      }

      const formattedExams: Exam[] =
        examsData?.map((exam: any) => ({
          id: exam.id,
          title: exam.title,
          description: exam.description || "No description provided",
          exam_date: exam.exam_date,
          start_time: exam.start_time,
          duration_minutes: exam.duration_minutes,
          total_marks: exam.total_marks,
          subject_name: exam.subjects?.name || "Unknown Subject",
          teacher_name: exam.profiles?.full_name || "Unknown Teacher",
          room_number: exam.room_number,
        })) || [];

      // Separate upcoming and past exams
      const upcoming = formattedExams.filter(
        (exam) => new Date(exam.exam_date) >= today,
      );
      const past = formattedExams.filter(
        (exam) => new Date(exam.exam_date) < today,
      );

      setUpcomingExams(upcoming);
      setPastExams(past);

      // Load exam results/marks
      const { data: marksData, error: marksError } = await supabase
        .from("marks")
        .select(
          `
          id,
          exam_id,
          marks_obtained,
          total_marks,
          grade,
          exams(title)
        `,
        )
        .eq("student_id", user.id);

      if (marksError) {
        console.error("Error loading marks:", marksError);
      } else {
        const formattedResults: ExamResult[] =
          marksData?.map((mark: any) => ({
            id: mark.id,
            exam_id: mark.exam_id,
            marks_obtained: mark.marks_obtained,
            total_marks: mark.total_marks,
            percentage: (mark.marks_obtained / mark.total_marks) * 100,
            grade: mark.grade || "N/A",
            exam_title: mark.exams?.title || "Unknown Exam",
          })) || [];

        setExamResults(formattedResults);
      }
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

  const getGrade = (percentage: number): string => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C+";
    if (percentage >= 40) return "C";
    return "F";
  };

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case "A+":
      case "A":
        return "text-green-600 bg-green-100 border-green-200";
      case "B+":
      case "B":
        return "text-blue-600 bg-blue-100 border-blue-200";
      case "C+":
      case "C":
        return "text-orange-600 bg-orange-100 border-orange-200";
      default:
        return "text-red-600 bg-red-100 border-red-200";
    }
  };

  const getExamStatus = (exam: Exam) => {
    const examDate = new Date(exam.exam_date);
    const today = new Date();
    const daysDiff = differenceInDays(examDate, today);

    if (isPast(examDate)) {
      return {
        status: "Completed",
        color: "bg-gray-500",
        textColor: "text-gray-700",
      };
    } else if (isToday(examDate)) {
      return {
        status: "Today",
        color: "bg-red-500",
        textColor: "text-red-700",
      };
    } else if (daysDiff <= 3) {
      return {
        status: "Soon",
        color: "bg-orange-500",
        textColor: "text-orange-700",
      };
    } else {
      return {
        status: "Upcoming",
        color: "bg-blue-500",
        textColor: "text-blue-700",
      };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const averageGrade =
    examResults.length > 0
      ? examResults.reduce((sum, result) => sum + result.percentage, 0) /
        examResults.length
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Exams & Results</h1>
          <p className="text-muted-foreground">
            Track your upcoming exams and view your results
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Results
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Exams
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingExams.length}</div>
            <p className="text-xs text-muted-foreground">scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Exams
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastExams.length}</div>
            <p className="text-xs text-muted-foreground">this term</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageGrade.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">overall performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grade</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getGrade(averageGrade)}</div>
            <p className="text-xs text-muted-foreground">current grade</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Exams */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Upcoming Exams</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingExams.length > 0 ? (
                upcomingExams.map((exam) => {
                  const status = getExamStatus(exam);
                  return (
                    <div
                      key={exam.id}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{exam.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {exam.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <BookOpen className="h-3 w-3" />
                            <span>{exam.subject_name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {format(new Date(exam.exam_date), "MMM dd")}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{exam.start_time}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Timer className="h-3 w-3" />
                            <span>{exam.duration_minutes}min</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
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
                      <div className="ml-4">
                        <Badge className={`${status.color} text-white`}>
                          {status.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistance(
                            new Date(exam.exam_date),
                            new Date(),
                            {
                              addSuffix: true,
                            },
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Upcoming Exams
                  </h3>
                  <p className="text-muted-foreground">
                    You don't have any exams scheduled at the moment.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>Recent Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {examResults.length > 0 ? (
                examResults.slice(0, 5).map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{result.exam_title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {result.marks_obtained}/{result.total_marks} marks
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getGradeColor(result.grade)}>
                        {result.grade}
                      </Badge>
                      <p className="text-sm font-medium mt-1">
                        {result.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Results Yet</h3>
                  <p className="text-muted-foreground">
                    Your exam results will appear here once published.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Exam Alert */}
      {upcomingExams.some((exam) => isToday(new Date(exam.exam_date))) && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium text-red-700 dark:text-red-300">
                  Exam Today!
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  You have{" "}
                  {
                    upcomingExams.filter((exam) =>
                      isToday(new Date(exam.exam_date)),
                    ).length
                  }{" "}
                  exam(s) scheduled for today. Good luck!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentExams;
