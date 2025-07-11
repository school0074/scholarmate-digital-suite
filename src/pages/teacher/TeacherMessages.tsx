import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  MessageCircle,
  Send,
  Search,
  Users,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Filter,
  Plus,
  Star,
  Archive,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { format, formatDistance, isToday, isYesterday } from "date-fns";

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
  avatar?: string;
  parentName?: string;
  parentPhone?: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  receiverName: string;
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isImportant: boolean;
  type: "student" | "parent" | "announcement";
  conversationId: string;
  attachments?: string[];
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantType: "student" | "parent";
  className: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isImportant: boolean;
  messages: Message[];
}

const TeacherMessages = () => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // New message form state
  const [newMessageForm, setNewMessageForm] = useState({
    recipient: "",
    subject: "",
    content: "",
    isImportant: false,
  });

  // Mock teacher profile data
  const mockProfile = {
    id: "teacher-123",
    full_name: "Prof. Sarah Johnson",
  };

  useEffect(() => {
    loadMockData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation, conversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMockData = async () => {
    try {
      setLoading(true);

      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock students data
      const mockStudents: Student[] = [
        {
          id: "student-1",
          name: "Emma Wilson",
          rollNumber: "GR10A001",
          className: "Grade 10 A",
          parentName: "David Wilson",
          parentPhone: "+1-555-0123",
        },
        {
          id: "student-2",
          name: "Michael Brown",
          rollNumber: "GR10A002",
          className: "Grade 10 A",
          parentName: "Sarah Brown",
          parentPhone: "+1-555-0124",
        },
        {
          id: "student-3",
          name: "Lisa Chen",
          rollNumber: "GR10B003",
          className: "Grade 10 B",
          parentName: "James Chen",
          parentPhone: "+1-555-0125",
        },
        {
          id: "student-4",
          name: "David Smith",
          rollNumber: "GR9A004",
          className: "Grade 9 A",
          parentName: "Mary Smith",
          parentPhone: "+1-555-0126",
        },
      ];

      // Mock conversations
      const mockConversations: Conversation[] = [
        {
          id: "conv-1",
          participantId: "student-1",
          participantName: "Emma Wilson",
          participantType: "student",
          className: "Grade 10 A",
          lastMessage: "Thank you for the extra help with quadratic equations!",
          lastMessageTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          unreadCount: 0,
          isImportant: false,
          messages: [
            {
              id: "msg-1",
              senderId: "student-1",
              receiverId: mockProfile.id,
              senderName: "Emma Wilson",
              receiverName: mockProfile.full_name,
              subject: "Help with Math Homework",
              content:
                "Hi Prof. Johnson, I'm having trouble understanding the quadratic formula. Could you explain it again?",
              timestamp: new Date(
                Date.now() - 2 * 60 * 60 * 1000,
              ).toISOString(),
              isRead: true,
              isImportant: false,
              type: "student",
              conversationId: "conv-1",
            },
            {
              id: "msg-2",
              senderId: mockProfile.id,
              receiverId: "student-1",
              senderName: mockProfile.full_name,
              receiverName: "Emma Wilson",
              subject: "Re: Help with Math Homework",
              content:
                "Of course! The quadratic formula is x = (-b ± √(b²-4ac)) / 2a. Let me break it down step by step...",
              timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
              isRead: true,
              isImportant: false,
              type: "student",
              conversationId: "conv-1",
            },
            {
              id: "msg-3",
              senderId: "student-1",
              receiverId: mockProfile.id,
              senderName: "Emma Wilson",
              receiverName: mockProfile.full_name,
              subject: "Re: Help with Math Homework",
              content: "Thank you for the extra help with quadratic equations!",
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              isRead: true,
              isImportant: false,
              type: "student",
              conversationId: "conv-1",
            },
          ],
        },
        {
          id: "conv-2",
          participantId: "parent-2",
          participantName: "Sarah Brown (Parent)",
          participantType: "parent",
          className: "Grade 10 A",
          lastMessage:
            "Thank you for keeping us informed about Michael's progress.",
          lastMessageTime: new Date(
            Date.now() - 24 * 60 * 60 * 1000,
          ).toISOString(),
          unreadCount: 1,
          isImportant: true,
          messages: [
            {
              id: "msg-4",
              senderId: mockProfile.id,
              receiverId: "parent-2",
              senderName: mockProfile.full_name,
              receiverName: "Sarah Brown",
              subject: "Michael's Academic Progress",
              content:
                "Hello Mrs. Brown, I wanted to update you on Michael's recent improvement in Physics. His lab reports have been excellent.",
              timestamp: new Date(
                Date.now() - 25 * 60 * 60 * 1000,
              ).toISOString(),
              isRead: true,
              isImportant: true,
              type: "parent",
              conversationId: "conv-2",
            },
            {
              id: "msg-5",
              senderId: "parent-2",
              receiverId: mockProfile.id,
              senderName: "Sarah Brown",
              receiverName: mockProfile.full_name,
              subject: "Re: Michael's Academic Progress",
              content:
                "Thank you for keeping us informed about Michael's progress.",
              timestamp: new Date(
                Date.now() - 24 * 60 * 60 * 1000,
              ).toISOString(),
              isRead: false,
              isImportant: false,
              type: "parent",
              conversationId: "conv-2",
            },
          ],
        },
        {
          id: "conv-3",
          participantId: "student-3",
          participantName: "Lisa Chen",
          participantType: "student",
          className: "Grade 10 B",
          lastMessage:
            "Could you please review my assignment before submission?",
          lastMessageTime: new Date(
            Date.now() - 3 * 60 * 60 * 1000,
          ).toISOString(),
          unreadCount: 1,
          isImportant: false,
          messages: [
            {
              id: "msg-6",
              senderId: "student-3",
              receiverId: mockProfile.id,
              senderName: "Lisa Chen",
              receiverName: mockProfile.full_name,
              subject: "Assignment Review Request",
              content:
                "Could you please review my assignment before submission?",
              timestamp: new Date(
                Date.now() - 3 * 60 * 60 * 1000,
              ).toISOString(),
              isRead: false,
              isImportant: false,
              type: "student",
              conversationId: "conv-3",
            },
          ],
        },
      ];

      setStudents(mockStudents);
      setConversations(mockConversations);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedConversation) return;

    try {
      setSending(true);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const conversation = conversations.find(
        (c) => c.id === selectedConversation,
      );
      if (!conversation) return;

      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: mockProfile.id,
        receiverId: conversation.participantId,
        senderName: mockProfile.full_name,
        receiverName: conversation.participantName,
        subject: "Re: " + (conversation.messages[0]?.subject || "Message"),
        content: message.trim(),
        timestamp: new Date().toISOString(),
        isRead: true,
        isImportant: false,
        type: conversation.participantType,
        conversationId: selectedConversation,
      };

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === selectedConversation) {
            return {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessage: message.trim(),
              lastMessageTime: new Date().toISOString(),
            };
          }
          return conv;
        }),
      );

      setMessage("");

      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const sendNewMessage = async () => {
    if (
      !newMessageForm.recipient ||
      !newMessageForm.subject ||
      !newMessageForm.content
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setSending(true);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const recipient = students.find((s) => s.id === newMessageForm.recipient);
      if (!recipient) return;

      const conversationId = `conv-${Date.now()}`;
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: mockProfile.id,
        receiverId: newMessageForm.recipient,
        senderName: mockProfile.full_name,
        receiverName: recipient.name,
        subject: newMessageForm.subject,
        content: newMessageForm.content,
        timestamp: new Date().toISOString(),
        isRead: true,
        isImportant: newMessageForm.isImportant,
        type: "student",
        conversationId,
      };

      const newConversation: Conversation = {
        id: conversationId,
        participantId: recipient.id,
        participantName: recipient.name,
        participantType: "student",
        className: recipient.className,
        lastMessage: newMessageForm.content,
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
        isImportant: newMessageForm.isImportant,
        messages: [newMessage],
      };

      setConversations((prev) => [newConversation, ...prev]);
      setSelectedConversation(conversationId);

      // Reset form
      setNewMessageForm({
        recipient: "",
        subject: "",
        content: "",
        isImportant: false,
      });

      toast({
        title: "Message Sent",
        description: "Your new message has been sent successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, "HH:mm");
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "MMM dd");
    }
  };

  const markAsRead = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv,
      ),
    );
  };

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = true;
    if (filterType === "unread") matchesFilter = conv.unreadCount > 0;
    else if (filterType === "important") matchesFilter = conv.isImportant;
    else if (filterType === "students")
      matchesFilter = conv.participantType === "student";
    else if (filterType === "parents")
      matchesFilter = conv.participantType === "parent";

    return matchesSearch && matchesFilter;
  });

  const currentConversation = conversations.find(
    (conv) => conv.id === selectedConversation,
  );
  const totalUnread = conversations.reduce(
    (sum, conv) => sum + conv.unreadCount,
    0,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Messages & Notes</h1>
          <p className="text-muted-foreground">
            Communicate with students and parents privately
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {totalUnread > 0 && (
            <Badge className="bg-red-500 text-white">
              {totalUnread} unread
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="messages" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="compose">Compose New</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="flex-1 flex gap-4">
          {/* Conversations List */}
          <div className="w-1/3 flex flex-col">
            <Card className="flex-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5" />
                    <span>Conversations</span>
                  </CardTitle>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter conversations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Conversations</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="important">Important</SelectItem>
                      <SelectItem value="students">Students</SelectItem>
                      <SelectItem value="parents">Parents</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-y-auto">
                <div className="space-y-1">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-3 cursor-pointer hover:bg-muted/50 border-b transition-colors ${
                        selectedConversation === conversation.id
                          ? "bg-muted"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedConversation(conversation.id);
                        if (conversation.unreadCount > 0) {
                          markAsRead(conversation.id);
                        }
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          {conversation.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                              {conversation.unreadCount}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">
                              {conversation.participantName}
                            </p>
                            <div className="flex items-center space-x-1">
                              {conversation.isImportant && (
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              )}
                              <span className="text-xs text-muted-foreground">
                                {formatMessageTime(
                                  conversation.lastMessageTime,
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {conversation.participantType === "parent"
                                ? "Parent"
                                : "Student"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {conversation.className}
                            </span>
                          </div>

                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {conversation.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredConversations.length === 0 && (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        No conversations found
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {currentConversation ? (
              <Card className="flex-1 flex flex-col">
                {/* Chat Header */}
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">
                          {currentConversation.participantName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {currentConversation.participantType === "parent"
                            ? "Parent"
                            : "Student"}{" "}
                          • {currentConversation.className}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {currentConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === mockProfile.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.senderId === mockProfile.id
                            ? "bg-blue-500 text-white"
                            : "bg-muted"
                        }`}
                      >
                        {msg.isImportant && (
                          <div className="flex items-center space-x-1 mb-2">
                            <Star className="h-3 w-3 text-yellow-300 fill-current" />
                            <span className="text-xs">Important</span>
                          </div>
                        )}
                        <p className="text-sm">{msg.content}</p>
                        <div
                          className={`flex items-center justify-end space-x-1 mt-2 text-xs ${
                            msg.senderId === mockProfile.id
                              ? "text-blue-100"
                              : "text-muted-foreground"
                          }`}
                        >
                          <span>
                            {format(new Date(msg.timestamp), "HH:mm")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <Textarea
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                    <Button
                      onClick={sendMessage}
                      disabled={!message.trim() || sending}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-muted-foreground">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="compose" className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Compose New Message</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recipient *</label>
                  <Select
                    value={newMessageForm.recipient}
                    onValueChange={(value) =>
                      setNewMessageForm({ ...newMessageForm, recipient: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select student or parent" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} ({student.rollNumber}) -{" "}
                          {student.className}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject *</label>
                  <Input
                    value={newMessageForm.subject}
                    onChange={(e) =>
                      setNewMessageForm({
                        ...newMessageForm,
                        subject: e.target.value,
                      })
                    }
                    placeholder="Enter message subject"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message *</label>
                <Textarea
                  value={newMessageForm.content}
                  onChange={(e) =>
                    setNewMessageForm({
                      ...newMessageForm,
                      content: e.target.value,
                    })
                  }
                  placeholder="Type your message here..."
                  rows={8}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="important"
                  checked={newMessageForm.isImportant}
                  onChange={(e) =>
                    setNewMessageForm({
                      ...newMessageForm,
                      isImportant: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <label htmlFor="important" className="text-sm">
                  Mark as important
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setNewMessageForm({
                      recipient: "",
                      subject: "",
                      content: "",
                      isImportant: false,
                    })
                  }
                >
                  Clear
                </Button>
                <Button onClick={sendNewMessage} disabled={sending}>
                  {sending ? "Sending..." : "Send Message"}
                  <Send className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherMessages;
