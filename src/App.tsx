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
import StudentChat from "./pages/student/StudentChat";
import StudentReminders from "./pages/student/StudentReminders";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherHomework from "./pages/teacher/TeacherHomework";
import TeacherAttendance from "./pages/teacher/TeacherAttendance";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminInviteTeacher from "./pages/admin/AdminInviteTeacher";
import DebugPage from "./pages/DebugPage";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import DemoStudentAccess from "./pages/DemoStudentAccess";

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
              <Route path="/demo" element={<DemoStudentAccess />} />
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
