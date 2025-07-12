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
  Mail,
  MailOpen,
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

const StudentMessages = () => {
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

      let query = supabase.from("messages").select(`
          id,
          subject,
          content,
          sender_id,
          recipient_id,
          read,
          read_at,
          reply_to,
          created_at,
          sender:profiles!messages_sender_id_fkey(id, full_name),
          recipient:profiles!messages_recipient_id_fkey(id, full_name)
        `);

      // Filter based on current filter setting
      if (filter === "unread") {
        query = query.eq("recipient_id", profile?.id).eq("read", false);
      } else if (filter === "sent") {
        query = query.eq("sender_id", profile?.id);
      } else {
        // All messages where user is sender or recipient
        query = query.or(
          `sender_id.eq.${profile?.id},recipient_id.eq.${profile?.id}`,
        );
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        console.error("Error loading messages:", error);
        throw error;
      }

      const messagesData =
        data?.map((msg) => ({
          id: msg.id,
          subject: msg.subject,
          content: msg.content,
          sender_id: msg.sender_id,
          recipient_id: msg.recipient_id,
          read: msg.read,
          read_at: msg.read_at,
          reply_to: msg.reply_to,
          created_at: msg.created_at,
          sender_name: msg.sender?.full_name,
          recipient_name: msg.recipient?.full_name,
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
      // Get teachers and admin users that student can message
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role, avatar_url")
        .in("role", ["teacher", "admin"])
        .eq("is_approved", true);

      if (error) {
        console.error("Error loading contacts:", error);
        return;
      }

      setContacts(data || []);
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  };

  const sendMessage = async () => {
    if (
      !composeData.recipient ||
      !composeData.subject ||
      !composeData.content
    ) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setSending(true);

      const { error } = await supabase.from("messages").insert({
        sender_id: profile?.id,
        recipient_id: composeData.recipient,
        subject: composeData.subject,
        content: composeData.content,
        reply_to: composeData.replyTo,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Message sent successfully",
      });

      // Reset form and reload messages
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
        .eq("id", messageId)
        .eq("recipient_id", profile?.id);

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
    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId)
        .eq("recipient_id", profile?.id);

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
      content: `\n\n--- Original Message ---\nFrom: ${message.sender_name}\nDate: ${format(new Date(message.created_at), "PPpp")}\nSubject: ${message.subject}\n\n${message.content}`,
      replyTo: message.id,
    });
    setShowCompose(true);
  };

  const isMessageFromMe = (message: Message) => {
    return message.sender_id === profile?.id;
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
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with your teachers and school administration
          </p>
        </div>
        <Button onClick={() => setShowCompose(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* Stats Overview */}
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
              <Mail className="h-5 w-5 text-orange-500" />
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
              <Send className="h-5 w-5 text-green-500" />
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
              <User className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Contacts</p>
                <p className="text-2xl font-bold">{contacts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inbox" className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="inbox" onClick={() => setFilter("all")}>
              Inbox
            </TabsTrigger>
            <TabsTrigger value="unread" onClick={() => setFilter("unread")}>
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="sent" onClick={() => setFilter("sent")}>
              Sent
            </TabsTrigger>
            {showCompose && <TabsTrigger value="compose">Compose</TabsTrigger>}
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </div>

        <TabsContent value="inbox" className="space-y-4">
          <MessagesList
            messages={filteredMessages}
            selectedMessage={selectedMessage}
            setSelectedMessage={setSelectedMessage}
            markAsRead={markAsRead}
            deleteMessage={deleteMessage}
            replyToMessage={replyToMessage}
            isMessageFromMe={isMessageFromMe}
            profile={profile}
          />
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          <MessagesList
            messages={filteredMessages.filter(
              (msg) => msg.recipient_id === profile?.id && !msg.read,
            )}
            selectedMessage={selectedMessage}
            setSelectedMessage={setSelectedMessage}
            markAsRead={markAsRead}
            deleteMessage={deleteMessage}
            replyToMessage={replyToMessage}
            isMessageFromMe={isMessageFromMe}
            profile={profile}
          />
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          <MessagesList
            messages={filteredMessages.filter((msg) => isMessageFromMe(msg))}
            selectedMessage={selectedMessage}
            setSelectedMessage={setSelectedMessage}
            markAsRead={markAsRead}
            deleteMessage={deleteMessage}
            replyToMessage={replyToMessage}
            isMessageFromMe={isMessageFromMe}
            profile={profile}
          />
        </TabsContent>

        {showCompose && (
          <TabsContent value="compose" className="space-y-4">
            <ComposeMessage
              composeData={composeData}
              setComposeData={setComposeData}
              contacts={contacts}
              sendMessage={sendMessage}
              sending={sending}
              setShowCompose={setShowCompose}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

interface MessagesListProps {
  messages: Message[];
  selectedMessage: Message | null;
  setSelectedMessage: (message: Message | null) => void;
  markAsRead: (messageId: string) => void;
  deleteMessage: (messageId: string) => void;
  replyToMessage: (message: Message) => void;
  isMessageFromMe: (message: Message) => boolean;
  profile: any;
}

const MessagesList = ({
  messages,
  selectedMessage,
  setSelectedMessage,
  markAsRead,
  deleteMessage,
  replyToMessage,
  isMessageFromMe,
  profile,
}: MessagesListProps) => {
  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    if (message.recipient_id === profile?.id && !message.read) {
      markAsRead(message.id);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Messages List */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="text-base">Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors mb-2 ${
                    selectedMessage?.id === message.id ? "bg-muted" : ""
                  } ${
                    message.recipient_id === profile?.id && !message.read
                      ? "border-blue-200 bg-blue-50/50 dark:bg-blue-950/20"
                      : ""
                  }`}
                  onClick={() => handleMessageClick(message)}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      {isMessageFromMe(message) ? (
                        <Send className="h-4 w-4 text-green-500" />
                      ) : message.read ? (
                        <MailOpen className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Mail className="h-4 w-4 text-blue-500" />
                      )}
                      <p className="font-medium text-sm truncate">
                        {isMessageFromMe(message)
                          ? `To: ${message.recipient_name}`
                          : `From: ${message.sender_name}`}
                      </p>
                    </div>
                    <Badge
                      variant={
                        message.recipient_id === profile?.id && !message.read
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {message.recipient_id === profile?.id && !message.read
                        ? "New"
                        : "Read"}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium mb-1 truncate">
                    {message.subject}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {message.content}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistance(new Date(message.created_at), new Date(), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No messages found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Message Details */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedMessage ? "Message Details" : "Select a Message"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedMessage ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <h3 className="font-semibold">{selectedMessage.subject}</h3>
                  <p className="text-sm text-muted-foreground">
                    {isMessageFromMe(selectedMessage)
                      ? `To: ${selectedMessage.recipient_name}`
                      : `From: ${selectedMessage.sender_name}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(selectedMessage.created_at), "PPpp")}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {!isMessageFromMe(selectedMessage) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => replyToMessage(selectedMessage)}
                    >
                      <Reply className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                  )}
                  {selectedMessage.recipient_id === profile?.id && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMessage(selectedMessage.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Select a message to view details
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface ComposeMessageProps {
  composeData: {
    recipient: string;
    subject: string;
    content: string;
    replyTo: string | null;
  };
  setComposeData: (data: any) => void;
  contacts: Contact[];
  sendMessage: () => void;
  sending: boolean;
  setShowCompose: (show: boolean) => void;
}

const ComposeMessage = ({
  composeData,
  setComposeData,
  contacts,
  sendMessage,
  sending,
  setShowCompose,
}: ComposeMessageProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compose New Message</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="recipient">To</Label>
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

        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={composeData.subject}
            onChange={(e) =>
              setComposeData({ ...composeData, subject: e.target.value })
            }
            placeholder="Enter message subject"
          />
        </div>

        <div>
          <Label htmlFor="content">Message</Label>
          <Textarea
            id="content"
            value={composeData.content}
            onChange={(e) =>
              setComposeData({ ...composeData, content: e.target.value })
            }
            placeholder="Type your message here..."
            rows={8}
          />
        </div>

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setShowCompose(false)}>
            Cancel
          </Button>
          <Button onClick={sendMessage} disabled={sending}>
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send Message
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentMessages;
