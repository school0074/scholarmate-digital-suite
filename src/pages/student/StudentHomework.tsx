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
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [searchTerm, setSearchTerm] = useState("");

  const homeworkList = [
    {
      id: 1,
      title: "Algebra Practice Problems",
      subject: "Mathematics",
      description:
        "Complete exercises 1-20 from Chapter 5: Quadratic Equations",
      dueDate: new Date(2024, 11, 15),
      status: "pending",
      priority: "high",
      submissionType: "file",
      maxMarks: 50,
      instructions: "Show all working steps clearly",
    },
    {
      id: 2,
      title: "Physics Lab Report",
      subject: "Physics",
      description:
        "Write a detailed report on the pendulum experiment conducted in class",
      dueDate: new Date(2024, 11, 18),
      status: "submitted",
      priority: "medium",
      submissionType: "file",
      maxMarks: 30,
      submittedDate: new Date(2024, 11, 10),
      grade: 28,
    },
    {
      id: 3,
      title: "Shakespeare Essay",
      subject: "English Literature",
      description: "Write a 500-word essay analyzing the themes in Hamlet",
      dueDate: new Date(2024, 11, 20),
      status: "pending",
      priority: "medium",
      submissionType: "text",
      maxMarks: 40,
    },
    {
      id: 4,
      title: "Chemical Equations Worksheet",
      subject: "Chemistry",
      description: "Balance the chemical equations and solve the problems",
      dueDate: new Date(2024, 11, 12),
      status: "overdue",
      priority: "high",
      submissionType: "file",
      maxMarks: 25,
    },
  ];

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

  const getDaysUntilDue = (dueDate: Date) => {
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
                <p className="text-2xl font-bold">8</p>
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
                <p className="text-2xl font-bold">3</p>
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
                <p className="text-2xl font-bold">4</p>
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
                    <p>Due: {format(homework.dueDate, "MMM dd, yyyy")}</p>
                    <p>Max Marks: {homework.maxMarks}</p>
                    {homework.status === "pending" && (
                      <p
                        className={`font-medium ${getDaysUntilDue(homework.dueDate) < 0 ? "text-red-600" : getDaysUntilDue(homework.dueDate) <= 1 ? "text-yellow-600" : "text-green-600"}`}
                      >
                        {getDaysUntilDue(homework.dueDate) < 0
                          ? `${Math.abs(getDaysUntilDue(homework.dueDate))} days overdue`
                          : getDaysUntilDue(homework.dueDate) === 0
                            ? "Due today"
                            : `${getDaysUntilDue(homework.dueDate)} days left`}
                      </p>
                    )}
                    {homework.status === "submitted" && homework.grade && (
                      <p className="text-green-600 font-medium">
                        Grade: {homework.grade}/{homework.maxMarks}
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
