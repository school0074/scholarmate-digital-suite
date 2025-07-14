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
  MessageCircle,
  Send,
  Reply,
  Trash2,
  Star,
  Search,
  Filter,
  Plus,
  Eye,
  EyeOff,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { format, formatDistance } from "date-fns";

interface Message {
  id: string;
  subject: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  read: boolean;
  read_at: string | null;
  reply_to: string | null;
  created_at: string;
  sender_name?: string;
  recipient_name?: string;
}

interface Contact {
  id: string;
  full_name: string;
  role: string;
  avatar_url?: string;
}

const Messages = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "sent">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Compose form state
  const [composeData, setComposeData] = useState({
    recipient: "",
    subject: "",
    content: "",
    replyTo: null as string | null,
  });
  const [showCompose, setShowCompose] = useState(false);

  useEffect(() => {
    if (profile) {
      loadMessages();
      loadContacts();
    }
  }, [profile, filter]);

  const loadMessages = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("messages")
        .select(
          `
          id,
          subject,
          content,
          sender_id,
          recipient_id,
          read,
          read_at,
          reply_to,
          created_at,
          sender_id,
          recipient_id
        `,
        )
        .order("created_at", { ascending: false });

      // Apply filters
      if (filter === "unread") {
        query = query.eq("recipient_id", profile?.id).eq("read", false);
      } else if (filter === "sent") {
        query = query.eq("sender_id", profile?.id);
      } else {
        query = query.or(
          `sender_id.eq.${profile?.id},recipient_id.eq.${profile?.id}`,
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      const messagesData =
        data?.map((msg) => ({
          id: msg.id,
          subject: msg.subject || "No Subject",
          content: msg.content,
          sender_id: msg.sender_id || "",
          recipient_id: msg.recipient_id || "",
          read: msg.read || false,
          read_at: msg.read_at,
          reply_to: msg.reply_to,
          created_at: msg.created_at,
          sender_name: "User",
          recipient_name: "User",
        })) || [];

      setMessages(messagesData);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role, avatar_url")
        .neq("id", profile?.id)
        .order("full_name");

      if (error) throw error;

      setContacts(data || []);
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!composeData.recipient || !composeData.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in recipient and message content",
        variant: "destructive",
      });
      return;
    }

    try {
      setSending(true);

      const { error } = await supabase.from("messages").insert({
        sender_id: profile?.id,
        recipient_id: composeData.recipient,
        subject: composeData.subject || "No Subject",
        content: composeData.content,
        reply_to: composeData.replyTo,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Message sent successfully",
      });

      // Reset compose form
      setComposeData({
        recipient: "",
        subject: "",
        content: "",
        replyTo: null,
      });
      setShowCompose(false);

      // Reload messages
      await loadMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from("messages")
        .update({
          read: true,
          read_at: new Date().toISOString(),
        })
        .eq("id", messageId);

      if (error) throw error;

      // Update local state
      setMessages(
        messages.map((msg) =>
          msg.id === messageId
            ? { ...msg, read: true, read_at: new Date().toISOString() }
            : msg,
        ),
      );
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Message deleted successfully",
      });

      setMessages(messages.filter((msg) => msg.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    }
  };

  const replyToMessage = (message: Message) => {
    setComposeData({
      recipient: message.sender_id,
      subject: message.subject.startsWith("Re: ")
        ? message.subject
        : `Re: ${message.subject}`,
      content: `\n\n--- Original Message ---\nFrom: ${message.sender_name}\nDate: ${format(new Date(message.created_at), "PPP")}\n\n${message.content}`,
      replyTo: message.id,
    });
    setShowCompose(true);
  };

  const filteredMessages = messages.filter((message) => {
    if (searchTerm) {
      return (
        message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.sender_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  });

  const unreadCount = messages.filter(
    (msg) => msg.recipient_id === profile?.id && !msg.read,
  ).length;

  const isMessageFromMe = (message: Message) =>
    message.sender_id === profile?.id;

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
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with teachers, students, and parents
          </p>
        </div>
        <Button onClick={() => setShowCompose(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Compose Message
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Messages</p>
                <p className="text-2xl font-bold">{messages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Send className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Sent</p>
                <p className="text-2xl font-bold">
                  {messages.filter((msg) => isMessageFromMe(msg)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Contacts</p>
                <p className="text-2xl font-bold">{contacts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inbox" className="w-full">
        <TabsList>
          <TabsTrigger value="inbox">Inbox ({unreadCount})</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="compose">Compose</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
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
                <SelectItem value="all">All Messages</SelectItem>
                <SelectItem value="unread">Unread Only</SelectItem>
                <SelectItem value="sent">Sent Messages</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Messages List */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Messages</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-y-auto">
                    {filteredMessages.length > 0 ? (
                      filteredMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${
                            selectedMessage?.id === message.id ? "bg-muted" : ""
                          } ${
                            !message.read &&
                            message.recipient_id === profile?.id
                              ? "font-medium"
                              : ""
                          }`}
                          onClick={() => {
                            setSelectedMessage(message);
                            if (
                              !message.read &&
                              message.recipient_id === profile?.id
                            ) {
                              markAsRead(message.id);
                            }
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-sm">
                                  {isMessageFromMe(message)
                                    ? message.recipient_name
                                    : message.sender_name}
                                </p>
                                {!message.read &&
                                  message.recipient_id === profile?.id && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                {isMessageFromMe(message) && (
                                  <Badge variant="outline" className="text-xs">
                                    Sent
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 truncate">
                                {message.subject}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistance(
                                  new Date(message.created_at),
                                  new Date(),
                                  { addSuffix: true },
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          No messages found
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              {selectedMessage ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {selectedMessage.subject}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          From: {selectedMessage.sender_name} •{" "}
                          {format(new Date(selectedMessage.created_at), "PPP")}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => replyToMessage(selectedMessage)}
                        >
                          <Reply className="h-4 w-4 mr-2" />
                          Reply
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMessage(selectedMessage.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-wrap">
                        {selectedMessage.content}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Select a message to read
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sent Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {messages
                  .filter((msg) => isMessageFromMe(msg))
                  .map((message) => (
                    <div
                      key={message.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          To: {message.recipient_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {message.subject}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistance(
                            new Date(message.created_at),
                            new Date(),
                            { addSuffix: true },
                          )}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedMessage(message)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMessage(message.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="h-5 w-5" />
                <span>Compose New Message</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={sendMessage} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">To *</Label>
                  <Select
                    value={composeData.recipient}
                    onValueChange={(value) =>
                      setComposeData({ ...composeData, recipient: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.full_name} ({contact.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={composeData.subject}
                    onChange={(e) =>
                      setComposeData({
                        ...composeData,
                        subject: e.target.value,
                      })
                    }
                    placeholder="Enter message subject"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Message *</Label>
                  <Textarea
                    id="content"
                    value={composeData.content}
                    onChange={(e) =>
                      setComposeData({
                        ...composeData,
                        content: e.target.value,
                      })
                    }
                    placeholder="Type your message..."
                    rows={6}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={sending}
                  className="w-full md:w-auto"
                >
                  {sending ? "Sending..." : "Send Message"}
                  <Send className="h-4 w-4 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Messages;
