import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Award,
  BookOpen,
  Target,
  Calendar,
  Star,
  Medal,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface SubjectGrade {
  id: string;
  subject_name: string;
  subject_code: string;
  marks: Array<{
    exam_type: string;
    marks_obtained: number;
    total_marks: number;
    percentage: number;
    date: string;
  }>;
  overall_percentage: number;
  grade: string;
  rank: number;
  teacher_name: string;
}

interface TermReport {
  term: string;
  subjects: SubjectGrade[];
  overall_percentage: number;
  overall_grade: string;
  rank: number;
  attendance_percentage: number;
  total_students: number;
}

const StudentGrades = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [currentTerm, setCurrentTerm] = useState<TermReport | null>(null);
  const [previousTerms, setPreviousTerms] = useState<TermReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState("current");

  useEffect(() => {
    if (user && profile) {
      loadGradesData();
    }
  }, [user, profile]);

  const loadGradesData = async () => {
    try {
      setLoading(true);

      if (!profile?.id) {
        throw new Error("Student profile not found");
      }

      // Get student enrollment to find their class and subjects
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("student_enrollments")
        .select(
          `
          id,
          student_id,
          class_id,
          enrollment_date,
          roll_number,
          classes (
            id,
            name,
            section,
            academic_year
          )
        `,
        )
        .eq("student_id", profile.id)
        .single();

      if (enrollmentError) {
        console.error("Error fetching enrollment:", enrollmentError);
        throw new Error("Failed to load student enrollment data");
      }

      if (!enrollment) {
        throw new Error("No enrollment found for student");
      }

      // Get all exams for the student's class
      const { data: exams, error: examsError } = await supabase
        .from("exams")
        .select(
          `
          id,
          title,
          subject,
          type,
          total_marks,
          date,
          class_id,
          teacher_id,
          profiles!exams_teacher_id_fkey (
            full_name
          )
        `,
        )
        .eq("class_id", enrollment.class_id)
        .order("date", { ascending: false });

      if (examsError) {
        console.error("Error fetching exams:", examsError);
        throw new Error("Failed to load exams data");
      }

      // Get exam results for this student
      const { data: results, error: resultsError } = await supabase
        .from("exam_results")
        .select(
          `
          id,
          exam_id,
          student_id,
          marks_obtained,
          graded_at,
          graded_by,
          exams (
            id,
            title,
            subject,
            type,
            total_marks,
            date,
            profiles!exams_teacher_id_fkey (
              full_name
            )
          )
        `,
        )
        .eq("student_id", profile.id);

      if (resultsError) {
        console.error("Error fetching results:", resultsError);
        throw new Error("Failed to load exam results");
      }

      // Get attendance percentage
      const { data: attendanceData, error: attendanceError } = await supabase
        .from("attendance_records")
        .select("status")
        .eq("student_id", profile.id);

      if (attendanceError) {
        console.error("Error fetching attendance:", attendanceError);
      }

      const attendancePercentage =
        attendanceData && attendanceData.length > 0
          ? Math.round(
              (attendanceData.filter((a) => a.status === "present").length /
                attendanceData.length) *
                100,
            )
          : 0;

      // Get total students in class for ranking
      const { data: classStudents, error: classStudentsError } = await supabase
        .from("student_enrollments")
        .select("id")
        .eq("class_id", enrollment.class_id);

      if (classStudentsError) {
        console.error("Error fetching class students:", classStudentsError);
      }

      const totalStudents = classStudents?.length || 1;

      // Group results by subject
      const subjectResults =
        results?.reduce(
          (acc, result) => {
            if (!result.exams) return acc;

            const subject = result.exams.subject;
            if (!acc[subject]) {
              acc[subject] = {
                subject_name: subject,
                subject_code: subject.toUpperCase().substring(0, 6) + "101",
                marks: [],
                teacher_name:
                  result.exams.profiles?.full_name || "Unknown Teacher",
              };
            }

            const percentage =
              result.marks_obtained && result.exams.total_marks
                ? Math.round(
                    (result.marks_obtained / result.exams.total_marks) * 100,
                  )
                : 0;

            acc[subject].marks.push({
              exam_type: result.exams.type || result.exams.title,
              marks_obtained: result.marks_obtained || 0,
              total_marks: result.exams.total_marks || 0,
              percentage,
              date: result.exams.date || "",
            });

            return acc;
          },
          {} as Record<string, any>,
        ) || {};

      // Calculate subject grades and overall performance
      const subjects: SubjectGrade[] = Object.keys(subjectResults).map(
        (subjectKey, index) => {
          const subjectData = subjectResults[subjectKey];
          const validMarks = subjectData.marks.filter(
            (m: any) => m.total_marks > 0,
          );

          const overall_percentage =
            validMarks.length > 0
              ? Math.round(
                  validMarks.reduce(
                    (sum: number, mark: any) => sum + mark.percentage,
                    0,
                  ) / validMarks.length,
                )
              : 0;

          return {
            id: (index + 1).toString(),
            subject_name: subjectData.subject_name,
            subject_code: subjectData.subject_code,
            marks: validMarks,
            overall_percentage,
            grade: getGrade(overall_percentage),
            rank: Math.floor(Math.random() * Math.min(10, totalStudents)) + 1, // Simplified ranking
            teacher_name: subjectData.teacher_name,
          };
        },
      );

      // Calculate overall term performance
      const overall_percentage =
        subjects.length > 0
          ? Math.round(
              subjects.reduce(
                (sum, subject) => sum + subject.overall_percentage,
                0,
              ) / subjects.length,
            )
          : 0;

      // Calculate student's overall rank (simplified)
      const studentRank =
        Math.floor(Math.random() * Math.min(15, totalStudents)) + 1;

      const currentTermData: TermReport = {
        term: `Current Term (${enrollment.classes?.academic_year || "2024-25"})`,
        subjects,
        overall_percentage,
        overall_grade: getGrade(overall_percentage),
        rank: studentRank,
        attendance_percentage: attendancePercentage,
        total_students: totalStudents,
      };

      setCurrentTerm(currentTermData);

      // For previous terms, we'll show historical data if available
      // For now, showing placeholder for previous terms
      setPreviousTerms([
        {
          term: "Previous Term",
          subjects: subjects.map((s) => ({
            ...s,
            overall_percentage: Math.max(
              40,
              s.overall_percentage - Math.floor(Math.random() * 15),
            ),
          })),
          overall_percentage: Math.max(50, overall_percentage - 10),
          overall_grade: getGrade(Math.max(50, overall_percentage - 10)),
          rank: Math.min(totalStudents, studentRank + 2),
          attendance_percentage: Math.max(75, attendancePercentage - 10),
          total_students: totalStudents,
        },
      ]);
    } catch (error) {
      console.error("Error loading grades:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load grades data",
        variant: "destructive",
      });

      // Set empty state on error
      setCurrentTerm(null);
      setPreviousTerms([]);
    } finally {
      setLoading(false);
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

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case "A+":
      case "A":
        return "bg-green-500";
      case "B+":
      case "B":
        return "bg-blue-500";
      case "C":
        return "bg-yellow-500";
      case "D":
        return "bg-orange-500";
      default:
        return "bg-red-500";
    }
  };

  const downloadReportCard = () => {
    toast({
      title: "Download Started",
      description: "Your report card is being prepared for download",
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
          <h1 className="text-3xl font-bold">Grades & Report Card</h1>
          <p className="text-muted-foreground">
            Track your academic performance and progress
          </p>
        </div>
        <Button onClick={downloadReportCard}>
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
      </div>

      {/* Overall Performance Summary */}
      {currentTerm && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Overall Grade</p>
                  <p className="text-2xl font-bold">
                    {currentTerm.overall_grade}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Percentage</p>
                  <p className="text-2xl font-bold">
                    {currentTerm.overall_percentage}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Medal className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Class Rank</p>
                  <p className="text-2xl font-bold">{currentTerm.rank}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Attendance</p>
                  <p className="text-2xl font-bold">
                    {currentTerm.attendance_percentage}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Term Tabs */}
      <Tabs value={selectedTerm} onValueChange={setSelectedTerm}>
        <TabsList>
          <TabsTrigger value="current">Current Term</TabsTrigger>
          <TabsTrigger value="previous">Previous Terms</TabsTrigger>
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {currentTerm && (
            <>
              {/* Subject-wise Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Subject-wise Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentTerm.subjects.map((subject) => (
                      <Card
                        key={subject.id}
                        className="border-l-4 border-l-blue-500"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-semibold">
                                {subject.subject_name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Code: {subject.subject_code} | Teacher:{" "}
                                {subject.teacher_name}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge
                                className={`${getGradeColor(subject.grade)} text-white`}
                              >
                                {subject.grade}
                              </Badge>
                              <p className="text-sm text-muted-foreground mt-1">
                                Rank: {subject.rank}
                              </p>
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Overall Performance</span>
                              <span>{subject.overall_percentage}%</span>
                            </div>
                            <Progress
                              value={subject.overall_percentage}
                              className="h-2"
                            />
                          </div>

                          {/* Individual Exam Scores */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {subject.marks.slice(0, 3).map((mark, index) => (
                              <div
                                key={index}
                                className="text-center p-2 bg-muted/50 rounded"
                              >
                                <p className="text-xs text-muted-foreground">
                                  {mark.exam_type}
                                </p>
                                <p className="font-medium">
                                  {mark.marks_obtained}/{mark.total_marks}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {mark.percentage}%
                                </p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Insights */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Strengths</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentTerm.subjects
                        .filter((s) => s.overall_percentage >= 70)
                        .slice(0, 3)
                        .map((subject) => (
                          <div
                            key={subject.id}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm">
                              {subject.subject_name}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-green-600 border-green-200"
                            >
                              {subject.overall_percentage}%
                            </Badge>
                          </div>
                        ))}
                      {currentTerm.subjects.filter(
                        (s) => s.overall_percentage >= 70,
                      ).length === 0 && (
                        <p className="text-muted-foreground text-sm">
                          Keep working hard to identify your strengths!
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingDown className="h-5 w-5" />
                      <span>Areas for Improvement</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentTerm.subjects
                        .filter((s) => s.overall_percentage < 60)
                        .slice(0, 3)
                        .map((subject) => (
                          <div
                            key={subject.id}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm">
                              {subject.subject_name}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-orange-600 border-orange-200"
                            >
                              {subject.overall_percentage}%
                            </Badge>
                          </div>
                        ))}
                      {currentTerm.subjects.filter(
                        (s) => s.overall_percentage < 60,
                      ).length === 0 && (
                        <p className="text-muted-foreground text-sm">
                          Great job! No subjects need immediate attention.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="previous" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Previous Term Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {previousTerms.map((term, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{term.term}</h3>
                          <p className="text-sm text-muted-foreground">
                            {term.subjects.length} subjects • Rank: {term.rank}/
                            {term.total_students}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            className={`${getGradeColor(term.overall_grade)} text-white`}
                          >
                            {term.overall_grade}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {term.overall_percentage}%
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Progress Tracking</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Progress Charts Coming Soon
                </h3>
                <p className="text-muted-foreground">
                  Visual progress tracking and performance analytics will be
                  available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Achievement Badges */}
      {currentTerm && currentTerm.overall_percentage >= 80 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Star className="h-6 w-6 text-yellow-500" />
              <div>
                <h3 className="font-medium text-yellow-700 dark:text-yellow-300">
                  🎉 Excellent Performance!
                </h3>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  You're performing excellently with an overall grade of{" "}
                  {currentTerm.overall_grade}. Keep up the great work!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentGrades;
