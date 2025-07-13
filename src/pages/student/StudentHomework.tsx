import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen,
  Calendar,
  Clock,
  Upload,
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface HomeworkItem {
  id: string;
  title: string;
  description: string;
  due_date: string;
  subject_id: string;
  class_id: string;
  assigned_by: string;
  created_at: string;
  updated_at: string;
}

const StudentHomework = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadHomework();
    }
  }, [profile]);

  const loadHomework = async () => {
    try {
      setLoading(true);
      
      // First get student enrollment
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("student_enrollments")
        .select("class_id")
        .eq("student_id", profile?.id)
        .single();

      if (enrollmentError) throw enrollmentError;

      // Then get homework for student's class
      const { data, error } = await supabase
        .from("homework")
        .select("*")
        .eq("class_id", enrollment.class_id)
        .order("due_date", { ascending: true });

      if (error) throw error;

      setHomework(data || []);
    } catch (error) {
      console.error("Error loading homework:", error);
      toast({
        title: "Error",
        description: "Failed to load homework",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const timeDiff = due.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 0) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (daysDiff <= 1) {
      return <Badge variant="secondary">Due Soon</Badge>;
    } else {
      return <Badge variant="outline">Upcoming</Badge>;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Homework</h1>
          <p className="text-muted-foreground">
            Manage your assignments and submissions
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {homework.map((item) => (
          <Card key={item.id} className="hover:shadow-medium transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>{item.title}</span>
                </CardTitle>
                {getStatusBadge(item.due_date)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{item.description}</p>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Due: {new Date(item.due_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Assigned: {new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Submit
                </Button>
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {homework.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No homework assigned yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentHomework;