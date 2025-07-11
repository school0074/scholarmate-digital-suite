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

  // Mock student profile data
  const mockProfile = {
    id: "student-123",
    full_name: "John Doe",
  };
  const [currentTerm, setCurrentTerm] = useState<TermReport | null>(null);
  const [previousTerms, setPreviousTerms] = useState<TermReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState("current");

  useEffect(() => {
    loadMockGradesData();
  }, []);

  const loadMockGradesData = async () => {
    try {
      setLoading(true);

      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Generate mock subjects with grades
      const mockSubjects: SubjectGrade[] = [
        {
          id: "1",
          subject_name: "Mathematics",
          subject_code: "MATH101",
          marks: [
            {
              exam_type: "Mid-term",
              marks_obtained: 85,
              total_marks: 100,
              percentage: 85,
              date: "2024-10-15",
            },
            {
              exam_type: "Quiz 1",
              marks_obtained: 18,
              total_marks: 20,
              percentage: 90,
              date: "2024-09-20",
            },
            {
              exam_type: "Assignment",
              marks_obtained: 45,
              total_marks: 50,
              percentage: 90,
              date: "2024-09-30",
            },
          ],
          overall_percentage: 87,
          grade: "A",
          rank: 3,
          teacher_name: "Dr. Smith",
        },
        {
          id: "2",
          subject_name: "Physics",
          subject_code: "PHY101",
          marks: [
            {
              exam_type: "Lab Test",
              marks_obtained: 42,
              total_marks: 50,
              percentage: 84,
              date: "2024-10-10",
            },
            {
              exam_type: "Theory Test",
              marks_obtained: 75,
              total_marks: 100,
              percentage: 75,
              date: "2024-09-25",
            },
            {
              exam_type: "Assignment",
              marks_obtained: 38,
              total_marks: 40,
              percentage: 95,
              date: "2024-10-01",
            },
          ],
          overall_percentage: 81,
          grade: "A",
          rank: 5,
          teacher_name: "Prof. Johnson",
        },
        {
          id: "3",
          subject_name: "Chemistry",
          subject_code: "CHE101",
          marks: [
            {
              exam_type: "Practical",
              marks_obtained: 35,
              total_marks: 50,
              percentage: 70,
              date: "2024-10-12",
            },
            {
              exam_type: "Theory",
              marks_obtained: 65,
              total_marks: 100,
              percentage: 65,
              date: "2024-09-28",
            },
            {
              exam_type: "Quiz",
              marks_obtained: 28,
              total_marks: 30,
              percentage: 93,
              date: "2024-10-05",
            },
          ],
          overall_percentage: 71,
          grade: "B+",
          rank: 8,
          teacher_name: "Dr. Wilson",
        },
        {
          id: "4",
          subject_name: "English Literature",
          subject_code: "ENG101",
          marks: [
            {
              exam_type: "Essay",
              marks_obtained: 72,
              total_marks: 80,
              percentage: 90,
              date: "2024-10-08",
            },
            {
              exam_type: "Comprehension",
              marks_obtained: 85,
              total_marks: 100,
              percentage: 85,
              date: "2024-09-22",
            },
            {
              exam_type: "Presentation",
              marks_obtained: 38,
              total_marks: 40,
              percentage: 95,
              date: "2024-10-03",
            },
          ],
          overall_percentage: 89,
          grade: "A",
          rank: 2,
          teacher_name: "Ms. Brown",
        },
        {
          id: "5",
          subject_name: "History",
          subject_code: "HIS101",
          marks: [
            {
              exam_type: "Test",
              marks_obtained: 58,
              total_marks: 75,
              percentage: 77,
              date: "2024-10-14",
            },
            {
              exam_type: "Project",
              marks_obtained: 42,
              total_marks: 50,
              percentage: 84,
              date: "2024-09-30",
            },
            {
              exam_type: "Quiz",
              marks_obtained: 22,
              total_marks: 25,
              percentage: 88,
              date: "2024-10-07",
            },
          ],
          overall_percentage: 81,
          grade: "A",
          rank: 4,
          teacher_name: "Mr. Davis",
        },
        {
          id: "6",
          subject_name: "Computer Science",
          subject_code: "CS101",
          marks: [
            {
              exam_type: "Programming",
              marks_obtained: 48,
              total_marks: 60,
              percentage: 80,
              date: "2024-10-11",
            },
            {
              exam_type: "Theory",
              marks_obtained: 55,
              total_marks: 80,
              percentage: 69,
              date: "2024-09-26",
            },
            {
              exam_type: "Project",
              marks_obtained: 85,
              total_marks: 100,
              percentage: 85,
              date: "2024-10-04",
            },
          ],
          overall_percentage: 78,
          grade: "B+",
          rank: 6,
          teacher_name: "Mr. Anderson",
        },
      ];

      // Calculate overall term performance
      const overall_percentage =
        mockSubjects.reduce(
          (sum, subject) => sum + subject.overall_percentage,
          0,
        ) / mockSubjects.length;

      const currentTermData: TermReport = {
        term: "Current Term (2024-25)",
        subjects: mockSubjects,
        overall_percentage: Math.round(overall_percentage),
        overall_grade: getGrade(overall_percentage),
        rank: 4,
        attendance_percentage: 92,
        total_students: 32,
      };

      setCurrentTerm(currentTermData);

      // Mock previous terms data
      setPreviousTerms([
        {
          term: "Term 1 (2024-25)",
          subjects: mockSubjects.map((s) => ({
            ...s,
            overall_percentage: Math.max(
              40,
              s.overall_percentage - Math.floor(Math.random() * 10),
            ),
          })),
          overall_percentage: Math.round(overall_percentage) - 5,
          overall_grade: getGrade(overall_percentage - 5),
          rank: 6,
          attendance_percentage: 88,
          total_students: 32,
        },
        {
          term: "Term 2 (2023-24)",
          subjects: mockSubjects.map((s) => ({
            ...s,
            overall_percentage: Math.max(
              35,
              s.overall_percentage - Math.floor(Math.random() * 15),
            ),
          })),
          overall_percentage: Math.round(overall_percentage) - 8,
          overall_grade: getGrade(overall_percentage - 8),
          rank: 8,
          attendance_percentage: 85,
          total_students: 30,
        },
      ]);
    } catch (error) {
      console.error("Error loading grades:", error);
      toast({
        title: "Error",
        description: "Failed to load grades data",
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
