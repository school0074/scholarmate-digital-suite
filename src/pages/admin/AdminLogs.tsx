import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  User,
  Server,
  Database,
  Shield,
  Bug,
  Zap,
  Eye,
  Trash2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SystemLog {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "success";
  category: "system" | "security" | "database" | "api" | "user" | "backup";
  message: string;
  details?: string;
  user_id?: string;
  user_name?: string;
  ip_address?: string;
  user_agent?: string;
  request_id?: string;
  duration?: number;
  status_code?: number;
}

const AdminLogs = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadLogs();
  }, [dateFilter]);

  const loadLogs = async () => {
    try {
      setLoading(true);

      // Mock system logs data (in a real app, you'd fetch from your logging system)
      const mockLogs: SystemLog[] = [
        {
          id: "1",
          timestamp: new Date().toISOString(),
          level: "info",
          category: "user",
          message: "User login successful",
          details: "User successfully authenticated and session created",
          user_id: "user123",
          user_name: "John Doe",
          ip_address: "192.168.1.100",
          user_agent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          request_id: "req_123456",
          duration: 245,
          status_code: 200,
        },
        {
          id: "2",
          timestamp: new Date(Date.now() - 300000).toISOString(),
          level: "warning",
          category: "security",
          message: "Multiple failed login attempts detected",
          details: "5 consecutive failed login attempts from IP 203.45.67.89",
          ip_address: "203.45.67.89",
          user_agent: "curl/7.68.0",
          request_id: "req_123457",
        },
        {
          id: "3",
          timestamp: new Date(Date.now() - 600000).toISOString(),
          level: "error",
          category: "database",
          message: "Database connection timeout",
          details:
            "Connection to primary database timed out after 30 seconds. Failover to secondary database initiated.",
          request_id: "req_123458",
          duration: 30000,
          status_code: 500,
        },
        {
          id: "4",
          timestamp: new Date(Date.now() - 900000).toISOString(),
          level: "success",
          category: "backup",
          message: "Database backup completed successfully",
          details:
            "Daily database backup completed. Backup size: 2.3GB. Duration: 45 minutes.",
          duration: 2700000,
        },
        {
          id: "5",
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          level: "info",
          category: "api",
          message: "API rate limit threshold reached",
          details: "User exceeded API rate limit of 1000 requests per hour",
          user_id: "user456",
          user_name: "Jane Smith",
          ip_address: "10.0.0.50",
          request_id: "req_123459",
          status_code: 429,
        },
        {
          id: "6",
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          level: "error",
          category: "system",
          message: "High memory usage detected",
          details: "System memory usage reached 95%. Memory cleanup initiated.",
          request_id: "req_123460",
        },
        {
          id: "7",
          timestamp: new Date(Date.now() - 2400000).toISOString(),
          level: "info",
          category: "user",
          message: "New user registration",
          details: "New student account created and verification email sent",
          user_id: "user789",
          user_name: "Mike Johnson",
          ip_address: "172.16.0.25",
          request_id: "req_123461",
          status_code: 201,
        },
        {
          id: "8",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          level: "warning",
          category: "security",
          message: "Suspicious file upload attempt",
          details:
            "User attempted to upload executable file with .jpg extension",
          user_id: "user321",
          user_name: "Alex Wilson",
          ip_address: "192.168.1.200",
          request_id: "req_123462",
          status_code: 403,
        },
      ];

      setLogs(mockLogs);
    } catch (error) {
      console.error("Error loading logs:", error);
      toast({
        title: "Error",
        description: "Failed to load system logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    try {
      // In a real app, you'd call an API to clear old logs
      setLogs([]);
      toast({
        title: "Success",
        description: "System logs cleared successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear logs",
        variant: "destructive",
      });
    }
  };

  const exportLogs = () => {
    // In a real app, you'd generate and download a log file
    toast({
      title: "Export Started",
      description: "Log export has been initiated",
    });
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === "all" || log.level === levelFilter;
    const matchesCategory =
      categoryFilter === "all" || log.category === categoryFilter;

    return matchesSearch && matchesLevel && matchesCategory;
  });

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "system":
        return <Server className="h-4 w-4" />;
      case "security":
        return <Shield className="h-4 w-4" />;
      case "database":
        return <Database className="h-4 w-4" />;
      case "api":
        return <Zap className="h-4 w-4" />;
      case "user":
        return <User className="h-4 w-4" />;
      case "backup":
        return <FileText className="h-4 w-4" />;
      default:
        return <Bug className="h-4 w-4" />;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "error":
        return <Badge variant="destructive">{level}</Badge>;
      case "warning":
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            {level}
          </Badge>
        );
      case "success":
        return (
          <Badge variant="default" className="bg-green-500">
            {level}
          </Badge>
        );
      case "info":
        return <Badge variant="secondary">{level}</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  const stats = {
    total: logs.length,
    errors: logs.filter((log) => log.level === "error").length,
    warnings: logs.filter((log) => log.level === "warning").length,
    info: logs.filter((log) => log.level === "info").length,
    success: logs.filter((log) => log.level === "success").length,
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Logs</h1>
          <p className="text-muted-foreground">
            Monitor system activities, errors, and security events
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={clearLogs}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Logs
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.errors}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.warnings}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Info</CardTitle>
            <Info className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.info}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.success}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="security">Security Events</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters & Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="backup">Backup</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>System Logs ({filteredLogs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getLevelIcon(log.level)}
                          {getLevelBadge(log.level)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(log.category)}
                          <span className="text-sm capitalize">
                            {log.category}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="font-medium truncate">{log.message}</p>
                          {log.details && (
                            <p className="text-sm text-muted-foreground truncate">
                              {log.details}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.user_name ? (
                          <div className="flex items-center space-x-2">
                            <User className="h-3 w-3" />
                            <span className="text-sm">{log.user_name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            System
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedLog(log)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Log Details</DialogTitle>
                              <DialogDescription>
                                Detailed information about this log entry
                              </DialogDescription>
                            </DialogHeader>
                            {selectedLog && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="font-medium">
                                      Timestamp
                                    </Label>
                                    <p className="text-sm">
                                      {new Date(
                                        selectedLog.timestamp,
                                      ).toLocaleString()}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="font-medium">Level</Label>
                                    <div className="flex items-center space-x-2 mt-1">
                                      {getLevelIcon(selectedLog.level)}
                                      {getLevelBadge(selectedLog.level)}
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="font-medium">
                                      Category
                                    </Label>
                                    <div className="flex items-center space-x-2 mt-1">
                                      {getCategoryIcon(selectedLog.category)}
                                      <span className="text-sm capitalize">
                                        {selectedLog.category}
                                      </span>
                                    </div>
                                  </div>
                                  {selectedLog.status_code && (
                                    <div>
                                      <Label className="font-medium">
                                        Status Code
                                      </Label>
                                      <p className="text-sm">
                                        {selectedLog.status_code}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <div>
                                  <Label className="font-medium">Message</Label>
                                  <p className="text-sm mt-1">
                                    {selectedLog.message}
                                  </p>
                                </div>

                                {selectedLog.details && (
                                  <div>
                                    <Label className="font-medium">
                                      Details
                                    </Label>
                                    <p className="text-sm mt-1">
                                      {selectedLog.details}
                                    </p>
                                  </div>
                                )}

                                {selectedLog.user_name && (
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="font-medium">
                                        User
                                      </Label>
                                      <p className="text-sm">
                                        {selectedLog.user_name}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="font-medium">
                                        User ID
                                      </Label>
                                      <p className="text-sm">
                                        {selectedLog.user_id}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {selectedLog.ip_address && (
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="font-medium">
                                        IP Address
                                      </Label>
                                      <p className="text-sm">
                                        {selectedLog.ip_address}
                                      </p>
                                    </div>
                                    {selectedLog.request_id && (
                                      <div>
                                        <Label className="font-medium">
                                          Request ID
                                        </Label>
                                        <p className="text-sm">
                                          {selectedLog.request_id}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {selectedLog.user_agent && (
                                  <div>
                                    <Label className="font-medium">
                                      User Agent
                                    </Label>
                                    <p className="text-sm break-all">
                                      {selectedLog.user_agent}
                                    </p>
                                  </div>
                                )}

                                {selectedLog.duration && (
                                  <div>
                                    <Label className="font-medium">
                                      Duration
                                    </Label>
                                    <p className="text-sm">
                                      {selectedLog.duration}ms
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Security-related log entries and events will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Performance monitoring and metrics will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminLogs;
