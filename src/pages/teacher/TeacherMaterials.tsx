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
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  File,
  Video,
  Link,
  BookOpen,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Users,
  Calendar,
  Share2,
  FileText,
  Play,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  type: "pdf" | "video" | "link" | "document";
  url: string;
  fileName?: string;
  fileSize?: string;
  subject: string;
  classes: string[];
  uploadedDate: string;
  downloads: number;
  views: number;
  isPublic: boolean;
}

interface Class {
  id: string;
  name: string;
  section: string;
  studentCount: number;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

const TeacherMaterials = () => {
  const { toast } = useToast();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSubject, setFilterSubject] = useState<string>("all");

  // Form state for uploading materials
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "pdf" as "pdf" | "video" | "link" | "document",
    url: "",
    subjectId: "",
    selectedClasses: [] as string[],
  });

  // Mock teacher profile data
  const mockProfile = {
    id: "teacher-123",
    full_name: "Prof. Sarah Johnson",
  };

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = async () => {
    try {
      setLoading(true);

      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock classes data
      const mockClasses: Class[] = [
        { id: "1", name: "Grade 10", section: "A", studentCount: 32 },
        { id: "2", name: "Grade 10", section: "B", studentCount: 28 },
        { id: "3", name: "Grade 9", section: "A", studentCount: 30 },
      ];

      // Mock subjects data
      const mockSubjects: Subject[] = [
        { id: "1", name: "Mathematics", code: "MATH101" },
        { id: "2", name: "Physics", code: "PHY101" },
        { id: "3", name: "Science", code: "SCI101" },
      ];

      // Mock study materials
      const mockMaterials: StudyMaterial[] = [
        {
          id: "1",
          title: "Quadratic Equations - Complete Guide",
          description:
            "Comprehensive guide covering all aspects of quadratic equations with examples and practice problems.",
          type: "pdf",
          url: "/materials/quadratic-equations.pdf",
          fileName: "quadratic-equations.pdf",
          fileSize: "2.4 MB",
          subject: "Mathematics",
          classes: ["Grade 10 A", "Grade 10 B"],
          uploadedDate: "2024-12-05T10:30:00Z",
          downloads: 45,
          views: 67,
          isPublic: true,
        },
        {
          id: "2",
          title: "Newton's Laws of Motion - Video Lecture",
          description:
            "Interactive video explaining Newton's three laws with real-world examples and animations.",
          type: "video",
          url: "https://youtube.com/watch?v=example",
          subject: "Physics",
          classes: ["Grade 10 A", "Grade 9 A"],
          uploadedDate: "2024-12-03T14:15:00Z",
          downloads: 0,
          views: 89,
          isPublic: true,
        },
        {
          id: "3",
          title: "Khan Academy - Algebra Basics",
          description:
            "External link to Khan Academy's comprehensive algebra course for additional practice.",
          type: "link",
          url: "https://khanacademy.org/algebra",
          subject: "Mathematics",
          classes: ["Grade 9 A"],
          uploadedDate: "2024-12-01T09:00:00Z",
          downloads: 0,
          views: 34,
          isPublic: false,
        },
        {
          id: "4",
          title: "Scientific Method Worksheet",
          description:
            "Practice worksheet for understanding the steps of scientific method with examples.",
          type: "document",
          url: "/materials/scientific-method.docx",
          fileName: "scientific-method.docx",
          fileSize: "1.1 MB",
          subject: "Science",
          classes: ["Grade 9 A"],
          uploadedDate: "2024-11-28T11:45:00Z",
          downloads: 23,
          views: 41,
          isPublic: true,
        },
        {
          id: "5",
          title: "Physics Lab Safety Rules",
          description:
            "Important safety guidelines and procedures for physics laboratory experiments.",
          type: "pdf",
          url: "/materials/lab-safety.pdf",
          fileName: "lab-safety.pdf",
          fileSize: "876 KB",
          subject: "Physics",
          classes: ["Grade 10 A", "Grade 10 B"],
          uploadedDate: "2024-11-25T16:20:00Z",
          downloads: 32,
          views: 55,
          isPublic: true,
        },
      ];

      setClasses(mockClasses);
      setSubjects(mockSubjects);
      setMaterials(mockMaterials);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load study materials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.subjectId ||
      formData.selectedClasses.length === 0
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const selectedSubject = subjects.find((s) => s.id === formData.subjectId);
      const selectedClassNames = formData.selectedClasses.map((classId) => {
        const cls = classes.find((c) => c.id === classId);
        return `${cls?.name} ${cls?.section}`;
      });

      const newMaterial: StudyMaterial = {
        id: `material-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        url:
          formData.url ||
          `/materials/${formData.title.toLowerCase().replace(/\s+/g, "-")}.${formData.type}`,
        fileName:
          formData.type !== "link"
            ? `${formData.title.toLowerCase().replace(/\s+/g, "-")}.${formData.type}`
            : undefined,
        fileSize: formData.type !== "link" ? "1.2 MB" : undefined,
        subject: selectedSubject?.name || "",
        classes: selectedClassNames,
        uploadedDate: new Date().toISOString(),
        downloads: 0,
        views: 0,
        isPublic: true,
      };

      setMaterials((prev) => [newMaterial, ...prev]);

      toast({
        title: "Success",
        description: "Study material uploaded successfully",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        type: "pdf",
        url: "",
        subjectId: "",
        selectedClasses: [],
      });
    } catch (error) {
      console.error("Error uploading material:", error);
      toast({
        title: "Error",
        description: "Failed to upload study material",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteMaterial = async (materialId: string) => {
    if (!confirm("Are you sure you want to delete this material?")) {
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setMaterials((prev) => prev.filter((m) => m.id !== materialId));

      toast({
        title: "Success",
        description: "Study material deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete material",
        variant: "destructive",
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "pdf":
      case "document":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "video":
        return <Video className="h-5 w-5 text-blue-500" />;
      case "link":
        return <Link className="h-5 w-5 text-green-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "pdf":
      case "document":
        return "bg-red-100 text-red-800 border-red-200";
      case "video":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "link":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || material.type === filterType;
    const matchesSubject =
      filterSubject === "all" ||
      material.subject === subjects.find((s) => s.id === filterSubject)?.name;

    return matchesSearch && matchesType && matchesSubject;
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
          <h1 className="text-3xl font-bold">Study Materials</h1>
          <p className="text-muted-foreground">
            Upload and manage learning resources for your students
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Materials</p>
                <p className="text-2xl font-bold">{materials.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Downloads</p>
                <p className="text-2xl font-bold">
                  {materials.reduce((sum, m) => sum + m.downloads, 0)}
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
                  {materials.reduce((sum, m) => sum + m.views, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Classes Shared</p>
                <p className="text-2xl font-bold">{classes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Material</TabsTrigger>
          <TabsTrigger value="manage">Manage Materials</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Upload Study Material</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUploadMaterial} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Enter material title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Material Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(
                        value: "pdf" | "video" | "link" | "document",
                      ) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Document</SelectItem>
                        <SelectItem value="document">Word Document</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="link">External Link</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Select
                      value={formData.subjectId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, subjectId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name} ({subject.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Share with Classes *</Label>
                    <div className="grid grid-cols-1 gap-2">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter material description..."
                    rows={3}
                  />
                </div>

                {formData.type === "link" && (
                  <div className="space-y-2">
                    <Label htmlFor="url">URL *</Label>
                    <Input
                      id="url"
                      type="url"
                      value={formData.url}
                      onChange={(e) =>
                        setFormData({ ...formData, url: e.target.value })
                      }
                      placeholder="https://example.com"
                      required
                    />
                  </div>
                )}

                {formData.type !== "link" && (
                  <div className="space-y-2">
                    <Label htmlFor="file">Upload File *</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground mb-2">
                        Drag and drop your file here or click to browse
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Supported formats: PDF, DOC, DOCX, MP4, AVI, MOV (Max
                        100MB)
                      </p>
                      <Button type="button" variant="outline" className="mt-4">
                        Choose File
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={uploading}
                  className="w-full md:w-auto"
                >
                  {uploading ? "Uploading..." : "Upload Material"}
                  <Upload className="h-4 w-4 ml-2" />
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
                    placeholder="Search materials..."
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
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="link">Link</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterSubject} onValueChange={setFilterSubject}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Materials List */}
          <div className="space-y-4">
            {filteredMaterials.length > 0 ? (
              filteredMaterials.map((material) => (
                <Card
                  key={material.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0">
                          {getTypeIcon(material.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold truncate">
                              {material.title}
                            </h3>
                            <Badge className={getTypeColor(material.type)}>
                              {material.type.toUpperCase()}
                            </Badge>
                            {material.isPublic && (
                              <Badge
                                variant="outline"
                                className="text-green-600 border-green-200"
                              >
                                Public
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {material.description}
                          </p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <BookOpen className="h-3 w-3 text-blue-500" />
                              <span>{material.subject}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3 text-green-500" />
                              <span>{material.classes.length} classes</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Download className="h-3 w-3 text-purple-500" />
                              <span>{material.downloads} downloads</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="h-3 w-3 text-orange-500" />
                              <span>{material.views} views</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 mt-3 text-xs text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {format(
                                  new Date(material.uploadedDate),
                                  "MMM dd, yyyy",
                                )}
                              </span>
                            </div>
                            {material.fileSize && (
                              <span>Size: {material.fileSize}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {material.type === "link" ? (
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={material.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open
                            </a>
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        )}

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
                          onClick={() => deleteMaterial(material.id)}
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
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Materials Found
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm ||
                    filterType !== "all" ||
                    filterSubject !== "all"
                      ? "No materials match your current filters. Try adjusting your search criteria."
                      : "You haven't uploaded any study materials yet. Upload your first material to get started."}
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

export default TeacherMaterials;
