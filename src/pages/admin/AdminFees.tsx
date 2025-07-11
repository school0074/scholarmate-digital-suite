import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  CreditCard,
  Receipt,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

interface Fee {
  id: string;
  student_id: string;
  student_name: string;
  fee_type: string;
  amount: number;
  paid_amount: number;
  due_date: string;
  paid_date?: string;
  paid: boolean;
  payment_method?: string;
  transaction_id?: string;
  late_fee?: number;
  created_at: string;
  student?: {
    full_name: string;
    email: string;
  };
}

interface FeeType {
  id: string;
  name: string;
  amount: number;
  description: string;
  is_recurring: boolean;
  due_frequency?: string;
}

const AdminFees = () => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isCreateFeeDialogOpen, setIsCreateFeeDialogOpen] = useState(false);
  const [isCreateTypeDialogOpen, setIsCreateTypeDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form state for creating fees
  const [feeFormData, setFeeFormData] = useState({
    student_id: "",
    fee_type: "",
    amount: "",
    due_date: "",
  });

  // Form state for creating fee types
  const [typeFormData, setTypeFormData] = useState({
    name: "",
    amount: "",
    description: "",
    is_recurring: false,
    due_frequency: "",
  });

  useEffect(() => {
    loadFees();
    loadFeeTypes();
    loadStudents();
  }, []);

  const loadFees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("fees")
        .select(
          `
          *,
          student:profiles(full_name, email)
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFees(data || []);
    } catch (error) {
      console.error("Error loading fees:", error);
      toast({
        title: "Error",
        description: "Failed to load fees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFeeTypes = async () => {
    try {
      // Mock fee types data (in a real app, you'd have a fee_types table)
      const mockFeeTypes: FeeType[] = [
        {
          id: "1",
          name: "Tuition Fee",
          amount: 5000,
          description: "Monthly tuition fee",
          is_recurring: true,
          due_frequency: "monthly",
        },
        {
          id: "2",
          name: "Registration Fee",
          amount: 1000,
          description: "One-time registration fee",
          is_recurring: false,
        },
        {
          id: "3",
          name: "Activity Fee",
          amount: 500,
          description: "Extracurricular activities fee",
          is_recurring: true,
          due_frequency: "quarterly",
        },
        {
          id: "4",
          name: "Library Fee",
          amount: 200,
          description: "Annual library maintenance fee",
          is_recurring: true,
          due_frequency: "annually",
        },
      ];
      setFeeTypes(mockFeeTypes);
    } catch (error) {
      console.error("Error loading fee types:", error);
    }
  };

  const loadStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          id,
          full_name,
          email,
          student_enrollments (
            classes (
              name,
              grade_level,
              section
            )
          )
        `,
        )
        .eq("role", "student");

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error("Error loading students:", error);
    }
  };

  const markFeeAsPaid = async (feeId: string, amount: number) => {
    try {
      const { error } = await supabase
        .from("fees")
        .update({
          paid: true,
          paid_amount: amount,
          paid_date: new Date().toISOString(),
          payment_method: "manual",
        })
        .eq("id", feeId);

      if (error) throw error;

      await loadFees();
      toast({
        title: "Success",
        description: "Fee marked as paid successfully",
      });
    } catch (error) {
      console.error("Error updating fee:", error);
      toast({
        title: "Error",
        description: "Failed to update fee status",
        variant: "destructive",
      });
    }
  };

  const filteredFees = fees.filter((fee) => {
    const matchesSearch =
      fee.student?.full_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      fee.fee_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "paid" && fee.paid) ||
      (statusFilter === "pending" && !fee.paid) ||
      (statusFilter === "overdue" &&
        !fee.paid &&
        new Date(fee.due_date) < new Date());
    const matchesType = typeFilter === "all" || fee.fee_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (fee: Fee) => {
    if (fee.paid) {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Paid
        </Badge>
      );
    }
    if (new Date(fee.due_date) < new Date()) {
      return (
        <Badge variant="destructive">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Overdue
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const stats = {
    totalAmount: fees.reduce((sum, fee) => sum + fee.amount, 0),
    collectedAmount: fees
      .filter((fee) => fee.paid)
      .reduce((sum, fee) => sum + fee.paid_amount, 0),
    pendingAmount: fees
      .filter((fee) => !fee.paid)
      .reduce((sum, fee) => sum + fee.amount, 0),
    overdueAmount: fees
      .filter((fee) => !fee.paid && new Date(fee.due_date) < new Date())
      .reduce((sum, fee) => sum + fee.amount, 0),
    totalFees: fees.length,
    paidFees: fees.filter((fee) => fee.paid).length,
    pendingFees: fees.filter((fee) => !fee.paid).length,
    overdueFees: fees.filter(
      (fee) => !fee.paid && new Date(fee.due_date) < new Date(),
    ).length,
  };

  const collectionRate =
    stats.totalAmount > 0
      ? (stats.collectedAmount / stats.totalAmount) * 100
      : 0;

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
          <h1 className="text-3xl font-bold">Fee Management</h1>
          <p className="text-muted-foreground">
            Manage school fees, payments, and financial records
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog
            open={isCreateTypeDialogOpen}
            onOpenChange={setIsCreateTypeDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Fee Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Fee Type</DialogTitle>
                <DialogDescription>
                  Define a new fee type for your school.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="typeName">Fee Type Name</Label>
                  <Input
                    id="typeName"
                    placeholder="e.g., Tuition Fee, Library Fee"
                    value={typeFormData.name}
                    onChange={(e) =>
                      setTypeFormData({ ...typeFormData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="typeAmount">Amount (₹)</Label>
                  <Input
                    id="typeAmount"
                    type="number"
                    placeholder="Enter amount"
                    value={typeFormData.amount}
                    onChange={(e) =>
                      setTypeFormData({
                        ...typeFormData,
                        amount: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="typeDescription">Description</Label>
                  <Input
                    id="typeDescription"
                    placeholder="Enter description"
                    value={typeFormData.description}
                    onChange={(e) =>
                      setTypeFormData({
                        ...typeFormData,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <Button onClick={() => setIsCreateTypeDialogOpen(false)}>
                  Create Fee Type
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isCreateFeeDialogOpen}
            onOpenChange={setIsCreateFeeDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Assign Fee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Fee to Student</DialogTitle>
                <DialogDescription>
                  Assign a fee to a specific student.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="student">Student</Label>
                  <Select
                    value={feeFormData.student_id}
                    onValueChange={(value) =>
                      setFeeFormData({ ...feeFormData, student_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Select a student...</SelectItem>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.full_name} -{" "}
                          {student.student_enrollments?.[0]?.classes
                            ? `Grade ${student.student_enrollments[0].classes.grade_level}${student.student_enrollments[0].classes.section ? ` ${student.student_enrollments[0].classes.section}` : ""}`
                            : "No Class"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feeType">Fee Type</Label>
                  <Select
                    value={feeFormData.fee_type}
                    onValueChange={(value) =>
                      setFeeFormData({ ...feeFormData, fee_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fee type" />
                    </SelectTrigger>
                    <SelectContent>
                      {feeTypes.map((type) => (
                        <SelectItem key={type.id} value={type.name}>
                          {type.name} - ₹{type.amount}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={feeFormData.amount}
                    onChange={(e) =>
                      setFeeFormData({ ...feeFormData, amount: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={feeFormData.due_date}
                    onChange={(e) =>
                      setFeeFormData({
                        ...feeFormData,
                        due_date: e.target.value,
                      })
                    }
                  />
                </div>
                <Button onClick={() => setIsCreateFeeDialogOpen(false)}>
                  Assign Fee
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats.totalAmount.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              Total fees assigned
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{stats.collectedAmount.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {collectionRate.toFixed(1)}% collection rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ₹{stats.pendingAmount.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.pendingFees} pending payments
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₹{stats.overdueAmount.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.overdueFees} overdue payments
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="fees" className="space-y-6">
        <TabsList>
          <TabsTrigger value="fees">Fee Records</TabsTrigger>
          <TabsTrigger value="types">Fee Types</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="fees">
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
                      placeholder="Search fees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {feeTypes.map((type) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Fees Table */}
          <Card>
            <CardHeader>
              <CardTitle>Fee Records ({filteredFees.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Details</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFees.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <div>
                            <p className="font-medium">
                              {fee.student?.full_name || "Unknown Student"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {fee.student?.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{fee.fee_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          ₹{fee.amount.toLocaleString()}
                        </div>
                        {fee.late_fee && (
                          <div className="text-sm text-red-600">
                            +₹{fee.late_fee} late fee
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(fee.due_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(fee)}</TableCell>
                      <TableCell>
                        {fee.paid ? (
                          <div className="text-sm">
                            <div className="flex items-center">
                              <CreditCard className="h-3 w-3 mr-1" />
                              {fee.payment_method}
                            </div>
                            <div className="text-muted-foreground">
                              {fee.paid_date &&
                                new Date(fee.paid_date).toLocaleDateString()}
                            </div>
                            {fee.transaction_id && (
                              <div className="text-muted-foreground text-xs">
                                ID: {fee.transaction_id}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Not paid
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {!fee.paid && (
                            <Button
                              size="sm"
                              onClick={() => markFeeAsPaid(fee.id, fee.amount)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Mark Paid
                            </Button>
                          )}
                          <Button size="sm" variant="ghost">
                            <Receipt className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types">
          <Card>
            <CardHeader>
              <CardTitle>Fee Types</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell className="font-medium">{type.name}</TableCell>
                      <TableCell>₹{type.amount.toLocaleString()}</TableCell>
                      <TableCell>{type.description}</TableCell>
                      <TableCell>
                        <Badge
                          variant={type.is_recurring ? "default" : "secondary"}
                        >
                          {type.is_recurring ? type.due_frequency : "One-time"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Collection Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Fees Assigned:</span>
                  <span className="font-medium">
                    ₹{stats.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Collected:</span>
                  <span className="font-medium text-green-600">
                    ₹{stats.collectedAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Pending:</span>
                  <span className="font-medium text-orange-600">
                    ₹{stats.pendingAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Overdue:</span>
                  <span className="font-medium text-red-600">
                    ₹{stats.overdueAmount.toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between">
                    <span>Collection Rate:</span>
                    <span className="font-medium">
                      {collectionRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Fee Report
                </Button>
                <Button className="w-full" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Payments
                </Button>
                <Button className="w-full" variant="outline">
                  <Receipt className="h-4 w-4 mr-2" />
                  Generate Receipts
                </Button>
                <Button className="w-full" variant="outline">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Send Overdue Notices
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminFees;
