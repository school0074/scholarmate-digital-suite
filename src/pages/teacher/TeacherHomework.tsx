import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen,
  Plus,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
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
  description: string | null;
  due_date: string | null;
  class_id: string | null;
  subject_id: string | null;
  assigned_by: string | null;
  created_at: string;
  updated_at: string;
}

interface HomeworkSubmission {
  id: string;
  homework_id: string;
  student_id: string;
  submission_text: string | null;
  file_urls: string[] | null;
  submitted_at: string;
  graded: boolean;
  grade: number | null;
  feedback: string | null;
}

const TeacherHomework = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [homework, setHomework] = useState<Homework[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  
  const [newHomework, setNewHomework] = useState({
    title: "",
    description: "",
    dueDate: "",
    classId: "",
    subjectId: "",
  });

  useEffect(() => {
    if (user && profile) {
      loadData();
    }
  }, [user, profile]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (!user) return;

      // Load teacher's classes
      const { data: classData, error: classError } = await supabase
        .from("classes")
        .select("*")
        .order("name");

      if (classError) {
        console.error("Error loading classes:", classError);
      }

      // Load subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select("id, name, code");

      if (subjectsError) {
        console.error("Error loading subjects:", subjectsError);
      }

      const formattedClasses: Class[] =
        classData?.map((cls: any) => ({
          id: cls.id,
          name: cls.name,
          section: cls.section || "",
          studentCount: 0, // Would be calculated from enrollments
        })) || [];

      setClasses(formattedClasses);
      setSubjects(subjectsData || []);

      // Load homework assignments
      const { data: homeworkData, error: homeworkError } = await supabase
        .from("homework")
        .select("*")
        .eq("assigned_by", user.id)
        .order("created_at", { ascending: false });

      if (homeworkError) {
        console.error("Error loading homework:", homeworkError);
      }

      setHomework(homeworkData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load homework data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createHomework = async () => {
    if (!newHomework.title || !newHomework.classId || !user?.id) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);

      const { error } = await supabase.from("homework").insert({
        title: newHomework.title,
        description: newHomework.description || null,
        due_date: newHomework.dueDate || null,
        class_id: newHomework.classId,
        subject_id: newHomework.subjectId || null,
        assigned_by: user.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Homework assignment created successfully",
      });

      // Reset form
      setNewHomework({
        title: "",
        description: "",
        dueDate: "",
        classId: "",
        subjectId: "",
      });

      await loadData();
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

  const loadSubmissions = async (homeworkId: string) => {
    try {
      const { data, error } = await supabase
        .from("student_submissions")
        .select("*")
        .eq("homework_id", homeworkId)
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      setSubmissions(data || []);
    } catch (error) {
      console.error("Error loading submissions:", error);
      toast({
        title: "Error",
        description: "Failed to load submissions",
        variant: "destructive",
      });
    }
  };

  const getHomeworkStats = () => {
    const total = homework.length;
    const dueToday = homework.filter((hw) => {
      if (!hw.due_date) return false;
      const today = new Date().toISOString().split("T")[0];
      return hw.due_date === today;
    }).length;
    
    const overdue = homework.filter((hw) => {
      if (!hw.due_date) return false;
      const today = new Date().toISOString().split("T")[0];
      return hw.due_date < today;
    }).length;

    return { total, dueToday, overdue };
  };

  const stats = getHomeworkStats();

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
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Homework Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Assignment Title</Label>
                <Input
                  id="title"
                  placeholder="Enter assignment title"
                  value={newHomework.title}
                  onChange={(e) =>
                    setNewHomework({ ...newHomework, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter assignment description and instructions"
                  value={newHomework.description}
                  onChange={(e) =>
                    setNewHomework({ ...newHomework, description: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Select
                    value={newHomework.classId}
                    onValueChange={(value) =>
                      setNewHomework({ ...newHomework, classId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
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
                  <Label htmlFor="subject">Subject (Optional)</Label>
                  <Select
                    value={newHomework.subjectId}
                    onValueChange={(value) =>
                      setNewHomework({ ...newHomework, subjectId: value })
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
                <Label htmlFor="dueDate">Due Date (Optional)</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newHomework.dueDate}
                  onChange={(e) =>
                    setNewHomework({ ...newHomework, dueDate: e.target.value })
                  }
                />
              </div>

              <Button
                onClick={createHomework}
                disabled={creating}
                className="w-full"
              >
                {creating ? "Creating..." : "Create Assignment"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Assignments</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Due Today</p>
                <p className="text-2xl font-bold">{stats.dueToday}</p>
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
                <p className="text-2xl font-bold">{stats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Homework List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Assignments ({homework.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {homework.map((hw) => (
              <div
                key={hw.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{hw.title}</h3>
                  {hw.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {hw.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                    <span>
                      Created: {format(new Date(hw.created_at), "MMM dd, yyyy")}
                    </span>
                    {hw.due_date && (
                      <span>
                        Due: {format(new Date(hw.due_date), "MMM dd, yyyy")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {hw.due_date && (
                    <Badge
                      variant={
                        new Date(hw.due_date) < new Date()
                          ? "destructive"
                          : new Date(hw.due_date).toDateString() ===
                              new Date().toDateString()
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {new Date(hw.due_date) < new Date()
                        ? "Overdue"
                        : new Date(hw.due_date).toDateString() ===
                            new Date().toDateString()
                          ? "Due Today"
                          : "Active"}
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedHomework(hw);
                      loadSubmissions(hw.id);
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Submissions
                  </Button>
                </div>
              </div>
            ))}

            {homework.length === 0 && (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No homework assignments yet</p>
                <p className="text-sm text-muted-foreground">
                  Create your first assignment to get started
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherHomework;