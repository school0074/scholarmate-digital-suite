import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Megaphone,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Users,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  Send,
  Filter,
  Search,
} from "lucide-react";
import { format, formatDistance, isAfter, isBefore } from "date-fns";

interface Announcement {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name?: string;
  target_role: "student" | "teacher" | "admin" | null;
  class_id: string | null;
  class_name?: string;
  priority: "low" | "normal" | "high" | "urgent";
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Class {
  id: string;
  name: string;
  section: string;
}

const Announcements = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "expired">("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    targetRole: "all" as "all" | "student" | "teacher" | "admin",
    classId: "",
    priority: "normal" as "low" | "normal" | "high" | "urgent",
    expiresAt: "",
  });

  useEffect(() => {
    if (profile) {
      loadAnnouncements();
      loadClasses();
    }
  }, [profile, filter]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("announcements")
        .select(
          `
          id,
          title,
          content,
          author_id,
          target_role,
          class_id,
          priority,
          expires_at,
          created_at,
          updated_at,
          profiles!author_id(full_name),
          classes(name, section)
        `,
        )
        .order("created_at", { ascending: false });

      // If not admin, only show announcements relevant to user
      if (profile?.role !== "admin") {
        query = query.or(`target_role.is.null,target_role.eq.${profile?.role}`);
      }

      const { data, error } = await query;

      if (error) throw error;

      let announcementsData =
        data?.map((ann) => ({
          id: ann.id,
          title: ann.title,
          content: ann.content,
          author_id: ann.author_id || "",
          author_name: (ann.profiles as any)?.full_name || "Unknown",
          target_role: ann.target_role,
          class_id: ann.class_id,
          class_name: ann.classes
            ? `${ann.classes.name} ${ann.classes.section}`
            : null,
          priority: (ann.priority as "low" | "normal" | "high" | "urgent") || "normal",
          expires_at: ann.expires_at,
          created_at: ann.created_at,
          updated_at: ann.updated_at,
        })) || [];

      // Apply filters
      if (filter === "active") {
        announcementsData = announcementsData.filter(
          (ann) =>
            !ann.expires_at || isAfter(new Date(ann.expires_at), new Date()),
        );
      } else if (filter === "expired") {
        announcementsData = announcementsData.filter(
          (ann) =>
            ann.expires_at && isBefore(new Date(ann.expires_at), new Date()),
        );
      }

      setAnnouncements(announcementsData);
    } catch (error) {
      console.error("Error loading announcements:", error);
      toast({
        title: "Error",
        description: "Failed to load announcements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const { data, error } = await supabase
        .from("classes")
        .select("id, name, section")
        .order("name");

      if (error) throw error;

      setClasses(data || []);
    } catch (error) {
      console.error("Error loading classes:", error);
    }
  };

  const createAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);

      const { error } = await supabase.from("announcements").insert({
        title: formData.title,
        content: formData.content,
        author_id: profile?.id,
        target_role: formData.targetRole === "all" ? null : formData.targetRole,
        class_id: formData.classId || null,
        priority: formData.priority,
        expires_at: formData.expiresAt || null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Announcement created successfully",
      });

      // Reset form
      setFormData({
        title: "",
        content: "",
        targetRole: "all",
        classId: "",
        priority: "normal",
        expiresAt: "",
      });
      setShowCreate(false);

      // Reload announcements
      await loadAnnouncements();
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast({
        title: "Error",
        description: "Failed to create announcement",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const deleteAnnouncement = async (announcementId: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", announcementId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });

      setAnnouncements(
        announcements.filter((ann) => ann.id !== announcementId),
      );
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-red-500">Urgent</Badge>;
      case "high":
        return <Badge className="bg-orange-500">High</Badge>;
      case "normal":
        return <Badge variant="default">Normal</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "normal":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "low":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const isExpired = (announcement: Announcement) => {
    return (
      announcement.expires_at &&
      isBefore(new Date(announcement.expires_at), new Date())
    );
  };

  const canManageAnnouncements =
    profile?.role === "admin" || profile?.role === "teacher";

  const filteredAnnouncements = announcements.filter((announcement) => {
    if (searchTerm) {
      return (
        announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.author_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }
    return true;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">
            Stay updated with school news and important information
          </p>
        </div>
        {canManageAnnouncements && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Announcement
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Megaphone className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
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
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">
                  {announcements.filter((ann) => !isExpired(ann)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Urgent</p>
                <p className="text-2xl font-bold">
                  {
                    announcements.filter(
                      (ann) => ann.priority === "urgent" && !isExpired(ann),
                    ).length
                  }
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
                <p className="text-sm text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold">
                  {announcements.filter((ann) => isExpired(ann)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="view" className="w-full">
        <TabsList>
          <TabsTrigger value="view">View Announcements</TabsTrigger>
          {canManageAnnouncements && (
            <TabsTrigger value="create">Create Announcement</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="view" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search announcements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filter}
              onValueChange={(value: any) => setFilter(value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Announcements</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="expired">Expired Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Announcements List */}
          <div className="space-y-4">
            {filteredAnnouncements.length > 0 ? (
              filteredAnnouncements.map((announcement) => (
                <Card
                  key={announcement.id}
                  className={`${isExpired(announcement) ? "opacity-60" : ""} ${
                    announcement.priority === "urgent"
                      ? "border-red-200 bg-red-50 dark:bg-red-950/20"
                      : announcement.priority === "high"
                        ? "border-orange-200 bg-orange-50 dark:bg-orange-950/20"
                        : "border-l-4 border-l-blue-500"
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          {getPriorityIcon(announcement.priority)}
                          <h3 className="text-xl font-semibold">
                            {announcement.title}
                          </h3>
                          {getPriorityBadge(announcement.priority)}
                          {isExpired(announcement) && (
                            <Badge
                              variant="outline"
                              className="text-red-600 border-red-200"
                            >
                              Expired
                            </Badge>
                          )}
                        </div>

                        <p className="text-muted-foreground mb-4 whitespace-pre-wrap">
                          {announcement.content}
                        </p>

                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>
                              {announcement.target_role
                                ? `${announcement.target_role.charAt(0).toUpperCase() + announcement.target_role.slice(1)}s`
                                : "Everyone"}
                              {announcement.class_name &&
                                ` - ${announcement.class_name}`}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatDistance(
                                new Date(announcement.created_at),
                                new Date(),
                                { addSuffix: true },
                              )}
                            </span>
                          </div>
                          {announcement.expires_at && (
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>
                                Expires{" "}
                                {format(
                                  new Date(announcement.expires_at),
                                  "MMM dd, yyyy",
                                )}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="mt-2 text-xs text-muted-foreground">
                          By {announcement.author_name}
                        </div>
                      </div>

                      {canManageAnnouncements &&
                        announcement.author_id === profile?.id && (
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                deleteAnnouncement(announcement.id)
                              }
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
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
                    {searchTerm
                      ? "No announcements match your search criteria."
                      : "No announcements have been posted yet."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {canManageAnnouncements && (
          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Create New Announcement</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={createAnnouncement} className="space-y-4">
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
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value: any) =>
                          setFormData({ ...formData, priority: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="normal">
                            Normal Priority
                          </SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="targetRole">Target Audience</Label>
                      <Select
                        value={formData.targetRole}
                        onValueChange={(value: any) =>
                          setFormData({ ...formData, targetRole: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Everyone</SelectItem>
                          <SelectItem value="student">Students Only</SelectItem>
                          <SelectItem value="teacher">Teachers Only</SelectItem>
                          <SelectItem value="admin">Admins Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="class">Specific Class (Optional)</Label>
                      <Select
                        value={formData.classId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, classId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name} {cls.section}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                      <Input
                        id="expiresAt"
                        type="datetime-local"
                        value={formData.expiresAt}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            expiresAt: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

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

                  <Button
                    type="submit"
                    disabled={creating}
                    className="w-full md:w-auto"
                  >
                    {creating ? "Creating..." : "Create Announcement"}
                    <Send className="h-4 w-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Announcements;
