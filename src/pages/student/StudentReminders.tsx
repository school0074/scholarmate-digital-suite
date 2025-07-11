import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Bell,
  BellOff,
  Calendar,
  Clock,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Plus,
  Trash2,
  Edit,
  Star,
  Target,
  Timer,
} from "lucide-react";
import {
  format,
  addDays,
  differenceInDays,
  isPast,
  isToday,
  isTomorrow,
} from "date-fns";

interface Reminder {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  subject: string;
  priority: "high" | "medium" | "low";
  type: "assignment" | "exam" | "project" | "homework";
  completed: boolean;
  reminderTime: string;
  notificationsEnabled: boolean;
}

interface NotificationSettings {
  assignmentReminders: boolean;
  examReminders: boolean;
  dailyDigest: boolean;
  emailNotifications: boolean;
  reminderTime: string;
  advanceNotice: number; // days before due date
}

const StudentReminders = () => {
  const { toast } = useToast();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    assignmentReminders: true,
    examReminders: true,
    dailyDigest: true,
    emailNotifications: false,
    reminderTime: "09:00",
    advanceNotice: 1,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMockReminders();
    loadSettings();
  }, []);

  const loadMockReminders = async () => {
    try {
      setLoading(true);

      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const today = new Date();
      const mockReminders: Reminder[] = [
        {
          id: "1",
          title: "Mathematics Assignment - Chapter 5",
          description: "Complete exercises 1-20 on quadratic equations",
          dueDate: format(addDays(today, 2), "yyyy-MM-dd"),
          subject: "Mathematics",
          priority: "high",
          type: "assignment",
          completed: false,
          reminderTime: "09:00",
          notificationsEnabled: true,
        },
        {
          id: "2",
          title: "Physics Lab Report",
          description: "Write detailed report on pendulum experiment",
          dueDate: format(addDays(today, 1), "yyyy-MM-dd"),
          subject: "Physics",
          priority: "high",
          type: "assignment",
          completed: false,
          reminderTime: "10:00",
          notificationsEnabled: true,
        },
        {
          id: "3",
          title: "Chemistry Project Submission",
          description: "Final submission of organic chemistry project",
          dueDate: format(addDays(today, 5), "yyyy-MM-dd"),
          subject: "Chemistry",
          priority: "medium",
          type: "project",
          completed: false,
          reminderTime: "14:00",
          notificationsEnabled: true,
        },
        {
          id: "4",
          title: "English Literature Essay",
          description: "Write 500-word essay on Shakespeare",
          dueDate: format(addDays(today, 7), "yyyy-MM-dd"),
          subject: "English",
          priority: "medium",
          type: "assignment",
          completed: false,
          reminderTime: "16:00",
          notificationsEnabled: true,
        },
        {
          id: "5",
          title: "History Research Paper",
          description: "Research paper on World War II",
          dueDate: format(addDays(today, -2), "yyyy-MM-dd"),
          subject: "History",
          priority: "low",
          type: "assignment",
          completed: true,
          reminderTime: "11:00",
          notificationsEnabled: false,
        },
        {
          id: "6",
          title: "Biology Mid-term Exam",
          description: "Exam covering chapters 1-5",
          dueDate: format(addDays(today, 10), "yyyy-MM-dd"),
          subject: "Biology",
          priority: "high",
          type: "exam",
          completed: false,
          reminderTime: "08:00",
          notificationsEnabled: true,
        },
      ];

      setReminders(mockReminders);
    } catch (error) {
      console.error("Error loading reminders:", error);
      toast({
        title: "Error",
        description: "Failed to load reminders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = () => {
    const savedSettings = localStorage.getItem("reminder-settings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem("reminder-settings", JSON.stringify(newSettings));
    toast({
      title: "Settings Saved",
      description: "Your notification preferences have been updated.",
    });
  };

  const toggleReminderCompleted = (id: string) => {
    setReminders((prev) =>
      prev.map((reminder) => {
        if (reminder.id === id) {
          const updated = { ...reminder, completed: !reminder.completed };
          toast({
            title: updated.completed ? "Task Completed!" : "Task Reopened",
            description: updated.completed
              ? "Great job on completing this task!"
              : "Task has been marked as incomplete",
          });
          return updated;
        }
        return reminder;
      }),
    );
  };

  const toggleNotification = (id: string) => {
    setReminders((prev) =>
      prev.map((reminder) => {
        if (reminder.id === id) {
          const updated = {
            ...reminder,
            notificationsEnabled: !reminder.notificationsEnabled,
          };
          toast({
            title: updated.notificationsEnabled
              ? "Notifications Enabled"
              : "Notifications Disabled",
            description: `Notifications for "${reminder.title}" have been ${updated.notificationsEnabled ? "enabled" : "disabled"}`,
          });
          return updated;
        }
        return reminder;
      }),
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-orange-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "assignment":
        return <BookOpen className="h-4 w-4" />;
      case "exam":
        return <Target className="h-4 w-4" />;
      case "project":
        return <Star className="h-4 w-4" />;
      case "homework":
        return <Timer className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getUrgencyStatus = (dueDate: string, completed: boolean) => {
    if (completed)
      return {
        label: "Completed",
        color: "text-green-600",
        icon: CheckCircle2,
      };

    const date = new Date(dueDate);
    const daysUntil = differenceInDays(date, new Date());

    if (isPast(date)) {
      return { label: "Overdue", color: "text-red-600", icon: AlertTriangle };
    } else if (isToday(date)) {
      return { label: "Due Today", color: "text-orange-600", icon: Clock };
    } else if (isTomorrow(date)) {
      return { label: "Due Tomorrow", color: "text-yellow-600", icon: Clock };
    } else if (daysUntil <= 3) {
      return {
        label: `${daysUntil} days left`,
        color: "text-orange-500",
        icon: Clock,
      };
    } else {
      return {
        label: `${daysUntil} days left`,
        color: "text-blue-500",
        icon: Calendar,
      };
    }
  };

  const upcomingReminders = reminders.filter(
    (r) => !r.completed && !isPast(new Date(r.dueDate)),
  );
  const completedReminders = reminders.filter((r) => r.completed);
  const overdueReminders = reminders.filter(
    (r) => !r.completed && isPast(new Date(r.dueDate)),
  );

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
          <h1 className="text-3xl font-bold">Assignment Reminders</h1>
          <p className="text-muted-foreground">
            Stay on top of your assignments and deadlines
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Reminder
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold">{upcomingReminders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{overdueReminders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {completedReminders.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold">
                  {
                    reminders.filter(
                      (r) => r.notificationsEnabled && !r.completed,
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Notification Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Assignment Reminders</p>
                <p className="text-sm text-muted-foreground">
                  Get notified about upcoming assignments
                </p>
              </div>
              <Switch
                checked={settings.assignmentReminders}
                onCheckedChange={(checked) =>
                  saveSettings({ ...settings, assignmentReminders: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Exam Reminders</p>
                <p className="text-sm text-muted-foreground">
                  Get notified about upcoming exams
                </p>
              </div>
              <Switch
                checked={settings.examReminders}
                onCheckedChange={(checked) =>
                  saveSettings({ ...settings, examReminders: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Daily Digest</p>
                <p className="text-sm text-muted-foreground">
                  Daily summary of upcoming tasks
                </p>
              </div>
              <Switch
                checked={settings.dailyDigest}
                onCheckedChange={(checked) =>
                  saveSettings({ ...settings, dailyDigest: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Send reminders to your email
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  saveSettings({ ...settings, emailNotifications: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reminders List */}
      <div className="space-y-6">
        {/* Overdue Tasks */}
        {overdueReminders.length > 0 && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <span>Overdue Tasks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overdueReminders.map((reminder) => {
                  const urgency = getUrgencyStatus(
                    reminder.dueDate,
                    reminder.completed,
                  );
                  const UrgencyIcon = urgency.icon;

                  return (
                    <Card
                      key={reminder.id}
                      className="border-l-4 border-l-red-500"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="flex items-center space-x-2">
                                {getTypeIcon(reminder.type)}
                                <h3 className="text-lg font-semibold">
                                  {reminder.title}
                                </h3>
                              </div>
                              <Badge
                                className={getPriorityColor(reminder.priority)}
                              >
                                {reminder.priority}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={urgency.color}
                              >
                                <UrgencyIcon className="h-3 w-3 mr-1" />
                                {urgency.label}
                              </Badge>
                            </div>

                            <p className="text-muted-foreground mb-3">
                              {reminder.description}
                            </p>

                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <BookOpen className="h-3 w-3" />
                                <span>{reminder.subject}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {format(
                                    new Date(reminder.dueDate),
                                    "MMM dd, yyyy",
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{reminder.reminderTime}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleNotification(reminder.id)}
                            >
                              {reminder.notificationsEnabled ? (
                                <Bell className="h-4 w-4" />
                              ) : (
                                <BellOff className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                toggleReminderCompleted(reminder.id)
                              }
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Upcoming Tasks</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingReminders.length > 0 ? (
              <div className="space-y-3">
                {upcomingReminders.map((reminder) => {
                  const urgency = getUrgencyStatus(
                    reminder.dueDate,
                    reminder.completed,
                  );
                  const UrgencyIcon = urgency.icon;

                  return (
                    <Card
                      key={reminder.id}
                      className="border-l-4 border-l-blue-500"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="flex items-center space-x-2">
                                {getTypeIcon(reminder.type)}
                                <h3 className="text-lg font-semibold">
                                  {reminder.title}
                                </h3>
                              </div>
                              <Badge
                                className={getPriorityColor(reminder.priority)}
                              >
                                {reminder.priority}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={urgency.color}
                              >
                                <UrgencyIcon className="h-3 w-3 mr-1" />
                                {urgency.label}
                              </Badge>
                            </div>

                            <p className="text-muted-foreground mb-3">
                              {reminder.description}
                            </p>

                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <BookOpen className="h-3 w-3" />
                                <span>{reminder.subject}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {format(
                                    new Date(reminder.dueDate),
                                    "MMM dd, yyyy",
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{reminder.reminderTime}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleNotification(reminder.id)}
                            >
                              {reminder.notificationsEnabled ? (
                                <Bell className="h-4 w-4" />
                              ) : (
                                <BellOff className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                toggleReminderCompleted(reminder.id)
                              }
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Upcoming Tasks</h3>
                <p className="text-muted-foreground">
                  You're all caught up! No upcoming assignments or deadlines.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Tasks */}
        {completedReminders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>Completed Tasks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedReminders.slice(0, 3).map((reminder) => (
                  <Card
                    key={reminder.id}
                    className="border-l-4 border-l-green-500 opacity-75"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <div>
                            <h3 className="font-semibold line-through">
                              {reminder.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {reminder.subject}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleReminderCompleted(reminder.id)}
                        >
                          Undo
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {completedReminders.length > 3 && (
                  <p className="text-sm text-muted-foreground text-center">
                    +{completedReminders.length - 3} more completed tasks
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentReminders;
