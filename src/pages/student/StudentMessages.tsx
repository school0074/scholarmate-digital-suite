import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, Reply, Search, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Message {
  id: string;
  subject: string | null;
  content: string;
  sender_id: string | null;
  recipient_id: string | null;
  read: boolean | null;
  read_at: string | null;
  reply_to: string | null;
  created_at: string;
  sender_name: string;
  recipient_name: string;
}

const StudentMessages = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (profile) {
      loadMessages();
    }
  }, [profile]);

  const loadMessages = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);

      const { data: messagesData, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading messages:", error);
        throw error;
      }

      const messages: Message[] =
        messagesData?.map((msg) => ({
          id: msg.id,
          subject: msg.subject,
          content: msg.content,
          sender_id: msg.sender_id,
          recipient_id: msg.recipient_id,
          read: msg.read,
          read_at: msg.read_at,
          reply_to: msg.reply_to,
          created_at: msg.created_at,
          sender_name: "User", // Simplified for now
          recipient_name: "User", // Simplified for now
        })) || [];

      setMessages(messages);
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

  const sendReply = async () => {
    if (!selectedMessage || !replyContent.trim() || !profile?.id) return;

    try {
      const { error } = await supabase.from("messages").insert({
        content: replyContent,
        sender_id: profile.id,
        recipient_id: selectedMessage.sender_id,
        reply_to: selectedMessage.id,
        subject: `Re: ${selectedMessage.subject || "No Subject"}`,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Reply sent successfully",
      });

      setReplyContent("");
      await loadMessages();
    } catch (error) {
      console.error("Error sending reply:", error);
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from("messages")
        .update({ read: true, read_at: new Date().toISOString() })
        .eq("id", messageId);

      if (error) throw error;
      await loadMessages();
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const filteredMessages = messages.filter(
    (message) =>
      message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (selectedMessage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedMessage(null)}
          >
            ← Back
          </Button>
          <h1 className="text-2xl font-bold">Message Details</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{selectedMessage.subject || "No Subject"}</CardTitle>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>From: {selectedMessage.sender_name}</span>
              <span>
                {format(new Date(selectedMessage.created_at), "PPp")}
              </span>
              {!selectedMessage.read && (
                <Badge variant="secondary">Unread</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
            </div>
          </CardContent>
        </Card>

        {/* Reply Section */}
        <Card>
          <CardHeader>
            <CardTitle>Reply</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Type your reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={4}
            />
            <Button onClick={sendReply} disabled={!replyContent.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Send Reply
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">
          View and respond to messages from teachers and administrators
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle>All Messages ({filteredMessages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                  !message.read ? "bg-blue-50 dark:bg-blue-950/20" : ""
                }`}
                onClick={() => {
                  setSelectedMessage(message);
                  if (!message.read) {
                    markAsRead(message.id);
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium">
                        {message.subject || "No Subject"}
                      </h3>
                      {!message.read && (
                        <Badge variant="secondary" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {message.content}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <span>From: {message.sender_name}</span>
                      <span>
                        {format(new Date(message.created_at), "MMM dd, yyyy")}
                      </span>
                    </div>
                  </div>
                  <MessageCircle className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            ))}

            {filteredMessages.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? "No messages found" : "No messages yet"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentMessages;