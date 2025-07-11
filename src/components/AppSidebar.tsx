import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  BookOpen,
  Calendar,
  FileText,
  BarChart3,
  Users,
  Settings,
  MessageSquare,
  Bell,
  CreditCard,
  Trophy,
  Clock,
  UserCheck,
  Upload,
  GraduationCap,
  Shield,
  Sun,
  Moon,
  Monitor,
  CheckCircle,
  PieChart,
  BrainCircuit,
  Heart,
  QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AppSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const { profile } = useAuth();
  const { theme, setTheme } = useTheme();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => currentPath === path;

  const studentMenuItems = [
    { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
    { title: "Digital ID", url: "/student/id-card", icon: QrCode },
    { title: "Attendance", url: "/student/attendance", icon: UserCheck },
    { title: "Homework", url: "/student/homework", icon: FileText },
    { title: "Timetable", url: "/student/timetable", icon: Calendar },
    { title: "Exams", url: "/student/exams", icon: Clock },
    { title: "Grades", url: "/student/grades", icon: Trophy },
    { title: "Study Materials", url: "/student/materials", icon: BookOpen },
    { title: "Ask Teacher", url: "/student/ask-doubt", icon: MessageSquare },
    { title: "Quizzes", url: "/student/quizzes", icon: BrainCircuit },
    { title: "Achievements", url: "/student/achievements", icon: Heart },
    { title: "Fees", url: "/student/fees", icon: CreditCard },
  ];

  const teacherMenuItems = [
    { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
    { title: "Classes", url: "/teacher/classes", icon: Users },
    { title: "Attendance", url: "/teacher/attendance", icon: UserCheck },
    { title: "Homework", url: "/teacher/homework", icon: FileText },
    { title: "Timetable", url: "/teacher/timetable", icon: Calendar },
    { title: "Exams", url: "/teacher/exams", icon: Clock },
    { title: "Grading", url: "/teacher/grading", icon: CheckCircle },
    { title: "Materials", url: "/teacher/materials", icon: Upload },
    { title: "Messages", url: "/teacher/messages", icon: MessageSquare },
    { title: "Announcements", url: "/teacher/announcements", icon: Bell },
    { title: "Analytics", url: "/teacher/analytics", icon: PieChart },
  ];

  const adminMenuItems = [
    { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
    { title: "User Management", url: "/admin/users", icon: Users },
    { title: "Classes", url: "/admin/classes", icon: GraduationCap },
    { title: "Teachers", url: "/admin/teachers", icon: Shield },
    { title: "Students", url: "/admin/students", icon: BookOpen },
    { title: "Attendance", url: "/admin/attendance", icon: UserCheck },
    { title: "Fees", url: "/admin/fees", icon: CreditCard },
    { title: "Events", url: "/admin/events", icon: Calendar },
    { title: "Analytics", url: "/admin/analytics", icon: PieChart },
    { title: "Notifications", url: "/admin/notifications", icon: Bell },
    { title: "Settings", url: "/admin/settings", icon: Settings },
  ];

  const getMenuItems = () => {
    switch (profile?.role) {
      case 'student':
        return studentMenuItems;
      case 'teacher':
        return teacherMenuItems;
      case 'admin':
        return adminMenuItems;
      default:
        return [];
    }
  };

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium shadow-soft" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  const menuItems = getMenuItems();

  return (
    <Sidebar className={`border-r border-border bg-card ${collapsed ? "w-14" : "w-64"} transition-all duration-300`}>
      <SidebarContent className="p-4">
        {/* Logo Section */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} mb-6 pb-4 border-b border-border`}>
          <div className="p-2 bg-gradient-primary rounded-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-foreground">ScholarMate</h1>
              <p className="text-xs text-muted-foreground capitalize">{profile?.role} Portal</p>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider mb-2">
              Navigation
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClass}>
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Theme Toggle */}
        <div className="mt-auto pt-4 border-t border-border">
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider mb-2">
                Preferences
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={`w-full ${collapsed ? 'px-2' : 'justify-start'}`}>
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    {!collapsed && <span className="ml-3">Theme</span>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-card border border-border shadow-large z-50" align="end">
                  <DropdownMenuItem onClick={() => setTheme("light")} className="hover:bg-muted">
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")} className="hover:bg-muted">
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")} className="hover:bg-muted">
                    <Monitor className="mr-2 h-4 w-4" />
                    <span>System</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
      
      {/* Collapse Toggle */}
      <div className="absolute top-4 -right-3 z-50">
        <SidebarTrigger className="bg-card border border-border shadow-medium rounded-full p-1 hover:bg-muted" />
      </div>
    </Sidebar>
  );
};

export default AppSidebar;