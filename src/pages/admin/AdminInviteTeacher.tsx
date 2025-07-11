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
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  UserPlus,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Copy,
  RefreshCw,
  Trash2,
  Eye,
  Users,
} from "lucide-react";
import { format, formatDistance } from "date-fns";

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Class {
  id: string;
  name: string;
  section: string;
}

interface Invitation {
  id: string;
  email: string;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
  invited_by: string;
}

const AdminInviteTeacher = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    subjectIds: [] as string[],
    classIds: [] as string[],
    message: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load subjects and classes
      const [subjectsResult, classesResult, invitationsResult] =
        await Promise.all([
          supabase.from("subjects").select("*").order("name"),
          supabase.from("classes").select("*").order("name"),
          supabase
            .from("teacher_invitations")
            .select("*")
            .order("created_at", { ascending: false }),
        ]);

      if (subjectsResult.error) throw subjectsResult.error;
      if (classesResult.error) throw classesResult.error;
      if (invitationsResult.error) throw invitationsResult.error;

      setSubjects(subjectsResult.data || []);
      setClasses(classesResult.data || []);
      setInvitations(invitationsResult.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateInviteToken = () => {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  };

  const sendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.fullName) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setSending(true);

      // Generate invitation token
      const token = generateInviteToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

      // Create invitation record
      const { error: inviteError } = await supabase
        .from("teacher_invitations")
        .insert({
          email: formData.email,
          token,
          expires_at: expiresAt.toISOString(),
          invited_by: profile?.id,
        });

      if (inviteError) throw inviteError;

      // In a real application, you would send an email here
      // For now, we'll just show the invitation link
      const inviteLink = `${window.location.origin}/auth?invite=${token}&type=teacher`;

      toast({
        title: "Invitation Sent",
        description: "Teacher invitation has been created successfully",
      });

      // Show invitation link in a modal or copy to clipboard
      navigator.clipboard.writeText(inviteLink);
      toast({
        title: "Link Copied",
        description: "Invitation link copied to clipboard",
      });

      // Reset form
      setFormData({
        email: "",
        fullName: "",
        subjectIds: [],
        classIds: [],
        message: "",
      });

      // Reload invitations
      await loadData();
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const copyInviteLink = async (token: string) => {
    const inviteLink = `${window.location.origin}/auth?invite=${token}&type=teacher`;
    await navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Link Copied",
      description: "Invitation link copied to clipboard",
    });
  };

  const deleteInvitation = async (invitationId: string) => {
    if (!confirm("Are you sure you want to delete this invitation?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("teacher_invitations")
        .delete()
        .eq("id", invitationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invitation deleted successfully",
      });

      await loadData();
    } catch (error) {
      console.error("Error deleting invitation:", error);
      toast({
        title: "Error",
        description: "Failed to delete invitation",
        variant: "destructive",
      });
    }
  };

  const getInvitationStatus = (invitation: Invitation) => {
    if (invitation.used) {
      return <Badge className="bg-green-500">Accepted</Badge>;
    }

    const isExpired = new Date(invitation.expires_at) < new Date();
    if (isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }

    return <Badge variant="secondary">Pending</Badge>;
  };

  const getStatusIcon = (invitation: Invitation) => {
    if (invitation.used) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }

    const isExpired = new Date(invitation.expires_at) < new Date();
    if (isExpired) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }

    return <Clock className="h-4 w-4 text-orange-500" />;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invite Teachers</h1>
          <p className="text-muted-foreground">
            Send invitations to new teachers to join your school
          </p>
        </div>
        <Button onClick={loadData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Invitation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>Send New Invitation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={sendInvitation} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="teacher@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  placeholder="Enter teacher's full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subjects">Subjects (Optional)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subjects to assign" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Subjects can be assigned later after the teacher joins
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="classes">Classes (Optional)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select classes to assign" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} {cls.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Classes can be assigned later after the teacher joins
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Welcome Message (Optional)</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Write a welcome message for the new teacher..."
                  rows={3}
                />
              </div>

              <Button type="submit" disabled={sending} className="w-full">
                {sending ? "Sending..." : "Send Invitation"}
                <Send className="h-4 w-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invitation Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Sent
                </span>
                <span className="font-medium">{invitations.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Accepted</span>
                <span className="font-medium text-green-600">
                  {invitations.filter((inv) => inv.used).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="font-medium text-orange-600">
                  {
                    invitations.filter(
                      (inv) =>
                        !inv.used && new Date(inv.expires_at) > new Date(),
                    ).length
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Expired</span>
                <span className="font-medium text-red-600">
                  {
                    invitations.filter(
                      (inv) =>
                        !inv.used && new Date(inv.expires_at) < new Date(),
                    ).length
                  }
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                  1
                </div>
                <p>Enter the teacher's email and details</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                  2
                </div>
                <p>
                  An invitation link is generated and copied to your clipboard
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                  3
                </div>
                <p>Share the link with the teacher via email or messaging</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                  4
                </div>
                <p>Teacher clicks the link and creates their account</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invitations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Sent Invitations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invitations.length > 0 ? (
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(invitation)}
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>
                          Sent{" "}
                          {formatDistance(
                            new Date(invitation.created_at),
                            new Date(),
                            { addSuffix: true },
                          )}
                        </span>
                        <span>
                          Expires{" "}
                          {format(
                            new Date(invitation.expires_at),
                            "MMM dd, yyyy",
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {getInvitationStatus(invitation)}

                    {!invitation.used &&
                      new Date(invitation.expires_at) > new Date() && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyInviteLink(invitation.token)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </Button>
                      )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteInvitation(invitation.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Invitations Sent</h3>
              <p className="text-muted-foreground">
                You haven't sent any teacher invitations yet. Use the form above
                to invite your first teacher.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInviteTeacher;
