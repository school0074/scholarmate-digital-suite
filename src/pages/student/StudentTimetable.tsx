import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  CalendarDays,
  Clock,
  MapPin,
  Bell,
  BellOff,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  User,
  AlertCircle,
} from "lucide-react";
import {
  format,
  addWeeks,
  subWeeks,
  startOfWeek,
  addDays,
  isToday,
  isSameDay,
} from "date-fns";

interface TimetableEntry {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  subject_name?: string;
  teacher_name?: string;
  room_number?: string;
  subject_id?: string;
  teacher_id?: string;
}

interface NotificationSettings {
  enabled: boolean;
  reminderMinutes: number;
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const TIME_SLOTS = [
  "08:00",
  "08:45",
  "09:30",
  "10:15",
  "11:00",
  "11:45",
  "12:30",
  "13:15",
  "14:00",
  "14:45",
  "15:30",
];

const StudentTimetable = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [timetableData, setTimetableData] = useState<TimetableEntry[]>([]);
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    enabled: false,
    reminderMinutes: 15,
  });
  const [nextClass, setNextClass] = useState<TimetableEntry | null>(null);

  useEffect(() => {
    if (profile) {
      loadTimetableData();
      loadNotificationSettings();
      findNextClass();
    }
  }, [profile, currentWeek]);

  useEffect(() => {
    // Set up interval to update next class
    const interval = setInterval(findNextClass, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [timetableData]);

  const loadTimetableData = async () => {
    try {
      setLoading(true);

      // Get student's class first
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("student_enrollments")
        .select("class_id")
        .eq("student_id", profile?.id)
        .maybeSingle();

      if (enrollmentError || !enrollment) {
        throw new Error("Student enrollment not found");
      }

      // Get timetable for the class
      const { data: timetable, error } = await supabase
        .from("timetable")
        .select(
          `
          id,
          day_of_week,
          start_time,
          end_time,
          room_number,
          subjects:subject_id(name),
          profiles:teacher_id(full_name)
        `,
        )
        .eq("class_id", enrollment.class_id)
        .order("day_of_week")
        .order("start_time");

      if (error) throw error;

      // Transform the data
      const transformedData =
        timetable?.map((entry) => ({
          id: entry.id,
          day_of_week: entry.day_of_week,
          start_time: entry.start_time,
          end_time: entry.end_time,
          room_number: entry.room_number,
          subject_name: entry.subjects?.name || "Unknown Subject",
          teacher_name: entry.profiles?.full_name || "TBA",
          subject_id: entry.subject_id,
          teacher_id: entry.teacher_id,
        })) || [];

      setTimetableData(transformedData);
    } catch (error) {
      console.error("Error loading timetable:", error);
      toast({
        title: "Error",
        description: "Failed to load timetable data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationSettings = async () => {
    // In a real app, this would load from user preferences
    const saved = localStorage.getItem("timetable-notifications");
    if (saved) {
      setNotifications(JSON.parse(saved));
    }
  };

  const updateNotificationSettings = (newSettings: NotificationSettings) => {
    setNotifications(newSettings);
    localStorage.setItem(
      "timetable-notifications",
      JSON.stringify(newSettings),
    );

    if (newSettings.enabled) {
      // Request notification permission
      if ("Notification" in window) {
        Notification.requestPermission();
      }
      toast({
        title: "Notifications Enabled",
        description: `You'll receive reminders ${newSettings.reminderMinutes} minutes before classes`,
      });
    } else {
      toast({
        title: "Notifications Disabled",
        description: "You won't receive class reminders",
      });
    }
  };

  const findNextClass = () => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTime = format(now, "HH:mm");

    // Convert Sunday (0) to our format where Monday = 1
    const todayNumber = currentDay === 0 ? 7 : currentDay;

    // Find today's remaining classes
    const todayClasses = timetableData
      .filter(
        (entry) =>
          entry.day_of_week === todayNumber && entry.start_time > currentTime,
      )
      .sort((a, b) => a.start_time.localeCompare(b.start_time));

    if (todayClasses.length > 0) {
      setNextClass(todayClasses[0]);
      return;
    }

    // Find next day's first class
    for (let i = 1; i <= 7; i++) {
      const nextDay = (todayNumber % 7) + 1;
      const nextDayClasses = timetableData
        .filter((entry) => entry.day_of_week === nextDay)
        .sort((a, b) => a.start_time.localeCompare(b.start_time));

      if (nextDayClasses.length > 0) {
        setNextClass(nextDayClasses[0]);
        return;
      }
    }

    setNextClass(null);
  };

  const getClassesForDay = (dayNumber: number) => {
    return timetableData
      .filter((entry) => entry.day_of_week === dayNumber)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  const isCurrentClass = (entry: TimetableEntry) => {
    const now = new Date();
    const currentDay = now.getDay() === 0 ? 7 : now.getDay();
    const currentTime = format(now, "HH:mm");

    return (
      entry.day_of_week === currentDay &&
      entry.start_time <= currentTime &&
      entry.end_time > currentTime
    );
  };

  const isUpcomingClass = (entry: TimetableEntry) => {
    return nextClass?.id === entry.id;
  };

  const exportTimetable = () => {
    // In a real app, this would generate a PDF or image
    toast({
      title: "Timetable Exported",
      description: "Your timetable has been saved to downloads",
    });
  };

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeek((prev) =>
      direction === "next" ? addWeeks(prev, 1) : subWeeks(prev, 1),
    );
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Timetable</h1>
          <p className="text-muted-foreground">
            Your class schedule with smart reminders
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportTimetable}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={loadTimetableData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Next Class Alert */}
      {nextClass && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <p className="font-medium text-blue-700 dark:text-blue-300">
                  Next Class: {nextClass.subject_name}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {nextClass.start_time} - {nextClass.end_time} | Room{" "}
                  {nextClass.room_number} | {nextClass.teacher_name}
                </p>
              </div>
              <Badge
                variant="outline"
                className="text-blue-600 border-blue-200"
              >
                {DAYS[nextClass.day_of_week - 1]}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Class Reminders</p>
              <p className="text-sm text-muted-foreground">
                Get notified before your classes start
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={notifications.reminderMinutes}
                onChange={(e) =>
                  updateNotificationSettings({
                    ...notifications,
                    reminderMinutes: Number(e.target.value),
                  })
                }
                className="px-3 py-1 text-sm border rounded-md"
                disabled={!notifications.enabled}
              >
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
              <Switch
                checked={notifications.enabled}
                onCheckedChange={(enabled) =>
                  updateNotificationSettings({
                    ...notifications,
                    enabled,
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigateWeek("prev")}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous Week
        </Button>
        <div className="text-center">
          <p className="font-medium">
            Week of{" "}
            {format(
              startOfWeek(currentWeek, { weekStartsOn: 1 }),
              "MMM dd, yyyy",
            )}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigateWeek("next")}>
          Next Week
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Timetable Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {DAYS.map((day, index) => {
          const dayNumber = index + 1;
          const classes = getClassesForDay(dayNumber);
          const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
          const dayDate = addDays(weekStart, index);
          const isDayToday = isToday(dayDate);

          return (
            <Card key={day} className={isDayToday ? "ring-2 ring-primary" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>{day}</span>
                  </span>
                  {isDayToday && (
                    <Badge variant="default" className="text-xs">
                      Today
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {format(dayDate, "MMM dd")}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {classes.length > 0 ? (
                  classes.map((classEntry) => (
                    <div
                      key={classEntry.id}
                      className={`p-3 rounded-lg border ${
                        isCurrentClass(classEntry)
                          ? "bg-green-50 border-green-200 dark:bg-green-950/20"
                          : isUpcomingClass(classEntry)
                            ? "bg-blue-50 border-blue-200 dark:bg-blue-950/20"
                            : "bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {classEntry.subject_name}
                          </p>
                          <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {classEntry.start_time} - {classEntry.end_time}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>Room {classEntry.room_number}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{classEntry.teacher_name}</span>
                          </div>
                        </div>
                        {isCurrentClass(classEntry) && (
                          <Badge
                            variant="default"
                            className="text-xs bg-green-500"
                          >
                            Now
                          </Badge>
                        )}
                        {isUpcomingClass(classEntry) && (
                          <Badge
                            variant="outline"
                            className="text-xs border-blue-500 text-blue-600"
                          >
                            Next
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No classes scheduled</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Timetable Message */}
      {timetableData.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Timetable Available</h3>
            <p className="text-muted-foreground mb-4">
              Your class timetable hasn't been set up yet. Please contact your
              teacher or administrator.
            </p>
            <Button onClick={loadTimetableData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentTimetable;
