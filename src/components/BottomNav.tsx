import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart3,
  QrCode,
  FileText,
  Calendar,
  MessageSquare,
  Users,
  Upload,
  Trophy,
  Clock,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const location = useLocation();
  const { profile } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  // Get the most important navigation items for each role
  const getNavItems = () => {
    switch (profile?.role) {
      case "student":
        return [
          { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
          { title: "ID Card", url: "/student/id-card", icon: QrCode },
          { title: "Homework", url: "/student/homework", icon: FileText },
          { title: "Timetable", url: "/student/timetable", icon: Calendar },
            {
              title: "Chat",
              url: "/student/chat",
              icon: MessageSquare,
            },
        ];
      case "teacher":
        return [
          { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
          { title: "Classes", url: "/teacher/classes", icon: Users },
          { title: "Homework", url: "/teacher/homework", icon: FileText },
          { title: "Attendance", url: "/teacher/attendance", icon: UserCheck },
          { title: "Materials", url: "/teacher/materials", icon: Upload },
        ];
      case "admin":
        return [
          { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
          { title: "Users", url: "/admin/users", icon: Users },
          { title: "Classes", url: "/admin/classes", icon: Trophy },
          { title: "Events", url: "/admin/events", icon: Calendar },
          { title: "Analytics", url: "/admin/analytics", icon: Clock },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  if (navItems.length === 0) return null;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 bottom-nav-blur border-t border-border safe-area-inset-bottom mobile-tap-highlight">
      <div className="flex items-center justify-around px-2 py-3 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.url);

          return (
            <NavLink
              key={item.title}
              to={item.url}
              className={cn(
                "relative flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 touch-target min-w-[60px] active:scale-95",
                active
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30 active:bg-muted/50",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 mb-1 transition-transform",
                  active && "scale-110",
                )}
              />
              <span
                className={cn(
                  "text-xs font-medium leading-none transition-all",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {item.title}
              </span>

              {/* Active indicator */}
              {active && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-pulse" />
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom safe area padding for devices with home indicator */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
};

export default BottomNav;
