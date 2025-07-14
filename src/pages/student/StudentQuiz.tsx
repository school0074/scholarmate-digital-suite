import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Target,
  Clock,
  CheckCircle,
  Play,
  Award,
  TrendingUp,
  Calendar,
  BookOpen,
} from "lucide-react";
import { format } from "date-fns";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  subject_id: string | null;
  class_id: string | null;
  created_by: string;
  total_questions: number;
  time_limit_minutes: number | null;
  active: boolean;
  created_at: string;
}

interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  score: number;
  total_points: number;
  completed_at: string;
  time_taken_seconds: number | null;
}

const StudentQuiz = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadQuizData();
    }
  }, [profile]);

  const loadQuizData = async () => {
    try {
      setLoading(true);

      // Get student's class
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("student_enrollments")
        .select("class_id")
        .eq("student_id", profile?.id)
        .single();

      if (enrollmentError) {
        console.error("Error loading enrollment:", enrollmentError);
        setLoading(false);
        return;
      }

      // Load available quizzes for the student's class
      const { data: quizzesData, error: quizzesError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("class_id", enrollment.class_id)
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (quizzesError) {
        console.error("Error loading quizzes:", quizzesError);
      }

      setAvailableQuizzes(quizzesData || []);

      // Load quiz attempts by this student
      const { data: attemptsData, error: attemptsError } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("student_id", profile?.id)
        .order("completed_at", { ascending: false });

      if (attemptsError) {
        console.error("Error loading attempts:", attemptsError);
      }

      setQuizAttempts(attemptsData || []);
    } catch (error) {
      console.error("Error loading quiz data:", error);
      toast({
        title: "Error",
        description: "Failed to load quiz data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalQuizzes = availableQuizzes.length;
    const completedQuizzes = quizAttempts.length;
    const avgScore = quizAttempts.length > 0 
      ? Math.round(quizAttempts.reduce((acc, attempt) => acc + (attempt.score / attempt.total_points * 100), 0) / quizAttempts.length)
      : 0;

    return {
      totalQuizzes,
      completedQuizzes,
      avgScore,
      pendingQuizzes: totalQuizzes - completedQuizzes,
    };
  };

  const stats = calculateStats();

  const hasAttempted = (quizId: string) => {
    return quizAttempts.some(attempt => attempt.quiz_id === quizId);
  };

  const getAttemptForQuiz = (quizId: string) => {
    return quizAttempts.find(attempt => attempt.quiz_id === quizId);
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
      <div>
        <h1 className="text-3xl font-bold">Quizzes</h1>
        <p className="text-muted-foreground">
          Test your knowledge with interactive quizzes
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Quizzes</p>
                <p className="text-2xl font-bold">{stats.totalQuizzes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completedQuizzes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">{stats.avgScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pendingQuizzes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Quizzes */}
      <Card>
        <CardHeader>
          <CardTitle>Available Quizzes ({availableQuizzes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableQuizzes.map((quiz) => {
              const attempt = getAttemptForQuiz(quiz.id);
              const completed = hasAttempted(quiz.id);

              return (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <h3 className="font-semibold">{quiz.title}</h3>
                        {quiz.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {quiz.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <BookOpen className="h-3 w-3" />
                            <span>{quiz.total_questions} questions</span>
                          </span>
                          {quiz.time_limit_minutes && (
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{quiz.time_limit_minutes} minutes</span>
                            </span>
                          )}
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {format(new Date(quiz.created_at), "MMM dd, yyyy")}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {completed && attempt && (
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Badge variant="default">
                            {Math.round((attempt.score / attempt.total_points) * 100)}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Completed {format(new Date(attempt.completed_at), "MMM dd")}
                        </p>
                      </div>
                    )}

                    <Button
                      variant={completed ? "outline" : "default"}
                      size="sm"
                      disabled={!quiz.active}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {completed ? "Retake Quiz" : "Start Quiz"}
                    </Button>
                  </div>
                </div>
              );
            })}

            {availableQuizzes.length === 0 && (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No quizzes available</p>
                <p className="text-sm text-muted-foreground">
                  Check back later for new quizzes from your teachers
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Attempts */}
      {quizAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quizAttempts.slice(0, 5).map((attempt) => {
                const quiz = availableQuizzes.find(q => q.id === attempt.quiz_id);
                const scorePercentage = Math.round((attempt.score / attempt.total_points) * 100);

                return (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{quiz?.title || "Quiz"}</p>
                      <p className="text-sm text-muted-foreground">
                        Completed {format(new Date(attempt.completed_at), "PPp")}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={scorePercentage >= 80 ? "default" : scorePercentage >= 60 ? "secondary" : "destructive"}
                      >
                        {scorePercentage}%
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {attempt.score}/{attempt.total_points} points
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentQuiz;