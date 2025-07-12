import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import StudentIDCard from "./pages/student/StudentIDCard";
import StudentHomework from "./pages/student/StudentHomework";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentTimetable from "./pages/student/StudentTimetable";
import StudentExams from "./pages/student/StudentExams";
import StudentGrades from "./pages/student/StudentGrades";
import StudentMessages from "./pages/student/StudentMessages";
import StudentLibrary from "./pages/student/StudentLibrary";
import StudentFees from "./pages/student/StudentFees";
import StudentQuiz from "./pages/student/StudentQuiz";
import StudentChat from "./pages/student/StudentChat";
import StudentReminders from "./pages/student/StudentReminders";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherHomework from "./pages/teacher/TeacherHomework";
import TeacherAttendance from "./pages/teacher/TeacherAttendance";
import TeacherMaterials from "./pages/teacher/TeacherMaterials";
import TeacherAnnouncements from "./pages/teacher/TeacherAnnouncements";
import TeacherGrading from "./pages/teacher/TeacherGrading";
import TeacherMessages from "./pages/teacher/TeacherMessages";
import TeacherTimetable from "./pages/teacher/TeacherTimetable";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminInviteTeacher from "./pages/admin/AdminInviteTeacher";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminClasses from "./pages/admin/AdminClasses";
import AdminFees from "./pages/admin/AdminFees";
import AdminLogs from "./pages/admin/AdminLogs";
import DebugPage from "./pages/DebugPage";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/debug" element={<DebugPage />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <DashboardPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/*"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <DashboardLayout>
                      <Routes>
                        <Route
                          path="dashboard"
                          element={<StudentDashboard />}
                        />
                        <Route path="id-card" element={<StudentIDCard />} />
                        <Route
                          path="attendance"
                          element={<StudentAttendance />}
                        />
                        <Route path="homework" element={<StudentHomework />} />
                        <Route
                          path="timetable"
                          element={<StudentTimetable />}
                        />
                        <Route path="exams" element={<StudentExams />} />
                        <Route path="grades" element={<StudentGrades />} />
                        <Route path="messages" element={<StudentMessages />} />
                        <Route path="library" element={<StudentLibrary />} />
                        <Route path="fees" element={<StudentFees />} />
                        <Route path="quiz" element={<StudentQuiz />} />
                        <Route path="quizzes" element={<StudentQuiz />} />
                        <Route path="doubts" element={<StudentChat />} />
                        <Route path="chat" element={<StudentChat />} />
                        <Route
                          path="reminders"
                          element={<StudentReminders />}
                        />
                        <Route
                          path="*"
                          element={
                            <div className="p-6">
                              More student features coming soon...
                            </div>
                          }
                        />
                      </Routes>
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/*"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <DashboardLayout>
                      <Routes>
                        <Route
                          path="dashboard"
                          element={<TeacherDashboard />}
                        />
                        <Route
                          path="homework/*"
                          element={<TeacherHomework />}
                        />
                        <Route
                          path="attendance"
                          element={<TeacherAttendance />}
                        />
                        <Route
                          path="materials"
                          element={<TeacherMaterials />}
                        />
                        <Route
                          path="announcements"
                          element={<TeacherAnnouncements />}
                        />
                        <Route path="grading" element={<TeacherGrading />} />
                        <Route path="messages" element={<TeacherMessages />} />
                        <Route
                          path="timetable"
                          element={<TeacherTimetable />}
                        />
                        <Route
                          path="*"
                          element={
                            <div className="p-6">
                              More teacher features coming soon...
                            </div>
                          }
                        />
                      </Routes>
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <DashboardLayout>
                      <Routes>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route
                          path="invite-teacher"
                          element={<AdminInviteTeacher />}
                        />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="settings" element={<AdminSettings />} />
                        <Route
                          path="announcements"
                          element={<AdminAnnouncements />}
                        />
                        <Route path="analytics" element={<AdminAnalytics />} />
                        <Route path="classes" element={<AdminClasses />} />
                        <Route path="fees" element={<AdminFees />} />
                        <Route path="logs" element={<AdminLogs />} />
                        <Route
                          path="*"
                          element={
                            <div className="p-6">
                              More admin features coming soon...
                            </div>
                          }
                        />
                      </Routes>
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
