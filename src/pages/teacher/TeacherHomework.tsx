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
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  FileText,
  Calendar,
  Users,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
} from "lucide-react";
import { format, isAfter, isBefore } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Class {
  id: string;
  name: string;
  section: string;
  studentCount: number;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Homework {
  id: string;
  title: string;
  description: string;
  due_date: string;
  subject_name: string;
  class_name: string;
  class_section: string;
  submissionCount: number;
  totalStudents: number;
  created_at: string;
}

const TeacherHomework = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    classId: "",
    subjectId: "",
    dueDate: "",
  });

  useEffect(() => {
    if (user && profile) {
      loadTeacherData();
    }
  }, [user, profile]);

  const loadTeacherData = async () => {
    try {
      setLoading(true);

      if (!user) return;

      // Load teacher's classes from database
      const { data: teacherClasses, error: classesError } = await supabase
        .from("classes")
        .select(
          `
          id,
          name,
          section,
          student_enrollments(count)
        `,
        )
        .eq("teacher_id", user.id);

      if (classesError) {
        console.error("Error loading classes:", classesError);
      }

      // Load subjects that the teacher teaches
      const { data: teacherSubjects, error: subjectsError } = await supabase
        .from("subjects")
        .select("id, name, code")
        .in(
          "id",
          await supabase
            .from("class_subjects")
            .select("subject_id")
            .eq("teacher_id", user.id)
            .then((res) => res.data?.map((cs) => cs.subject_id) || []),
        );

      if (subjectsError) {
        console.error("Error loading subjects:", subjectsError);
      }

      const formattedClasses: Class[] =
        teacherClasses?.map((cls: any) => ({
          id: cls.id,
          name: cls.name,
          section: cls.section,
          studentCount: cls.student_enrollments?.[0]?.count || 0,
        })) || [];

      const formattedSubjects: Subject[] =
        teacherSubjects?.map((subj: any) => ({
          id: subj.id,
          name: subj.name,
          code: subj.code,
        })) || [];

      setClasses(formattedClasses);
      setSubjects(formattedSubjects);

      // Load teacher's homework assignments
      loadHomework();
    } catch (error) {
      console.error("Error loading teacher data:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMockHomework = () => {
    const mockHomework: Homework[] = [
      {
        id: "1",
        title: "Quadratic Equations Practice",
        description:
          "Complete exercises 1-15 from Chapter 4. Show all working steps.",
        due_date: "2024-12-20",
        subject_name: "Mathematics",
        class_name: "Grade 10",
        class_section: "A",
        submissionCount: 18,
        totalStudents: 32,
        created_at: "2024-12-10T09:00:00Z",
      },
      {
        id: "2",
        title: "Newton's Laws Lab Report",
        description:
          "Write a detailed lab report on the Newton's laws experiment conducted in class.",
        due_date: "2024-12-22",
        subject_name: "Physics",
        class_name: "Grade 10",
        class_section: "A",
        submissionCount: 12,
        totalStudents: 32,
        created_at: "2024-12-08T14:30:00Z",
      },
      {
        id: "3",
        title: "Algebra Word Problems",
        description: "Solve word problems from worksheet distributed in class.",
        due_date: "2024-12-25",
        subject_name: "Mathematics",
        class_name: "Grade 10",
        class_section: "B",
        submissionCount: 5,
        totalStudents: 28,
        created_at: "2024-12-09T11:15:00Z",
      },
      {
        id: "4",
        title: "Science Project Research",
        description:
          "Research and prepare a presentation on renewable energy sources.",
        due_date: "2024-12-18",
        subject_name: "Science",
        class_name: "Grade 9",
        class_section: "A",
        submissionCount: 25,
        totalStudents: 30,
        created_at: "2024-12-01T10:00:00Z",
      },
      {
        id: "5",
        title: "Motion and Forces Exercise",
        description: "Complete the numerical problems on motion and forces.",
        due_date: "2024-12-15",
        subject_name: "Physics",
        class_name: "Grade 10",
        class_section: "A",
        submissionCount: 32,
        totalStudents: 32,
        created_at: "2024-11-28T13:45:00Z",
      },
    ];

    setHomework(mockHomework);
  };

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.classId || !formData.subjectId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const selectedClass = classes.find((c) => c.id === formData.classId);
      const selectedSubject = subjects.find((s) => s.id === formData.subjectId);

      const newHomework: Homework = {
        id: `hw-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        due_date: formData.dueDate,
        subject_name: selectedSubject?.name || "",
        class_name: selectedClass?.name || "",
        class_section: selectedClass?.section || "",
        submissionCount: 0,
        totalStudents: selectedClass?.studentCount || 0,
        created_at: new Date().toISOString(),
      };

      setHomework((prev) => [newHomework, ...prev]);

      toast({
        title: "Success",
        description: "Homework assignment created successfully",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        classId: "",
        subjectId: "",
        dueDate: "",
      });
    } catch (error) {
      console.error("Error creating homework:", error);
      toast({
        title: "Error",
        description: "Failed to create homework assignment",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const deleteHomework = async (homeworkId: string) => {
    if (!confirm("Are you sure you want to delete this homework assignment?")) {
      return;
    }

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setHomework((prev) => prev.filter((hw) => hw.id !== homeworkId));

      toast({
        title: "Success",
        description: "Homework assignment deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting homework:", error);
      toast({
        title: "Error",
        description: "Failed to delete homework assignment",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (homework: Homework) => {
    if (!homework.due_date) {
      return <Badge variant="outline">No Due Date</Badge>;
    }

    const dueDate = new Date(homework.due_date);
    const now = new Date();

    if (isBefore(dueDate, now)) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (isAfter(dueDate, now)) {
      const daysLeft = Math.ceil(
        (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysLeft <= 1) {
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            Due Soon
          </Badge>
        );
      }
      return <Badge variant="default">Active</Badge>;
    }

    return <Badge variant="outline">Active</Badge>;
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
          <h1 className="text-3xl font-bold">Homework Management</h1>
          <p className="text-muted-foreground">
            Create and manage homework assignments for your classes
          </p>
        </div>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList>
          <TabsTrigger value="create">Create Assignment</TabsTrigger>
          <TabsTrigger value="manage">Manage Assignments</TabsTrigger>
          <TabsTrigger value="submissions">Review Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Create New Assignment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateHomework} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Assignment Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Enter assignment title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="class">Class *</Label>
                    <Select
                      value={formData.classId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, classId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name} {cls.section} ({cls.studentCount}{" "}
                            students)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Select
                      value={formData.subjectId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, subjectId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name} ({subject.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter assignment description, instructions, and requirements..."
                    rows={4}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={creating}
                  className="w-full md:w-auto"
                >
                  {creating ? "Creating..." : "Create Assignment"}
                  <Plus className="h-4 w-4 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>My Assignments</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {homework.length > 0 ? (
                <div className="space-y-4">
                  {homework.map((hw) => (
                    <Card key={hw.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold">
                                {hw.title}
                              </h3>
                              {getStatusBadge(hw)}
                            </div>

                            <p className="text-sm text-muted-foreground mb-3">
                              {hw.description || "No description provided"}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4 text-blue-500" />
                                <span>
                                  {hw.class_name} {hw.class_section}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4 text-green-500" />
                                <span>{hw.subject_name}</span>
                              </div>
                              {hw.due_date && (
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4 text-orange-500" />
                                  <span>
                                    {format(
                                      new Date(hw.due_date),
                                      "MMM dd, yyyy",
                                    )}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center space-x-2">
                                <CheckCircle2 className="h-4 w-4 text-purple-500" />
                                <span>{hw.submissionCount} submissions</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteHomework(hw.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Assignments Created
                  </h3>
                  <p className="text-muted-foreground">
                    You haven't created any homework assignments yet. Create
                    your first assignment to get started.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>Student Submissions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Submission Review</h3>
                <p className="text-muted-foreground">
                  Review and grade student submissions for your assignments.
                </p>
                <Button className="mt-4">
                  <Download className="h-4 w-4 mr-2" />
                  Export Submissions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Assignments
                </p>
                <p className="text-2xl font-bold">{homework.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Due Soon</p>
                <p className="text-2xl font-bold">
                  {
                    homework.filter((hw) => {
                      if (!hw.due_date) return false;
                      const dueDate = new Date(hw.due_date);
                      const now = new Date();
                      const daysLeft = Math.ceil(
                        (dueDate.getTime() - now.getTime()) /
                          (1000 * 60 * 60 * 24),
                      );
                      return daysLeft <= 3 && daysLeft > 0;
                    }).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">
                  {
                    homework.filter((hw) => {
                      if (!hw.due_date) return false;
                      return isBefore(new Date(hw.due_date), new Date());
                    }).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Submissions
                </p>
                <p className="text-2xl font-bold">
                  {homework.reduce((sum, hw) => sum + hw.submissionCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherHomework;
