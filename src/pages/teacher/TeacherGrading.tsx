import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Award,
  FileText,
  User,
  Calendar,
  Download,
  Eye,
  Edit,
  Save,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Search,
  Filter,
  MessageSquare,
  Star,
  TrendingUp,
} from "lucide-react";
import { format, formatDistance } from "date-fns";

interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  homeworkTitle: string;
  subject: string;
  className: string;
  submittedDate: string;
  dueDate: string;
  content: string;
  fileUrl?: string;
  fileName?: string;
  isLate: boolean;
  marksObtained?: number;
  totalMarks: number;
  grade?: string;
  feedback?: string;
  isGraded: boolean;
  gradedDate?: string;
}

const TeacherGrading = () => {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);

  // Grading form state
  const [gradingData, setGradingData] = useState({
    marks: "",
    feedback: "",
  });

  // Mock teacher profile data
  const mockProfile = {
    id: "teacher-123",
    full_name: "Prof. Sarah Johnson",
  };

  useEffect(() => {
    loadMockSubmissions();
  }, []);

  const loadMockSubmissions = async () => {
    try {
      setLoading(true);

      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock submissions data
      const mockSubmissions: Submission[] = [
        {
          id: "1",
          studentId: "student-1",
          studentName: "Emma Wilson",
          rollNumber: "GR10A001",
          homeworkTitle: "Quadratic Equations Practice",
          subject: "Mathematics",
          className: "Grade 10 A",
          submittedDate: "2024-12-10T14:30:00Z",
          dueDate: "2024-12-11T23:59:00Z",
          content:
            "Solved all 15 problems with detailed steps. Used factoring method for most equations and quadratic formula for complex ones.",
          fileUrl: "/submissions/emma-quadratic.pdf",
          fileName: "quadratic-solutions.pdf",
          isLate: false,
          totalMarks: 50,
          isGraded: false,
        },
        {
          id: "2",
          studentId: "student-2",
          studentName: "David Smith",
          rollNumber: "GR10A002",
          homeworkTitle: "Newton's Laws Lab Report",
          subject: "Physics",
          className: "Grade 10 A",
          submittedDate: "2024-12-09T16:45:00Z",
          dueDate: "2024-12-09T23:59:00Z",
          content:
            "Completed the lab report with all three experiments. Included graphs and analysis of results.",
          fileUrl: "/submissions/david-newton.docx",
          fileName: "newton-laws-report.docx",
          isLate: false,
          marksObtained: 42,
          totalMarks: 50,
          grade: "A-",
          feedback:
            "Excellent work! Your analysis was thorough and conclusions were well-supported. Minor improvement needed in graph labeling.",
          isGraded: true,
          gradedDate: "2024-12-09T20:30:00Z",
        },
        {
          id: "3",
          studentId: "student-3",
          studentName: "Sarah Johnson",
          rollNumber: "GR10B003",
          homeworkTitle: "Algebra Word Problems",
          subject: "Mathematics",
          className: "Grade 10 B",
          submittedDate: "2024-12-12T08:15:00Z",
          dueDate: "2024-12-11T23:59:00Z",
          content:
            "Attempted all problems. Some solutions are incomplete due to difficulty with word problem interpretation.",
          isLate: true,
          totalMarks: 40,
          isGraded: false,
        },
        {
          id: "4",
          studentId: "student-4",
          studentName: "Michael Brown",
          rollNumber: "GR9A004",
          homeworkTitle: "Science Project Research",
          subject: "Science",
          className: "Grade 9 A",
          submittedDate: "2024-12-08T10:20:00Z",
          dueDate: "2024-12-08T23:59:00Z",
          content:
            "Researched renewable energy sources with focus on solar and wind power. Included statistics and environmental impact analysis.",
          fileUrl: "/submissions/michael-science.pptx",
          fileName: "renewable-energy-research.pptx",
          isLate: false,
          marksObtained: 38,
          totalMarks: 40,
          grade: "A",
          feedback:
            "Outstanding research! Very comprehensive coverage of the topic with excellent use of current data. Well done!",
          isGraded: true,
          gradedDate: "2024-12-08T15:45:00Z",
        },
        {
          id: "5",
          studentId: "student-5",
          studentName: "Lisa Chen",
          rollNumber: "GR10A005",
          homeworkTitle: "Motion and Forces Exercise",
          subject: "Physics",
          className: "Grade 10 A",
          submittedDate: "2024-12-11T19:30:00Z",
          dueDate: "2024-12-12T23:59:00Z",
          content:
            "Solved numerical problems on motion and forces. Showed calculations for velocity, acceleration, and force problems.",
          isLate: false,
          totalMarks: 30,
          isGraded: false,
        },
        {
          id: "6",
          studentId: "student-6",
          studentName: "James Wilson",
          rollNumber: "GR10B006",
          homeworkTitle: "Quadratic Equations Practice",
          subject: "Mathematics",
          className: "Grade 10 B",
          submittedDate: "2024-12-10T22:45:00Z",
          dueDate: "2024-12-11T23:59:00Z",
          content:
            "Completed most problems but struggled with complex quadratic equations. Need more practice with quadratic formula.",
          isLate: false,
          marksObtained: 28,
          totalMarks: 50,
          grade: "C+",
          feedback:
            "Good effort! You understand the basic concepts. Focus on practicing the quadratic formula for complex equations.",
          isGraded: true,
          gradedDate: "2024-12-11T10:15:00Z",
        },
      ];

      setSubmissions(mockSubmissions);
    } catch (error) {
      console.error("Error loading submissions:", error);
      toast({
        title: "Error",
        description: "Failed to load submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async (submissionId: string) => {
    if (!gradingData.marks || !gradingData.feedback) {
      toast({
        title: "Validation Error",
        description: "Please provide both marks and feedback",
        variant: "destructive",
      });
      return;
    }

    const marks = parseFloat(gradingData.marks);
    const submission = submissions.find((s) => s.id === submissionId);

    if (!submission || marks < 0 || marks > submission.totalMarks) {
      toast({
        title: "Invalid Marks",
        description: `Marks should be between 0 and ${submission?.totalMarks}`,
        variant: "destructive",
      });
      return;
    }

    try {
      setGrading(true);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const percentage = (marks / submission.totalMarks) * 100;
      let grade = "F";
      if (percentage >= 90) grade = "A+";
      else if (percentage >= 80) grade = "A";
      else if (percentage >= 70) grade = "B+";
      else if (percentage >= 60) grade = "B";
      else if (percentage >= 50) grade = "C+";
      else if (percentage >= 40) grade = "C";
      else if (percentage >= 35) grade = "D";

      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === submissionId
            ? {
                ...sub,
                marksObtained: marks,
                grade,
                feedback: gradingData.feedback,
                isGraded: true,
                gradedDate: new Date().toISOString(),
              }
            : sub,
        ),
      );

      setSelectedSubmission(null);
      setGradingData({ marks: "", feedback: "" });

      toast({
        title: "Success",
        description: "Submission graded successfully",
      });
    } catch (error) {
      console.error("Error grading submission:", error);
      toast({
        title: "Error",
        description: "Failed to grade submission",
        variant: "destructive",
      });
    } finally {
      setGrading(false);
    }
  };

  const getGradeColor = (grade?: string) => {
    if (!grade) return "bg-gray-100 text-gray-800";

    const gradeValue = grade.replace("+", "").replace("-", "");
    switch (gradeValue) {
      case "A":
        return "bg-green-100 text-green-800 border-green-200";
      case "B":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "C":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "D":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "F":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const subjects = [...new Set(submissions.map((s) => s.subject))];
  const pendingCount = submissions.filter((s) => !s.isGraded).length;
  const gradedCount = submissions.filter((s) => s.isGraded).length;
  const lateCount = submissions.filter((s) => s.isLate && !s.isGraded).length;

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.homeworkTitle
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      submission.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (filterStatus === "pending") matchesStatus = !submission.isGraded;
    else if (filterStatus === "graded") matchesStatus = submission.isGraded;
    else if (filterStatus === "late") matchesStatus = submission.isLate;

    const matchesSubject =
      filterSubject === "all" || submission.subject === filterSubject;

    return matchesSearch && matchesStatus && matchesSubject;
  });

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Grade Assignments</h1>
          <p className="text-muted-foreground">
            Review and grade student submissions
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Graded</p>
                <p className="text-2xl font-bold">{gradedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Late Submissions
                </p>
                <p className="text-2xl font-bold">{lateCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Average Grade</p>
                <p className="text-2xl font-bold">
                  {gradedCount > 0
                    ? Math.round(
                        submissions
                          .filter(
                            (s) => s.isGraded && s.marksObtained !== undefined,
                          )
                          .reduce(
                            (sum, s) =>
                              sum + (s.marksObtained! / s.totalMarks) * 100,
                            0,
                          ) / gradedCount,
                      ) + "%"
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="review" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="review">Review Submissions</TabsTrigger>
          <TabsTrigger value="analytics">Grading Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by student name, assignment, or roll number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Submissions</SelectItem>
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="graded">Graded</SelectItem>
                    <SelectItem value="late">Late Submissions</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterSubject} onValueChange={setFilterSubject}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Submissions List */}
          <div className="space-y-4">
            {filteredSubmissions.length > 0 ? (
              filteredSubmissions.map((submission) => (
                <Card
                  key={submission.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <User className="h-5 w-5" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold">
                              {submission.studentName}
                            </h3>
                            <Badge variant="outline">
                              {submission.rollNumber}
                            </Badge>
                            {submission.isLate && (
                              <Badge variant="destructive" className="text-xs">
                                LATE
                              </Badge>
                            )}
                            {submission.isGraded && submission.grade && (
                              <Badge
                                className={getGradeColor(submission.grade)}
                              >
                                {submission.grade}
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mb-1">
                            <strong>{submission.homeworkTitle}</strong> •{" "}
                            {submission.subject} • {submission.className}
                          </p>

                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {submission.content}
                          </p>

                          {submission.isGraded && submission.feedback && (
                            <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg mb-3">
                              <p className="text-sm text-green-800 dark:text-green-300">
                                <strong>Feedback:</strong> {submission.feedback}
                              </p>
                            </div>
                          )}

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3 text-blue-500" />
                              <span>
                                Submitted{" "}
                                {formatDistance(
                                  new Date(submission.submittedDate),
                                  new Date(),
                                  { addSuffix: true },
                                )}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3 text-orange-500" />
                              <span>
                                Due{" "}
                                {format(new Date(submission.dueDate), "MMM dd")}
                              </span>
                            </div>
                            {submission.isGraded &&
                              submission.marksObtained !== undefined && (
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  <span>
                                    {submission.marksObtained}/
                                    {submission.totalMarks} marks
                                  </span>
                                </div>
                              )}
                            {!submission.isGraded && (
                              <div className="flex items-center space-x-1">
                                <Award className="h-3 w-3 text-purple-500" />
                                <span>Max: {submission.totalMarks} marks</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {submission.fileUrl && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        )}

                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>

                        {!submission.isGraded ? (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setGradingData({ marks: "", feedback: "" });
                            }}
                          >
                            <Award className="h-4 w-4 mr-2" />
                            Grade
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Grade
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Submissions Found
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm ||
                    filterStatus !== "all" ||
                    filterSubject !== "all"
                      ? "No submissions match your current filters. Try adjusting your search criteria."
                      : "No student submissions are available for grading at the moment."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Grade Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Grade Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["A+", "A", "B+", "B", "C+", "C", "D", "F"].map((grade) => {
                    const count = submissions.filter(
                      (s) => s.grade === grade,
                    ).length;
                    const percentage =
                      gradedCount > 0 ? (count / gradedCount) * 100 : 0;

                    return (
                      <div key={grade} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Grade {grade}</span>
                          <span>
                            {count} students ({Math.round(percentage)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Subject Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Subject Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjects.map((subject) => {
                    const subjectSubmissions = submissions.filter(
                      (s) => s.subject === subject && s.isGraded,
                    );
                    const averageScore =
                      subjectSubmissions.length > 0
                        ? subjectSubmissions.reduce(
                            (sum, s) =>
                              sum + (s.marksObtained! / s.totalMarks) * 100,
                            0,
                          ) / subjectSubmissions.length
                        : 0;

                    return (
                      <div key={subject} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{subject}</span>
                          <span>{Math.round(averageScore)}% avg</span>
                        </div>
                        <Progress value={averageScore} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Grading Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Grade Submission</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold">
                  {selectedSubmission.studentName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedSubmission.rollNumber}
                </p>
                <p className="text-sm">
                  <strong>{selectedSubmission.homeworkTitle}</strong>
                </p>
                <p className="text-sm">
                  {selectedSubmission.subject} • {selectedSubmission.className}
                </p>
              </div>

              <div>
                <Label>Student Submission:</Label>
                <div className="mt-2 p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm">{selectedSubmission.content}</p>
                  {selectedSubmission.fileName && (
                    <div className="mt-2 flex items-center space-x-2 text-sm text-blue-600">
                      <FileText className="h-4 w-4" />
                      <span>{selectedSubmission.fileName}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marks">Marks Obtained *</Label>
                  <Input
                    id="marks"
                    type="number"
                    value={gradingData.marks}
                    onChange={(e) =>
                      setGradingData({ ...gradingData, marks: e.target.value })
                    }
                    placeholder={`0 - ${selectedSubmission.totalMarks}`}
                    min="0"
                    max={selectedSubmission.totalMarks}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Total Marks: {selectedSubmission.totalMarks}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Grade Preview</Label>
                  <div className="p-2 border rounded-md text-center">
                    {gradingData.marks ? (
                      (() => {
                        const percentage =
                          (parseFloat(gradingData.marks) /
                            selectedSubmission.totalMarks) *
                          100;
                        let grade = "F";
                        if (percentage >= 90) grade = "A+";
                        else if (percentage >= 80) grade = "A";
                        else if (percentage >= 70) grade = "B+";
                        else if (percentage >= 60) grade = "B";
                        else if (percentage >= 50) grade = "C+";
                        else if (percentage >= 40) grade = "C";
                        else if (percentage >= 35) grade = "D";

                        return (
                          <Badge className={getGradeColor(grade)}>
                            {grade} ({Math.round(percentage)}%)
                          </Badge>
                        );
                      })()
                    ) : (
                      <span className="text-muted-foreground">Enter marks</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback *</Label>
                <Textarea
                  id="feedback"
                  value={gradingData.feedback}
                  onChange={(e) =>
                    setGradingData({ ...gradingData, feedback: e.target.value })
                  }
                  placeholder="Provide constructive feedback for the student..."
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedSubmission(null)}
                  disabled={grading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleGradeSubmission(selectedSubmission.id)}
                  disabled={grading}
                >
                  {grading ? "Saving..." : "Save Grade"}
                  <Save className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TeacherGrading;
