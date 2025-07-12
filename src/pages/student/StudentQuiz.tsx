import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Target,
  Clock,
  CheckCircle,
  X,
  Play,
  Pause,
  RotateCcw,
  Award,
  TrendingUp,
  Calendar,
  BookOpen,
  Star,
  Timer,
  AlertCircle,
  ChevronRight,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { format, formatDistance } from "date-fns";

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
  creator?: {
    full_name: string;
  };
  subject?: string;
}

interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string | null;
  points: number;
}

interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  answers: Record<string, string>;
  score: number;
  total_points: number;
  completed_at: string;
  time_taken_seconds: number | null;
  quiz?: Quiz;
}

interface QuizSession {
  quiz: Quiz;
  questions: QuizQuestion[];
  startTime: Date;
  currentQuestionIndex: number;
  answers: Record<string, string>;
  timeElapsed: number;
}

const StudentQuiz = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [currentSession, setCurrentSession] = useState<QuizSession | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  // Timer for current quiz session
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (profile) {
      loadQuizData();
    }
  }, [profile]);

  // Timer effect for active quiz session
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (currentSession) {
      interval = setInterval(() => {
        const elapsed = Math.floor(
          (Date.now() - currentSession.startTime.getTime()) / 1000,
        );
        setTimeElapsed(elapsed);

        // Auto-submit if time limit exceeded
        if (
          currentSession.quiz.time_limit_minutes &&
          elapsed >= currentSession.quiz.time_limit_minutes * 60
        ) {
          submitQuiz();
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentSession]);

  const loadQuizData = async () => {
    try {
      setLoading(true);

      if (!profile?.id) {
        throw new Error("Student profile not found");
      }

      // Get student's enrollment to find their class
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("student_enrollments")
        .select("class_id")
        .eq("student_id", profile.id)
        .single();

      if (enrollmentError) {
        console.error("Error fetching enrollment:", enrollmentError);
        throw new Error("Failed to load student enrollment");
      }

      // Load available quizzes for student's class
      const { data: quizzesData, error: quizzesError } = await supabase
        .from("quizzes")
        .select(
          `
          id,
          title,
          description,
          subject_id,
          class_id,
          created_by,
          total_questions,
          time_limit_minutes,
          active,
          created_at,
          profiles!quizzes_created_by_fkey(full_name)
        `,
        )
        .eq("class_id", enrollment.class_id)
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (quizzesError) {
        console.error("Error loading quizzes:", quizzesError);
        throw new Error("Failed to load quizzes");
      }

      const quizzes =
        quizzesData?.map((quiz) => ({
          ...quiz,
          creator: quiz.profiles,
          subject: "General", // Would be populated from subjects table if available
        })) || [];

      setAvailableQuizzes(quizzes);

      // Load quiz attempts by this student
      const { data: attemptsData, error: attemptsError } = await supabase
        .from("quiz_attempts")
        .select(
          `
          id,
          quiz_id,
          student_id,
          answers,
          score,
          total_points,
          completed_at,
          time_taken_seconds,
          quizzes!quiz_attempts_quiz_id_fkey(
            title,
            description,
            total_questions
          )
        `,
        )
        .eq("student_id", profile.id)
        .order("completed_at", { ascending: false });

      if (attemptsError) {
        console.error("Error loading quiz attempts:", attemptsError);
        throw new Error("Failed to load quiz history");
      }

      const attempts =
        attemptsData?.map((attempt) => ({
          ...attempt,
          quiz: attempt.quizzes,
        })) || [];

      setQuizAttempts(attempts);
    } catch (error) {
      console.error("Error loading quiz data:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load quiz data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (quiz: Quiz) => {
    try {
      // Check if student has already attempted this quiz
      const existingAttempt = quizAttempts.find(
        (attempt) => attempt.quiz_id === quiz.id,
      );
      if (existingAttempt) {
        toast({
          title: "Quiz Already Completed",
          description: "You have already completed this quiz",
          variant: "destructive",
        });
        return;
      }

      // Load quiz questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quiz.id)
        .order("created_at");

      if (questionsError) {
        console.error("Error loading quiz questions:", questionsError);
        throw new Error("Failed to load quiz questions");
      }

      if (!questionsData || questionsData.length === 0) {
        toast({
          title: "No Questions",
          description: "This quiz has no questions available",
          variant: "destructive",
        });
        return;
      }

      // Start quiz session
      const session: QuizSession = {
        quiz,
        questions: questionsData,
        startTime: new Date(),
        currentQuestionIndex: 0,
        answers: {},
        timeElapsed: 0,
      };

      setCurrentSession(session);
      setTimeElapsed(0);
      setSelectedQuiz(null);
    } catch (error) {
      console.error("Error starting quiz:", error);
      toast({
        title: "Error",
        description: "Failed to start quiz",
        variant: "destructive",
      });
    }
  };

  const answerQuestion = (questionId: string, answer: string) => {
    if (!currentSession) return;

    setCurrentSession({
      ...currentSession,
      answers: {
        ...currentSession.answers,
        [questionId]: answer,
      },
    });
  };

  const nextQuestion = () => {
    if (!currentSession) return;

    if (
      currentSession.currentQuestionIndex <
      currentSession.questions.length - 1
    ) {
      setCurrentSession({
        ...currentSession,
        currentQuestionIndex: currentSession.currentQuestionIndex + 1,
      });
    }
  };

  const previousQuestion = () => {
    if (!currentSession) return;

    if (currentSession.currentQuestionIndex > 0) {
      setCurrentSession({
        ...currentSession,
        currentQuestionIndex: currentSession.currentQuestionIndex - 1,
      });
    }
  };

  const submitQuiz = async () => {
    if (!currentSession || !profile?.id) return;

    try {
      setSubmitting(true);

      // Calculate score
      let score = 0;
      let totalPoints = 0;

      currentSession.questions.forEach((question) => {
        totalPoints += question.points;
        const studentAnswer = currentSession.answers[question.id];
        if (studentAnswer === question.correct_answer) {
          score += question.points;
        }
      });

      const timeElapsedSeconds = Math.floor(
        (Date.now() - currentSession.startTime.getTime()) / 1000,
      );

      // Submit quiz attempt
      const { error: submitError } = await supabase
        .from("quiz_attempts")
        .insert({
          quiz_id: currentSession.quiz.id,
          student_id: profile.id,
          answers: currentSession.answers,
          score,
          total_points: totalPoints,
          time_taken_seconds: timeElapsedSeconds,
        });

      if (submitError) {
        console.error("Error submitting quiz:", submitError);
        throw new Error("Failed to submit quiz");
      }

      toast({
        title: "Quiz Submitted!",
        description: `You scored ${score}/${totalPoints} points (${Math.round((score / totalPoints) * 100)}%)`,
      });

      // Clear current session and reload data
      setCurrentSession(null);
      setTimeElapsed(0);
      await loadQuizData();
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast({
        title: "Error",
        description: "Failed to submit quiz",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getQuizStats = () => {
    const totalAttempts = quizAttempts.length;
    const averageScore =
      totalAttempts > 0
        ? Math.round(
            quizAttempts.reduce(
              (sum, attempt) =>
                sum + (attempt.score / attempt.total_points) * 100,
              0,
            ) / totalAttempts,
          )
        : 0;
    const bestScore =
      totalAttempts > 0
        ? Math.max(
            ...quizAttempts.map((attempt) =>
              Math.round((attempt.score / attempt.total_points) * 100),
            ),
          )
        : 0;

    return {
      totalAttempts,
      averageScore,
      bestScore,
      availableQuizzes: availableQuizzes.length,
    };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const stats = getQuizStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Active quiz session view
  if (currentSession) {
    const currentQuestion =
      currentSession.questions[currentSession.currentQuestionIndex];
    const progress =
      ((currentSession.currentQuestionIndex + 1) /
        currentSession.questions.length) *
      100;
    const timeRemaining = currentSession.quiz.time_limit_minutes
      ? currentSession.quiz.time_limit_minutes * 60 - timeElapsed
      : null;

    return (
      <div className="space-y-6">
        {/* Quiz Header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">
                  {currentSession.quiz.title}
                </h1>
                <p className="text-muted-foreground">
                  Question {currentSession.currentQuestionIndex + 1} of{" "}
                  {currentSession.questions.length}
                </p>
              </div>
              <div className="text-right">
                {timeRemaining !== null && (
                  <div
                    className={`text-lg font-bold ${timeRemaining <= 300 ? "text-red-500" : ""}`}
                  >
                    <Timer className="h-4 w-4 inline mr-1" />
                    {formatTime(timeRemaining)}
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  Elapsed: {formatTime(timeElapsed)}
                </div>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Current Question */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Question {currentSession.currentQuestionIndex + 1}</span>
              <Badge variant="outline">
                {currentQuestion.points} point
                {currentQuestion.points !== 1 ? "s" : ""}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">{currentQuestion.question}</p>

            <RadioGroup
              value={currentSession.answers[currentQuestion.id] || ""}
              onValueChange={(value) =>
                answerQuestion(currentQuestion.id, value)
              }
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={previousQuestion}
                disabled={currentSession.currentQuestionIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center space-x-2">
                {currentSession.currentQuestionIndex <
                currentSession.questions.length - 1 ? (
                  <Button onClick={nextQuestion}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={submitQuiz}
                    disabled={submitting}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Submit Quiz
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Answer Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Answer Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-2">
              {currentSession.questions.map((_, index) => {
                const isAnswered =
                  currentSession.answers[currentSession.questions[index].id];
                const isCurrent = index === currentSession.currentQuestionIndex;

                return (
                  <Button
                    key={index}
                    variant={
                      isCurrent
                        ? "default"
                        : isAnswered
                          ? "secondary"
                          : "outline"
                    }
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() =>
                      setCurrentSession({
                        ...currentSession,
                        currentQuestionIndex: index,
                      })
                    }
                  >
                    {index + 1}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz details view
  if (selectedQuiz) {
    const hasAttempted = quizAttempts.some(
      (attempt) => attempt.quiz_id === selectedQuiz.id,
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedQuiz(null)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Quiz Details</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{selectedQuiz.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedQuiz.description && (
              <p className="text-muted-foreground">
                {selectedQuiz.description}
              </p>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Questions: {selectedQuiz.total_questions}
                  </span>
                </div>
                {selectedQuiz.time_limit_minutes && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Time Limit: {selectedQuiz.time_limit_minutes} minutes
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Created: {format(new Date(selectedQuiz.created_at), "PPP")}
                  </span>
                </div>
                {selectedQuiz.creator && (
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Created by: {selectedQuiz.creator.full_name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {hasAttempted ? (
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-green-700 dark:text-green-300">
                    Quiz Completed
                  </span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  You have already completed this quiz. Check your results in
                  the History tab.
                </p>
              </div>
            ) : (
              <Button
                onClick={() => startQuiz(selectedQuiz)}
                className="w-full"
                size="lg"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Quiz
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main quiz dashboard
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quizzes</h1>
          <p className="text-muted-foreground">
            Take quizzes and test your knowledge
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Available Quizzes
                </p>
                <p className="text-2xl font-bold">{stats.availableQuizzes}</p>
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
                <p className="text-2xl font-bold">{stats.totalAttempts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">{stats.averageScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Best Score</p>
                <p className="text-2xl font-bold">{stats.bestScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList>
          <TabsTrigger value="available">Available Quizzes</TabsTrigger>
          <TabsTrigger value="history">
            Quiz History ({stats.totalAttempts})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableQuizzes.map((quiz) => {
              const hasAttempted = quizAttempts.some(
                (attempt) => attempt.quiz_id === quiz.id,
              );

              return (
                <Card
                  key={quiz.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    hasAttempted ? "opacity-75" : ""
                  }`}
                  onClick={() => setSelectedQuiz(quiz)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold line-clamp-2">
                          {quiz.title}
                        </h3>
                        <Badge variant={hasAttempted ? "default" : "secondary"}>
                          {hasAttempted ? "Completed" : "Available"}
                        </Badge>
                      </div>

                      {quiz.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {quiz.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{quiz.total_questions} questions</span>
                        {quiz.time_limit_minutes && (
                          <span>{quiz.time_limit_minutes} min</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          by {quiz.creator?.full_name || "Unknown"}
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {availableQuizzes.length === 0 && (
              <div className="col-span-full text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No quizzes available at the moment
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {quizAttempts.map((attempt) => (
              <Card key={attempt.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{attempt.quiz?.title}</h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <span>
                          Score: {attempt.score}/{attempt.total_points}
                        </span>
                        <span>
                          Percentage:{" "}
                          {Math.round(
                            (attempt.score / attempt.total_points) * 100,
                          )}
                          %
                        </span>
                        {attempt.time_taken_seconds && (
                          <span>
                            Time: {formatTime(attempt.time_taken_seconds)}
                          </span>
                        )}
                        <span>
                          Completed:{" "}
                          {format(new Date(attempt.completed_at), "PPp")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          attempt.score / attempt.total_points >= 0.8
                            ? "default"
                            : attempt.score / attempt.total_points >= 0.6
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {Math.round(
                          (attempt.score / attempt.total_points) * 100,
                        )}
                        %
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {quizAttempts.length === 0 && (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No quiz attempts yet</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentQuiz;
