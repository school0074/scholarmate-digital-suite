import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  School,
  Bell,
  Shield,
  Database,
  Mail,
  Palette,
  Clock,
  Globe,
  Save,
  Upload,
  Download,
  RefreshCw,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // School Settings
  const [schoolSettings, setSchoolSettings] = useState({
    name: "ScholarMate Digital Academy",
    address: "123 Education Street, Learning City, State 12345",
    phone: "+1 (555) 123-4567",
    email: "admin@scholarmate.edu",
    website: "https://scholarmate.edu",
    description:
      "A modern digital school focused on innovative learning and technology integration.",
    logo: "",
    establishedYear: "2010",
    principalName: "Dr. Jane Smith",
    totalCapacity: "1000",
  });

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    autoBackup: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    sessionTimeout: "30",
    maxLoginAttempts: "5",
    passwordExpiry: "90",
    twoFactorAuth: false,
    allowGuestAccess: false,
  });

  // Academic Settings
  const [academicSettings, setAcademicSettings] = useState({
    currentSession: "2024-25",
    sessionStartDate: "2024-04-01",
    sessionEndDate: "2025-03-31",
    termSystem: "semester",
    gradingSystem: "percentage",
    maxAbsencePercentage: "25",
    homeworkSubmissionDeadline: "7",
    examResultPublishDelay: "3",
    feesDueDate: "10",
    lateFeePenalty: "50",
  });

  const handleSaveSettings = async (section: string, settings: any) => {
    try {
      setLoading(true);
      // Here you would typically save to your backend/database
      // For now, we'll just show a success message
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast({
        title: "Settings Saved",
        description: `${section} settings have been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to save ${section} settings.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackupDatabase = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate backup
      toast({
        title: "Backup Complete",
        description: "Database backup has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "Failed to create database backup.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">School Settings</h1>
          <p className="text-muted-foreground">
            Configure your school's system settings and preferences
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleBackupDatabase}
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-2" />
            Backup Data
          </Button>
          <Button onClick={() => handleSaveSettings("all", {})}>
            <Save className="h-4 w-4 mr-2" />
            Save All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="school" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="school">School Info</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* School Information Tab */}
        <TabsContent value="school">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <School className="h-5 w-5" />
                <span>School Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name</Label>
                  <Input
                    id="schoolName"
                    value={schoolSettings.name}
                    onChange={(e) =>
                      setSchoolSettings({
                        ...schoolSettings,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="principalName">Principal Name</Label>
                  <Input
                    id="principalName"
                    value={schoolSettings.principalName}
                    onChange={(e) =>
                      setSchoolSettings({
                        ...schoolSettings,
                        principalName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolEmail">School Email</Label>
                  <Input
                    id="schoolEmail"
                    type="email"
                    value={schoolSettings.email}
                    onChange={(e) =>
                      setSchoolSettings({
                        ...schoolSettings,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolPhone">School Phone</Label>
                  <Input
                    id="schoolPhone"
                    value={schoolSettings.phone}
                    onChange={(e) =>
                      setSchoolSettings({
                        ...schoolSettings,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={schoolSettings.website}
                    onChange={(e) =>
                      setSchoolSettings({
                        ...schoolSettings,
                        website: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="establishedYear">Established Year</Label>
                  <Input
                    id="establishedYear"
                    value={schoolSettings.establishedYear}
                    onChange={(e) =>
                      setSchoolSettings({
                        ...schoolSettings,
                        establishedYear: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">School Address</Label>
                <Textarea
                  id="address"
                  value={schoolSettings.address}
                  onChange={(e) =>
                    setSchoolSettings({
                      ...schoolSettings,
                      address: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">School Description</Label>
                <Textarea
                  id="description"
                  value={schoolSettings.description}
                  onChange={(e) =>
                    setSchoolSettings({
                      ...schoolSettings,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>School Logo</Label>
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center">
                    <School className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                </div>
              </div>

              <Button
                onClick={() => handleSaveSettings("school", schoolSettings)}
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                Save School Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Settings Tab */}
        <TabsContent value="academic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Academic Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currentSession">
                    Current Academic Session
                  </Label>
                  <Input
                    id="currentSession"
                    value={academicSettings.currentSession}
                    onChange={(e) =>
                      setAcademicSettings({
                        ...academicSettings,
                        currentSession: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="termSystem">Term System</Label>
                  <Select
                    value={academicSettings.termSystem}
                    onValueChange={(value) =>
                      setAcademicSettings({
                        ...academicSettings,
                        termSystem: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semester">Semester</SelectItem>
                      <SelectItem value="trimester">Trimester</SelectItem>
                      <SelectItem value="quarter">Quarter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionStart">Session Start Date</Label>
                  <Input
                    id="sessionStart"
                    type="date"
                    value={academicSettings.sessionStartDate}
                    onChange={(e) =>
                      setAcademicSettings({
                        ...academicSettings,
                        sessionStartDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionEnd">Session End Date</Label>
                  <Input
                    id="sessionEnd"
                    type="date"
                    value={academicSettings.sessionEndDate}
                    onChange={(e) =>
                      setAcademicSettings({
                        ...academicSettings,
                        sessionEndDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gradingSystem">Grading System</Label>
                  <Select
                    value={academicSettings.gradingSystem}
                    onValueChange={(value) =>
                      setAcademicSettings({
                        ...academicSettings,
                        gradingSystem: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">
                        Percentage (0-100%)
                      </SelectItem>
                      <SelectItem value="gpa">GPA (0.0-4.0)</SelectItem>
                      <SelectItem value="letter">
                        Letter Grades (A-F)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAbsence">Max Absence Percentage</Label>
                  <Input
                    id="maxAbsence"
                    type="number"
                    value={academicSettings.maxAbsencePercentage}
                    onChange={(e) =>
                      setAcademicSettings({
                        ...academicSettings,
                        maxAbsencePercentage: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homeworkDeadline">
                    Homework Submission Days
                  </Label>
                  <Input
                    id="homeworkDeadline"
                    type="number"
                    value={academicSettings.homeworkSubmissionDeadline}
                    onChange={(e) =>
                      setAcademicSettings({
                        ...academicSettings,
                        homeworkSubmissionDeadline: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="examDelay">
                    Exam Result Publish Delay (Days)
                  </Label>
                  <Input
                    id="examDelay"
                    type="number"
                    value={academicSettings.examResultPublishDelay}
                    onChange={(e) =>
                      setAcademicSettings({
                        ...academicSettings,
                        examResultPublishDelay: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <Button
                onClick={() => handleSaveSettings("academic", academicSettings)}
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Academic Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="system">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>System Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable maintenance mode for system updates
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) =>
                        setSystemSettings({
                          ...systemSettings,
                          maintenanceMode: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Backup</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically backup database daily
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.autoBackup}
                      onCheckedChange={(checked) =>
                        setSystemSettings({
                          ...systemSettings,
                          autoBackup: checked,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">
                      Session Timeout (minutes)
                    </Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={systemSettings.sessionTimeout}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          sessionTimeout: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxLogin">Max Login Attempts</Label>
                    <Input
                      id="maxLogin"
                      type="number"
                      value={systemSettings.maxLoginAttempts}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          maxLoginAttempts: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={() => handleSaveSettings("system", systemSettings)}
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save System Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setSystemSettings({
                        ...systemSettings,
                        emailNotifications: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via SMS
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.smsNotifications}
                    onCheckedChange={(checked) =>
                      setSystemSettings({
                        ...systemSettings,
                        smsNotifications: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send browser push notifications
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.pushNotifications}
                    onCheckedChange={(checked) =>
                      setSystemSettings({
                        ...systemSettings,
                        pushNotifications: checked,
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Settings Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security & Privacy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for admin accounts
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.twoFactorAuth}
                    onCheckedChange={(checked) =>
                      setSystemSettings({
                        ...systemSettings,
                        twoFactorAuth: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Guest Access</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow guest users to browse content
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.allowGuestAccess}
                    onCheckedChange={(checked) =>
                      setSystemSettings({
                        ...systemSettings,
                        allowGuestAccess: checked,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                  <Input
                    id="passwordExpiry"
                    type="number"
                    value={systemSettings.passwordExpiry}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        passwordExpiry: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Security Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset All Sessions
                  </Button>
                  <Button variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    Clear Cache
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Logs
                  </Button>
                </div>
              </div>

              <Button
                onClick={() => handleSaveSettings("security", systemSettings)}
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
