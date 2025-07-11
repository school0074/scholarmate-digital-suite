import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  MessageCircle,
  Send,
  Phone,
  Video,
  Paperclip,
  Smile,
  Search,
  MoreVertical,
  CheckCircle2,
  Clock,
  User,
  BookOpen,
  AlertCircle,
  Star,
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";

interface Teacher {
  id: string;
  name: string;
  subject: string;
  avatar?: string;
  status: "online" | "offline" | "busy";
  lastSeen?: string;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: "text" | "image" | "file";
  status: "sent" | "delivered" | "read";
  replyTo?: string;
}

interface Conversation {
  id: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

const StudentChat = () => {
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data
  const mockTeachers: Teacher[] = [
    {
      id: "1",
      name: "Dr. Smith",
      subject: "Mathematics",
      status: "online",
      lastSeen: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Prof. Johnson",
      subject: "Physics",
      status: "offline",
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "3",
      name: "Ms. Brown",
      subject: "English Literature",
      status: "busy",
      lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: "4",
      name: "Dr. Wilson",
      subject: "Chemistry",
      status: "online",
      lastSeen: new Date().toISOString(),
    },
  ];

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      teacherId: "1",
      teacherName: "Dr. Smith",
      subject: "Mathematics",
      lastMessage: "Sure, I can help you with that quadratic equation problem.",
      lastMessageTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      unreadCount: 0,
      messages: [
        {
          id: "1",
          senderId: "student-123",
          senderName: "You",
          content:
            "Hi Dr. Smith, I need help with quadratic equations from today's homework.",
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          type: "text",
          status: "read",
        },
        {
          id: "2",
          senderId: "1",
          senderName: "Dr. Smith",
          content:
            "Hello! I'd be happy to help you with quadratic equations. Which specific problem are you struggling with?",
          timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          type: "text",
          status: "read",
        },
        {
          id: "3",
          senderId: "student-123",
          senderName: "You",
          content:
            "It's problem number 15. I don't understand how to factor x² + 7x + 12.",
          timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          type: "text",
          status: "read",
        },
        {
          id: "4",
          senderId: "1",
          senderName: "Dr. Smith",
          content: "Sure, I can help you with that quadratic equation problem.",
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          type: "text",
          status: "read",
        },
      ],
    },
    {
      id: "2",
      teacherId: "2",
      teacherName: "Prof. Johnson",
      subject: "Physics",
      lastMessage: "The lab report deadline has been extended to Friday.",
      lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      unreadCount: 1,
      messages: [
        {
          id: "5",
          senderId: "2",
          senderName: "Prof. Johnson",
          content: "The lab report deadline has been extended to Friday.",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          type: "text",
          status: "delivered",
        },
      ],
    },
    {
      id: "3",
      teacherId: "3",
      teacherName: "Ms. Brown",
      subject: "English Literature",
      lastMessage: "Your essay on Shakespeare was excellent! Well done.",
      lastMessageTime: new Date(
        Date.now() - 1 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      unreadCount: 0,
      messages: [
        {
          id: "6",
          senderId: "3",
          senderName: "Ms. Brown",
          content: "Your essay on Shakespeare was excellent! Well done.",
          timestamp: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          type: "text",
          status: "read",
        },
      ],
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation, conversations]);

  const sendMessage = () => {
    if (!message.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: "student-123",
      senderName: "You",
      content: message.trim(),
      timestamp: new Date().toISOString(),
      type: "text",
      status: "sent",
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
      description: "Your message has been sent to the teacher.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle2 className="h-3 w-3 text-gray-400" />;
      case "delivered":
        return <CheckCircle2 className="h-3 w-3 text-blue-500" />;
      case "read":
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "busy":
        return "bg-orange-500";
      default:
        return "bg-gray-400";
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

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.subject.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const currentConversation = conversations.find(
    (conv) => conv.id === selectedConversation,
  );

  return (
    <div className="h-[calc(100vh-12rem)] flex space-x-4">
      {/* Conversations List */}
      <div className="w-1/3 flex flex-col">
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Ask a Doubt</span>
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teachers or subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-2">
              {filteredConversations.map((conversation) => {
                const teacher = mockTeachers.find(
                  (t) => t.id === conversation.teacherId,
                );
                return (
                  <div
                    key={conversation.id}
                    className={`p-3 cursor-pointer hover:bg-muted/50 border-b ${
                      selectedConversation === conversation.id ? "bg-muted" : ""
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={teacher?.avatar} />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(teacher?.status || "offline")}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">
                            {conversation.teacherName}
                          </p>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-muted-foreground">
                              {formatMessageTime(conversation.lastMessageTime)}
                            </span>
                            {conversation.unreadCount > 0 && (
                              <Badge className="bg-blue-500 text-white text-xs px-1.5 py-0.5 min-w-[1.2rem] h-5">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          <BookOpen className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {conversation.subject}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

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

        {/* Quick Actions */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">Quick Help Topics</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Assignment Help
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Exam Preparation
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Star className="h-4 w-4 mr-2" />
                Extra Practice
              </Button>
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
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(mockTeachers.find((t) => t.id === currentConversation.teacherId)?.status || "offline")}`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {currentConversation.teacherName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {currentConversation.subject}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
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
                  className={`flex ${msg.senderId === "student-123" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.senderId === "student-123"
                        ? "bg-blue-500 text-white"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <div
                      className={`flex items-center justify-end space-x-1 mt-2 text-xs ${
                        msg.senderId === "student-123"
                          ? "text-blue-100"
                          : "text-muted-foreground"
                      }`}
                    >
                      <span>{format(new Date(msg.timestamp), "HH:mm")}</span>
                      {msg.senderId === "student-123" &&
                        getStatusIcon(msg.status)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type your question or doubt..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    className="pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <Button onClick={sendMessage} disabled={!message.trim()}>
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
                Choose a teacher from the list to start asking your doubts
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentChat;
