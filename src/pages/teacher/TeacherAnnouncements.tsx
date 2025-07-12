import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Megaphone,
  Send,
  Users,
  Calendar,
  Clock,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Bell,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Share2,
} from "lucide-react";
import { format, formatDistance } from "date-fns";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: "low" | "medium" | "high";
  type: "general" | "assignment" | "exam" | "event" | "urgent";
  targetAudience: "all" | "class" | "subject";
  classes: string[];
  scheduledDate?: string;
  publishedDate: string;
  isPublished: boolean;
  isScheduled: boolean;
  views: number;
  readBy: number;
  totalRecipients: number;
}

interface Class {
  id: string;
  name: string;
  section: string;
  studentCount: number;
}

const TeacherAnnouncements = () => {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Form state for creating announcements
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "medium" as "low" | "medium" | "high",
    type: "general" as "general" | "assignment" | "exam" | "event" | "urgent",
    targetAudience: "all" as "all" | "class" | "subject",
    selectedClasses: [] as string[],
    isScheduled: false,
    scheduledDate: "",
    scheduledTime: "",
  });

  // Mock teacher profile data
  const mockProfile = {
    id: "teacher-123",
    full_name: "Prof. Sarah Johnson",
  };

  useEffect(() => {
    loadTeacherData();
  }, []);

  const loadTeacherData = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get teacher's classes from teacher_assignments
      const { data: teacherAssignments } = await supabase
        .from("teacher_assignments")
        .select(
          `
          *,
          classes (
            id,
            name,
            grade_level,
            section
          )
        `,
        )
        .eq("teacher_id", user.id);

      // Calculate student counts for each class
      const classesWithCounts = await Promise.all(
        (teacherAssignments || []).map(async (assignment) => {
          const { data: enrollments } = await supabase
            .from("student_enrollments")
            .select("id")
            .eq("class_id", assignment.classes?.id)
            .eq("status", "active");

          return {
            id: assignment.classes?.id || "",
            name:
              assignment.classes?.name ||
              `Grade ${assignment.classes?.grade_level}`,
            section: assignment.classes?.section || "",
            studentCount: enrollments?.length || 0,
          };
        }),
      );

      setClasses(classesWithCounts);

      // Get announcements created by this teacher
      const { data: teacherAnnouncements } = await supabase
        .from("announcements")
        .select(
          `
          *,
          classes (
            name,
            grade_level,
            section
          )
        `,
        )
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });

      // Format announcements to match the interface
      const formattedAnnouncements: Announcement[] = (
        teacherAnnouncements || []
      ).map((announcement) => ({
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        priority:
          (announcement.priority as "low" | "medium" | "high") || "medium",
        type: "general", // Default type
        targetAudience: announcement.class_id ? "class" : "all",
        classes: announcement.classes
          ? [
              `${announcement.classes.name || `Grade ${announcement.classes.grade_level}`}${announcement.classes.section ? ` ${announcement.classes.section}` : ""}`,
            ]
          : [],
        publishedDate: announcement.created_at,
        isPublished:
          !!announcement.expires_at &&
          new Date(announcement.expires_at) > new Date(),
        isScheduled: false,
        views: Math.floor(Math.random() * 50) + 10, // Mock view count
        readBy: Math.floor(Math.random() * 30) + 5, // Mock read count
        totalRecipients:
          classesWithCounts.find((c) => c.id === announcement.class_id)
            ?.studentCount || 100,
        scheduledDate: announcement.expires_at || undefined,
      }));

      setAnnouncements(formattedAnnouncements);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load announcements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (
      formData.targetAudience === "class" &&
      formData.selectedClasses.length === 0
    ) {
      toast({
        title: "Validation Error",
        description: "Please select at least one class",
        variant: "destructive",
      });
      return;
    }

    try {
      setPublishing(true);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const selectedClassNames = formData.selectedClasses.map((classId) => {
        const cls = classes.find((c) => c.id === classId);
        return `${cls?.name} ${cls?.section}`;
      });

      const totalRecipients =
        formData.targetAudience === "all"
          ? classes.reduce((sum, cls) => sum + cls.studentCount, 0)
          : formData.selectedClasses.reduce((sum, classId) => {
              const cls = classes.find((c) => c.id === classId);
              return sum + (cls?.studentCount || 0);
            }, 0);

      const isScheduled =
        formData.isScheduled &&
        formData.scheduledDate &&
        formData.scheduledTime;
      const scheduledDateTime = isScheduled
        ? new Date(
            `${formData.scheduledDate}T${formData.scheduledTime}`,
          ).toISOString()
        : undefined;

      const newAnnouncement: Announcement = {
        id: `announcement-${Date.now()}`,
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        type: formData.type,
        targetAudience: formData.targetAudience,
        classes: selectedClassNames,
        scheduledDate: scheduledDateTime,
        publishedDate: isScheduled ? "" : new Date().toISOString(),
        isPublished: !isScheduled,
        isScheduled: !!isScheduled,
        views: 0,
        readBy: 0,
        totalRecipients,
      };

      setAnnouncements((prev) => [newAnnouncement, ...prev]);

      toast({
        title: "Success",
        description: isScheduled
          ? "Announcement scheduled successfully"
          : "Announcement published successfully",
      });

      // Reset form
      setFormData({
        title: "",
        content: "",
        priority: "medium",
        type: "general",
        targetAudience: "all",
        selectedClasses: [],
        isScheduled: false,
        scheduledDate: "",
        scheduledTime: "",
      });
    } catch (error) {
      console.error("Error publishing announcement:", error);
      toast({
        title: "Error",
        description: "Failed to publish announcement",
        variant: "destructive",
      });
    } finally {
      setPublishing(false);
    }
  };

  const deleteAnnouncement = async (announcementId: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) {
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setAnnouncements((prev) => prev.filter((a) => a.id !== announcementId));

      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "urgent":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "exam":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "assignment":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case "event":
        return <Calendar className="h-4 w-4 text-green-500" />;
      default:
        return <Megaphone className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (announcement: Announcement) => {
    if (announcement.isScheduled) {
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-200">
          Scheduled
        </Badge>
      );
    } else if (announcement.isPublished) {
      return (
        <Badge variant="default" className="bg-green-500">
          Published
        </Badge>
      );
    } else {
      return <Badge variant="secondary">Draft</Badge>;
    }
  };

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === "all" || announcement.type === filterType;

    let matchesStatus = true;
    if (filterStatus === "published") matchesStatus = announcement.isPublished;
    else if (filterStatus === "scheduled")
      matchesStatus = announcement.isScheduled;
    else if (filterStatus === "draft")
      matchesStatus = !announcement.isPublished && !announcement.isScheduled;

    return matchesSearch && matchesType && matchesStatus;
  });

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">
            Create and broadcast announcements to your students
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Megaphone className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Announcements
                </p>
                <p className="text-2xl font-bold">{announcements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">
                  {announcements.filter((a) => a.isPublished).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">
                  {announcements.filter((a) => a.isScheduled).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">
                  {announcements.reduce((sum, a) => sum + a.views, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create Announcement</TabsTrigger>
          <TabsTrigger value="manage">Manage Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Create New Announcement</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePublishAnnouncement} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Enter announcement title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(
                        value:
                          | "general"
                          | "assignment"
                          | "exam"
                          | "event"
                          | "urgent",
                      ) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="exam">Exam</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: "low" | "medium" | "high") =>
                        setFormData({ ...formData, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="audience">Target Audience</Label>
                    <Select
                      value={formData.targetAudience}
                      onValueChange={(value: "all" | "class" | "subject") =>
                        setFormData({
                          ...formData,
                          targetAudience: value,
                          selectedClasses: [],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Students</SelectItem>
                        <SelectItem value="class">Specific Classes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.targetAudience === "class" && (
                  <div className="space-y-2">
                    <Label>Select Classes *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {classes.map((cls) => (
                        <label
                          key={cls.id}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            checked={formData.selectedClasses.includes(cls.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  selectedClasses: [
                                    ...formData.selectedClasses,
                                    cls.id,
                                  ],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  selectedClasses:
                                    formData.selectedClasses.filter(
                                      (id) => id !== cls.id,
                                    ),
                                });
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">
                            {cls.name} {cls.section} ({cls.studentCount}{" "}
                            students)
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="Enter announcement content..."
                    rows={6}
                    required
                  />
                </div>

                {/* Scheduling Options */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.isScheduled}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isScheduled: checked })
                      }
                    />
                    <Label>Schedule for later</Label>
                  </div>

                  {formData.isScheduled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="scheduledDate">Date</Label>
                        <Input
                          id="scheduledDate"
                          type="date"
                          value={formData.scheduledDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              scheduledDate: e.target.value,
                            })
                          }
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="scheduledTime">Time</Label>
                        <Input
                          id="scheduledTime"
                          type="time"
                          value={formData.scheduledTime}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              scheduledTime: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={publishing}
                  className="w-full md:w-auto"
                >
                  {publishing
                    ? "Publishing..."
                    : formData.isScheduled
                      ? "Schedule Announcement"
                      : "Publish Announcement"}
                  <Send className="h-4 w-4 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search announcements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Announcements List */}
          <div className="space-y-4">
            {filteredAnnouncements.length > 0 ? (
              filteredAnnouncements.map((announcement) => (
                <Card
                  key={announcement.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0 pt-1">
                          {getTypeIcon(announcement.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold truncate">
                              {announcement.title}
                            </h3>
                            <Badge
                              className={getPriorityColor(
                                announcement.priority,
                              )}
                            >
                              {announcement.priority.toUpperCase()}
                            </Badge>
                            {getStatusBadge(announcement)}
                          </div>

                          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                            {announcement.content}
                          </p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3 text-blue-500" />
                              <span>
                                {announcement.targetAudience === "all"
                                  ? "All Students"
                                  : `${announcement.classes.length} classes`}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="h-3 w-3 text-green-500" />
                              <span>{announcement.views} views</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <CheckCircle2 className="h-3 w-3 text-purple-500" />
                              <span>
                                {announcement.readBy}/
                                {announcement.totalRecipients} read
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3 text-orange-500" />
                              <span>
                                {announcement.isScheduled &&
                                announcement.scheduledDate
                                  ? `Scheduled for ${format(new Date(announcement.scheduledDate), "MMM dd")}`
                                  : announcement.publishedDate
                                    ? formatDistance(
                                        new Date(announcement.publishedDate),
                                        new Date(),
                                        { addSuffix: true },
                                      )
                                    : "Draft"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>

                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>

                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteAnnouncement(announcement.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Announcements Found
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm ||
                    filterType !== "all" ||
                    filterStatus !== "all"
                      ? "No announcements match your current filters. Try adjusting your search criteria."
                      : "You haven't created any announcements yet. Create your first announcement to get started."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherAnnouncements;
