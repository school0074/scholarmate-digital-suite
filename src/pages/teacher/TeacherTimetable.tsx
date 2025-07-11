import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Clock,
  Edit3,
  Download,
  Plus,
  Users,
  MapPin,
  AlertCircle,
  CheckCircle,
  Settings,
  Eye,
  Trash2,
} from "lucide-react";

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  class: string;
  room: string;
  duration: number;
  type: "lecture" | "practical" | "tutorial" | "exam";
  students?: number;
  description?: string;
}

interface TimetableStats {
  totalHours: number;
  totalClasses: number;
  subjects: number;
  avgClassSize: number;
  busyDays: number;
}

const TeacherTimetable = () => {
  const { toast } = useToast();
  const [selectedWeek, setSelectedWeek] = useState("current");
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [selectedDay, setSelectedDay] = useState("monday");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);

  // Mock teacher profile
  const teacherProfile = {
    id: "teacher-123",
    full_name: "Prof. Sarah Johnson",
    subjects: ["Mathematics", "Physics", "Advanced Calculus"],
    classes: ["Class 10A", "Class 10B", "Class 11 Science", "Class 12 Physics"],
  };

  // Mock timetable data
  const [timetableSlots, setTimetableSlots] = useState<TimeSlot[]>([
    {
      id: "slot-1",
      day: "Monday",
      startTime: "08:00",
      endTime: "09:00",
      subject: "Mathematics",
      class: "Class 10A",
      room: "Room 101",
      duration: 60,
      type: "lecture",
      students: 35,
      description: "Algebra and Functions",
    },
    {
      id: "slot-2",
      day: "Monday",
      startTime: "10:00",
      endTime: "11:00",
      subject: "Physics",
      class: "Class 11 Science",
      room: "Lab 201",
      duration: 60,
      type: "practical",
      students: 28,
      description: "Mechanics Lab",
    },
    {
      id: "slot-3",
      day: "Tuesday",
      startTime: "09:00",
      endTime: "10:00",
      subject: "Mathematics",
      class: "Class 10B",
      room: "Room 102",
      duration: 60,
      type: "lecture",
      students: 32,
      description: "Quadratic Equations",
    },
    {
      id: "slot-4",
      day: "Tuesday",
      startTime: "11:00",
      endTime: "12:00",
      subject: "Advanced Calculus",
      class: "Class 12 Physics",
      room: "Room 301",
      duration: 60,
      type: "lecture",
      students: 25,
      description: "Integration Techniques",
    },
    {
      id: "slot-5",
      day: "Wednesday",
      startTime: "08:00",
      endTime: "09:30",
      subject: "Mathematics",
      class: "Class 10A",
      room: "Room 101",
      duration: 90,
      type: "tutorial",
      students: 35,
      description: "Problem Solving Session",
    },
    {
      id: "slot-6",
      day: "Thursday",
      startTime: "10:00",
      endTime: "12:00",
      subject: "Physics",
      class: "Class 11 Science",
      room: "Lab 201",
      duration: 120,
      type: "practical",
      students: 28,
      description: "Wave Mechanics Lab",
    },
    {
      id: "slot-7",
      day: "Friday",
      startTime: "09:00",
      endTime: "10:00",
      subject: "Advanced Calculus",
      class: "Class 12 Physics",
      room: "Room 301",
      duration: 60,
      type: "lecture",
      students: 25,
      description: "Differential Equations",
    },
    {
      id: "slot-8",
      day: "Friday",
      startTime: "14:00",
      endTime: "16:00",
      subject: "Mathematics",
      class: "Class 10A",
      room: "Exam Hall",
      duration: 120,
      type: "exam",
      students: 35,
      description: "Monthly Assessment",
    },
  ]);

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const timeSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
  ];

  // Calculate timetable statistics
  const calculateStats = (): TimetableStats => {
    const totalHours = timetableSlots.reduce(
      (sum, slot) => sum + slot.duration / 60,
      0,
    );
    const totalClasses = timetableSlots.length;
    const subjects = new Set(timetableSlots.map((slot) => slot.subject)).size;
    const avgClassSize =
      timetableSlots.reduce((sum, slot) => sum + (slot.students || 0), 0) /
      totalClasses;
    const busyDays = new Set(timetableSlots.map((slot) => slot.day)).size;

    return {
      totalHours: Math.round(totalHours * 10) / 10,
      totalClasses,
      subjects,
      avgClassSize: Math.round(avgClassSize),
      busyDays,
    };
  };

  const stats = calculateStats();

  // Get slots for a specific day
  const getSlotsForDay = (day: string) => {
    return timetableSlots
      .filter((slot) => slot.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  // Check for schedule conflicts
  const checkConflicts = (newSlot: Partial<TimeSlot>, excludeId?: string) => {
    const daySlots = timetableSlots.filter(
      (slot) => slot.day === newSlot.day && slot.id !== excludeId,
    );

    return daySlots.some((slot) => {
      const slotStart = new Date(`2000-01-01 ${slot.startTime}`);
      const slotEnd = new Date(`2000-01-01 ${slot.endTime}`);
      const newStart = new Date(`2000-01-01 ${newSlot.startTime}`);
      const newEnd = new Date(`2000-01-01 ${newSlot.endTime}`);

      return newStart < slotEnd && newEnd > slotStart;
    });
  };

  // Handle slot creation/editing
  const handleSaveSlot = (slotData: Partial<TimeSlot>) => {
    if (checkConflicts(slotData, editingSlot?.id)) {
      toast({
        title: "Schedule Conflict",
        description: "This time slot conflicts with an existing class",
        variant: "destructive",
      });
      return;
    }

    if (editingSlot) {
      // Update existing slot
      setTimetableSlots((prev) =>
        prev.map((slot) =>
          slot.id === editingSlot.id ? { ...slot, ...slotData } : slot,
        ),
      );
      toast({
        title: "Class Updated",
        description: "The class schedule has been updated successfully",
      });
    } else {
      // Create new slot
      const newSlot: TimeSlot = {
        id: `slot-${Date.now()}`,
        day: slotData.day || "Monday",
        startTime: slotData.startTime || "09:00",
        endTime: slotData.endTime || "10:00",
        subject: slotData.subject || "",
        class: slotData.class || "",
        room: slotData.room || "",
        duration: slotData.duration || 60,
        type: slotData.type || "lecture",
        students: slotData.students || 0,
        description: slotData.description || "",
      };
      setTimetableSlots((prev) => [...prev, newSlot]);
      toast({
        title: "Class Added",
        description: "New class has been added to your timetable",
      });
    }

    setIsEditDialogOpen(false);
    setEditingSlot(null);
  };

  // Handle slot deletion
  const handleDeleteSlot = (slotId: string) => {
    setTimetableSlots((prev) => prev.filter((slot) => slot.id !== slotId));
    toast({
      title: "Class Removed",
      description: "The class has been removed from your timetable",
    });
  };

  // Export timetable
  const handleExport = () => {
    const exportData = {
      teacher: teacherProfile.full_name,
      generated: new Date().toLocaleDateString(),
      schedule: timetableSlots,
      statistics: stats,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `timetable_${teacherProfile.full_name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Timetable Exported",
      description: "Your timetable has been exported successfully",
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "lecture":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "practical":
        return "bg-green-100 text-green-800 border-green-200";
      case "tutorial":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "exam":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const TimeSlotCard = ({ slot }: { slot: TimeSlot }) => (
    <Card className="mb-2 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-sm">
                {slot.startTime} - {slot.endTime}
              </span>
              <Badge className={`text-xs ${getTypeColor(slot.type)}`}>
                {slot.type}
              </Badge>
            </div>
            <h4 className="font-semibold text-lg text-gray-900">
              {slot.subject}
            </h4>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{slot.class}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>{slot.room}</span>
              </div>
              <span>{slot.students} students</span>
            </div>
            {slot.description && (
              <p className="text-sm text-gray-500 mt-1">{slot.description}</p>
            )}
          </div>
          <div className="flex space-x-1 ml-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingSlot(slot);
                setIsEditDialogOpen(true);
              }}
            >
              <Edit3 className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteSlot(slot.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SlotEditDialog = () => {
    const [formData, setFormData] = useState({
      day: editingSlot?.day || "Monday",
      startTime: editingSlot?.startTime || "09:00",
      endTime: editingSlot?.endTime || "10:00",
      subject: editingSlot?.subject || "",
      class: editingSlot?.class || "",
      room: editingSlot?.room || "",
      type: editingSlot?.type || "lecture",
      students: editingSlot?.students || 0,
      description: editingSlot?.description || "",
    });

    const calculateDuration = (start: string, end: string) => {
      const startTime = new Date(`2000-01-01 ${start}`);
      const endTime = new Date(`2000-01-01 ${end}`);
      return Math.round(
        (endTime.getTime() - startTime.getTime()) / (1000 * 60),
      );
    };

    return (
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSlot ? "Edit Class" : "Add New Class"}
            </DialogTitle>
            <DialogDescription>
              {editingSlot
                ? "Update the class details"
                : "Create a new class in your timetable"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="day">Day</Label>
                <Select
                  value={formData.day}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, day: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, type: value as any }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lecture">Lecture</SelectItem>
                    <SelectItem value="practical">Practical</SelectItem>
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Select
                  value={formData.startTime}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, startTime: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Select
                  value={formData.endTime}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, endTime: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={formData.subject}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, subject: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {teacherProfile.subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="class">Class</Label>
              <Select
                value={formData.class}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, class: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {teacherProfile.classes.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="room">Room</Label>
                <Input
                  value={formData.room}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, room: e.target.value }))
                  }
                  placeholder="e.g., Room 101"
                />
              </div>
              <div>
                <Label htmlFor="students">Students</Label>
                <Input
                  type="number"
                  value={formData.students}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      students: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="Number of students"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Class topic or additional notes"
                rows={2}
              />
            </div>

            <div className="text-sm text-gray-600">
              Duration:{" "}
              {calculateDuration(formData.startTime, formData.endTime)} minutes
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                onClick={() => {
                  handleSaveSlot({
                    ...formData,
                    duration: calculateDuration(
                      formData.startTime,
                      formData.endTime,
                    ),
                  });
                }}
                className="flex-1"
              >
                {editingSlot ? "Update Class" : "Add Class"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingSlot(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Timetable
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your teaching schedule and class timings
            </p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button
              variant="outline"
              onClick={() => {
                setEditingSlot(null);
                setIsEditDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalHours}h
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Total Hours/Week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalClasses}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Total Classes
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Settings className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.subjects}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Subjects
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.avgClassSize}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Avg Class Size
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.busyDays}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Active Days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* View Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <div className="flex space-x-2">
            <Button
              variant={viewMode === "week" ? "default" : "outline"}
              onClick={() => setViewMode("week")}
            >
              Week View
            </Button>
            <Button
              variant={viewMode === "day" ? "default" : "outline"}
              onClick={() => setViewMode("day")}
            >
              Day View
            </Button>
          </div>

          <div className="flex space-x-2">
            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Week</SelectItem>
                <SelectItem value="next">Next Week</SelectItem>
                <SelectItem value="custom">Custom Week</SelectItem>
              </SelectContent>
            </Select>

            {viewMode === "day" && (
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day} value={day.toLowerCase()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Timetable View */}
        {viewMode === "week" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {days.map((day) => {
              const daySlots = getSlotsForDay(day);
              return (
                <Card key={day}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{day}</span>
                      <Badge variant="secondary">
                        {daySlots.length} classes
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {daySlots.length > 0 ? (
                      <div className="space-y-2">
                        {daySlots.map((slot) => (
                          <TimeSlotCard key={slot.id} slot={slot} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No classes scheduled</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}{" "}
                  Schedule
                </span>
                <Badge variant="secondary">
                  {
                    getSlotsForDay(
                      selectedDay.charAt(0).toUpperCase() +
                        selectedDay.slice(1),
                    ).length
                  }{" "}
                  classes
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getSlotsForDay(
                selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1),
              ).length > 0 ? (
                <div className="space-y-4">
                  {getSlotsForDay(
                    selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1),
                  ).map((slot) => (
                    <TimeSlotCard key={slot.id} slot={slot} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">
                    No Classes Scheduled
                  </h3>
                  <p className="mb-4">
                    You have no classes scheduled for this day
                  </p>
                  <Button
                    onClick={() => {
                      setEditingSlot(null);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add a Class
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Conflicts Warning */}
        {timetableSlots.some((slot, index) =>
          timetableSlots
            .slice(index + 1)
            .some(
              (otherSlot) =>
                slot.day === otherSlot.day &&
                checkConflicts(slot, otherSlot.id),
            ),
        ) && (
          <Card className="mt-6 border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="font-medium text-red-700 dark:text-red-300">
                  Schedule Conflicts Detected
                </span>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                Some of your classes have overlapping time slots. Please review
                and adjust your schedule.
              </p>
            </CardContent>
          </Card>
        )}

        <SlotEditDialog />
      </div>
    </div>
  );
};

export default TeacherTimetable;
