import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FileText,
  Upload,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Search,
  Filter,
} from "lucide-react";
import { format, isBefore, isAfter } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HomeworkItem {
  id: string;
  title: string;
  subject: string;
  description: string;
  due_date: string | null;
  status: "pending" | "submitted" | "overdue" | "graded";
  priority: "high" | "medium" | "low";
  max_marks?: number;
  submission_id?: string;
  submitted_date?: string;
  grade?: number;
  teacher_name?: string;
}

const StudentHomework = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [searchTerm, setSearchTerm] = useState("");
  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile) {
      loadStudentHomework();
    }
  }, [user, profile]);

  const loadStudentHomework = async () => {
    try {
      setLoading(true);

      if (!user) return;

      // Get student's enrolled classes
      const { data: enrollments } = await supabase
        .from("student_enrollments")
        .select("class_id")
        .eq("student_id", user.id);

      if (!enrollments || enrollments.length === 0) {
        setHomeworkList([]);
        return;
      }

      const classIds = enrollments.map((e) => e.class_id);

      // Load homework for student's classes
      const { data: homeworkData, error } = await supabase
        .from("homework")
        .select(
          `
          id,
          title,
          description,
          due_date,
          max_marks,
          created_at,
          subjects(name),
          profiles(full_name),
          student_submissions!left(
            id,
            submitted_at,
            grade,
            content
          )
        `,
        )
        .in("class_id", classIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading homework:", error);
        return;
      }

      const formattedHomework: HomeworkItem[] =
        homeworkData?.map((hw: any) => {
          const submission = hw.student_submissions?.find(
            (sub: any) => sub.student_id === user.id,
          );

          let status: "pending" | "submitted" | "overdue" | "graded" =
            "pending";

          if (submission) {
            status = submission.grade !== null ? "graded" : "submitted";
          } else if (
            hw.due_date &&
            isBefore(new Date(hw.due_date), new Date())
          ) {
            status = "overdue";
          }

          // Determine priority based on due date
          let priority: "high" | "medium" | "low" = "medium";
          if (hw.due_date) {
            const dueDate = new Date(hw.due_date);
            const now = new Date();
            const daysUntilDue = Math.ceil(
              (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
            );

            if (daysUntilDue <= 1) {
              priority = "high";
            } else if (daysUntilDue <= 3) {
              priority = "medium";
            } else {
              priority = "low";
            }
          }

          return {
            id: hw.id,
            title: hw.title,
            subject: hw.subjects?.name || "Unknown Subject",
            description: hw.description || "No description provided",
            due_date: hw.due_date,
            status,
            priority,
            max_marks: hw.max_marks,
            submission_id: submission?.id,
            submitted_date: submission?.submitted_at,
            grade: submission?.grade,
            teacher_name: hw.profiles?.full_name || "Unknown Teacher",
          };
        }) || [];

      setHomeworkList(formattedHomework);
    } catch (error) {
      console.error("Error loading homework:", error);
      toast({
        title: "Error",
        description: "Failed to load homework assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 border-red-200 text-red-700";
      case "medium":
        return "bg-orange-50 border-orange-200 text-orange-700";
      case "low":
        return "bg-blue-50 border-blue-200 text-blue-700";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getDaysUntilDue = (dueDateString: string | null) => {
    if (!dueDateString) return null;
    const dueDate = new Date(dueDateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredHomework = homeworkList.filter(
    (hw) =>
      hw.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hw.subject.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pendingCount = homeworkList.filter(
    (hw) => hw.status === "pending",
  ).length;
  const submittedCount = homeworkList.filter(
    (hw) => hw.status === "submitted",
  ).length;
  const overdueCount = homeworkList.filter(
    (hw) => hw.status === "overdue",
  ).length;
  const gradedCount = homeworkList.filter(
    (hw) => hw.status === "graded",
  ).length;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Homework & Assignments
        </h1>
        <p className="text-muted-foreground">
          Manage your assignments and submissions
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{homeworkList.length}</p>
                <p className="text-sm text-muted-foreground">
                  Total Assignments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{submittedCount}</p>
                <p className="text-sm text-muted-foreground">Submitted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4" />
              <span>Due Date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-card border border-border shadow-large z-50">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button variant="outline" className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <span>Filter</span>
        </Button>
      </div>

      {/* Homework List */}
      <div className="space-y-4">
        {filteredHomework.map((homework) => (
          <Card
            key={homework.id}
            className="border-0 shadow-soft hover:shadow-medium transition-all duration-300"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">
                      {homework.title}
                    </h3>
                    <Badge
                      className={`${getPriorityColor(homework.priority)} border`}
                    >
                      {homework.priority}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">
                    {homework.subject}
                  </p>
                  <p className="text-foreground mb-4">{homework.description}</p>

                  {homework.instructions && (
                    <div className="bg-muted/50 p-3 rounded-lg mb-4">
                      <p className="text-sm">
                        <strong>Instructions:</strong> {homework.instructions}
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <Badge
                    className={`${getStatusColor(homework.status)} border mb-2`}
                  >
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(homework.status)}
                      <span className="capitalize">{homework.status}</span>
                    </div>
                  </Badge>

                  <div className="text-sm text-muted-foreground">
                    {homework.due_date && (
                      <p>
                        Due:{" "}
                        {format(new Date(homework.due_date), "MMM dd, yyyy")}
                      </p>
                    )}
                    {homework.max_marks && (
                      <p>Max Marks: {homework.max_marks}</p>
                    )}
                    {homework.teacher_name && (
                      <p>Teacher: {homework.teacher_name}</p>
                    )}
                    {homework.status === "pending" && homework.due_date && (
                      <p
                        className={`font-medium ${getDaysUntilDue(homework.due_date)! < 0 ? "text-red-600" : getDaysUntilDue(homework.due_date)! <= 1 ? "text-yellow-600" : "text-green-600"}`}
                      >
                        {getDaysUntilDue(homework.due_date)! < 0
                          ? `${Math.abs(getDaysUntilDue(homework.due_date)!)} days overdue`
                          : getDaysUntilDue(homework.due_date) === 0
                            ? "Due today"
                            : `${getDaysUntilDue(homework.due_date)} days left`}
                      </p>
                    )}
                    {(homework.status === "submitted" ||
                      homework.status === "graded") &&
                      homework.grade && (
                        <p className="text-green-600 font-medium">
                          Grade: {homework.grade}/{homework.max_marks}
                        </p>
                      )}
                  </div>
                </div>
              </div>

              {homework.status === "pending" && (
                <div className="border-t pt-4">
                  <div className="space-y-4">
                    {homework.submissionType === "text" ? (
                      <Textarea
                        placeholder="Type your submission here..."
                        className="min-h-32"
                      />
                    ) : (
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground mb-2">
                          Drag and drop files here or click to browse
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Supported formats: PDF, DOC, DOCX, JPG, PNG
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline">Save Draft</Button>
                      <Button>Submit Assignment</Button>
                    </div>
                  </div>
                </div>
              )}

              {homework.status === "submitted" && (
                <div className="border-t pt-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <p className="text-green-800 font-medium">
                        Assignment Submitted
                      </p>
                    </div>
                    <p className="text-green-700 text-sm">
                      Submitted on{" "}
                      {format(homework.submittedDate!, "MMM dd, yyyy")}
                    </p>
                    {homework.grade && (
                      <p className="text-green-700 text-sm mt-1">
                        Grade: {homework.grade}/{homework.maxMarks} (
                        {((homework.grade / homework.maxMarks) * 100).toFixed(
                          1,
                        )}
                        %)
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentHomework;
