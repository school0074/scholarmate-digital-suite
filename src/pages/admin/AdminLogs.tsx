import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Database, Shield, Zap, Activity, Server, Eye, Info, AlertCircle, Clock, CheckCircle2, XCircle, Filter, Search, RefreshCw, Download, Calendar, MapPin, User, Mail, Phone, Trash2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "debug";
  category: "auth" | "database" | "api" | "security" | "system";
  message: string;
  user_id?: string;
  ip_address?: string;
  endpoint?: string;
  details?: any;
}

const AdminLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  useEffect(() => {
    loadLogs();
    // Set up real-time log updates
    const interval = setInterval(loadLogs, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [levelFilter, categoryFilter, dateFilter]);

  const loadLogs = () => {
    // Mock log data - in a real app, this would come from your logging service
    const mockLogs: LogEntry[] = [
      {
        id: "1",
        timestamp: new Date().toISOString(),
        level: "info",
        category: "auth",
        message: "User login successful",
        user_id: "user_123",
        ip_address: "192.168.1.100",
        endpoint: "/api/auth/login",
      },
      {
        id: "2",
        timestamp: new Date(Date.now() - 300000).toISOString(),
        level: "warning",
        category: "database",
        message: "Slow query detected",
        endpoint: "/api/students",
        details: { query_time: "2.5s", table: "students" },
      },
      {
        id: "3",
        timestamp: new Date(Date.now() - 600000).toISOString(),
        level: "error",
        category: "api",
        message: "API rate limit exceeded",
        ip_address: "203.0.113.45",
        endpoint: "/api/grades",
        details: { requests_per_minute: 150, limit: 100 },
      },
      {
        id: "4",
        timestamp: new Date(Date.now() - 900000).toISOString(),
        level: "info",
        category: "security",
        message: "Password changed successfully",
        user_id: "user_456",
        ip_address: "192.168.1.105",
      },
      {
        id: "5",
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        level: "debug",
        category: "system",
        message: "Background job completed",
        details: { job_type: "grade_calculation", duration: "45s" },
      },
    ];

    setLogs(mockLogs);
    setLoading(false);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.endpoint?.toLowerCase().includes(searchTerm.toLowerCase());
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
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "debug":
        return <Activity className="h-4 w-4 text-gray-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const variants = {
      error: "destructive",
      warning: "secondary",
      info: "default",
      debug: "outline",
    };
    return (
      <Badge variant={(variants[level as keyof typeof variants] || "default") as "default" | "destructive" | "outline" | "secondary"}>
        {level.toUpperCase()}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "auth":
        return <Shield className="h-4 w-4 text-blue-500" />;
      case "database":
        return <Database className="h-4 w-4 text-green-500" />;
      case "api":
        return <Zap className="h-4 w-4 text-purple-500" />;
      case "security":
        return <Shield className="h-4 w-4 text-red-500" />;
      case "system":
        return <Server className="h-4 w-4 text-gray-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const stats = {
    total: logs.length,
    errors: logs.filter((l) => l.level === "error").length,
    warnings: logs.filter((l) => l.level === "warning").length,
    info: logs.filter((l) => l.level === "info").length,
    debug: logs.filter((l) => l.level === "debug").length,
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
            Monitor system activity and troubleshoot issues
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
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
            <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
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
            <CardTitle className="text-sm font-medium">Debug</CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.debug}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="logs">Recent Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
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
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="error">Errors</SelectItem>
                    <SelectItem value="warning">Warnings</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="debug">Debug</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="auth">Authentication</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by date" />
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
              <CardTitle>Log Entries ({filteredLogs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>User/IP</TableHead>
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
                          <span className="capitalize">{log.category}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="font-medium truncate">{log.message}</p>
                          {log.endpoint && (
                            <p className="text-xs text-muted-foreground">
                              {log.endpoint}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {log.user_id && (
                            <div className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {log.user_id}
                            </div>
                          )}
                          {log.ip_address && (
                            <div className="flex items-center text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              {log.ip_address}
                            </div>
                          )}
                        </div>
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
                              <DialogTitle>Log Entry Details</DialogTitle>
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
                                  {selectedLog.user_id && (
                                    <div>
                                      <Label className="font-medium">
                                        User ID
                                      </Label>
                                      <p className="text-sm">
                                        {selectedLog.user_id}
                                      </p>
                                    </div>
                                  )}
                                  {selectedLog.ip_address && (
                                    <div>
                                      <Label className="font-medium">
                                        IP Address
                                      </Label>
                                      <p className="text-sm">
                                        {selectedLog.ip_address}
                                      </p>
                                    </div>
                                  )}
                                  {selectedLog.endpoint && (
                                    <div>
                                      <Label className="font-medium">
                                        Endpoint
                                      </Label>
                                      <p className="text-sm">
                                        {selectedLog.endpoint}
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
                                    <Label className="font-medium">Details</Label>
                                    <pre className="text-xs bg-muted p-3 rounded mt-1 overflow-auto">
                                      {JSON.stringify(
                                        selectedLog.details,
                                        null,
                                        2,
                                      )}
                                    </pre>
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

        <TabsContent value="analytics">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Log Distribution by Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Errors</span>
                    <span className="font-medium text-red-600">
                      {stats.errors}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Warnings</span>
                    <span className="font-medium text-yellow-600">
                      {stats.warnings}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Info</span>
                    <span className="font-medium text-blue-600">
                      {stats.info}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Debug</span>
                    <span className="font-medium text-gray-600">
                      {stats.debug}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Error Rate</span>
                    <Badge
                      variant={
                        stats.errors / stats.total > 0.1
                          ? "destructive"
                          : "default"
                      }
                    >
                      {((stats.errors / stats.total) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>System Status</span>
                    <Badge variant="default" className="bg-green-500">
                      Healthy
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Last Updated</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Log Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Log Level</Label>
                <Select defaultValue="info">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debug">Debug</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Log Retention (Days)</Label>
                <Input type="number" defaultValue="30" />
              </div>
              <div>
                <Label>Export Format</Label>
                <Select defaultValue="json">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="txt">Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminLogs;