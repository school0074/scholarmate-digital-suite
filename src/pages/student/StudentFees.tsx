import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  DollarSign,
  CreditCard,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Download,
  Receipt,
  Eye,
  TrendingUp,
  TrendingDown,
  Wallet,
  History,
  Bell,
} from "lucide-react";
import {
  format,
  formatDistance,
  isPast,
  isWithinInterval,
  subDays,
} from "date-fns";

interface Fee {
  id: string;
  student_id: string;
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
}

interface FeeType {
  id: string;
  name: string;
  amount: number;
  description: string;
  is_recurring: boolean;
  due_frequency?: string;
}

interface PaymentHistory {
  id: string;
  fee_id: string;
  amount: number;
  payment_method: string;
  transaction_id: string;
  payment_date: string;
  fee_type: string;
}

const StudentFees = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [fees, setFees] = useState<Fee[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    if (profile) {
      loadFeesData();
    }
  }, [profile]);

  const loadFeesData = async () => {
    try {
      setLoading(true);

      if (!profile?.id) {
        throw new Error("Student profile not found");
      }

      // Load student's fees
      const { data: feesData, error: feesError } = await supabase
        .from("fees")
        .select("*")
        .eq("student_id", profile.id)
        .order("due_date", { ascending: true });

      if (feesError) {
        console.error("Error loading fees:", feesError);
        throw feesError;
      }

      setFees(feesData || []);

      // Load fee types for reference
      const { data: typesData, error: typesError } = await supabase
        .from("fee_types")
        .select("*")
        .order("name");

      if (typesError) {
        console.error("Error loading fee types:", typesError);
        // Don't throw here, fee types are optional
      }

      setFeeTypes(typesData || []);
    } catch (error) {
      console.error("Error loading fees data:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load fees data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const payFee = async (feeId: string, paymentMethod: string = "online") => {
    try {
      setPaymentProcessing(true);

      const fee = fees.find((f) => f.id === feeId);
      if (!fee) {
        throw new Error("Fee not found");
      }

      if (fee.paid) {
        toast({
          title: "Error",
          description: "This fee has already been paid",
          variant: "destructive",
        });
        return;
      }

      const outstandingAmount = fee.amount - fee.paid_amount;
      const isOverdue = isPast(new Date(fee.due_date));
      const lateFee = isOverdue ? fee.late_fee || 0 : 0;
      const totalAmount = outstandingAmount + lateFee;

      // Generate transaction ID (in real app, this would come from payment gateway)
      const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Update fee record as paid
      const { error: updateError } = await supabase
        .from("fees")
        .update({
          paid: true,
          paid_amount: fee.amount,
          paid_date: new Date().toISOString(),
          payment_method: paymentMethod,
          transaction_id: transactionId,
          late_fee: lateFee,
        })
        .eq("id", feeId);

      if (updateError) {
        console.error("Error updating fee:", updateError);
        throw updateError;
      }

      toast({
        title: "Payment Successful!",
        description: `Fee payment of ₹${totalAmount} completed successfully. Transaction ID: ${transactionId}`,
      });

      // Reload fees data
      await loadFeesData();
      setSelectedFee(null);
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Payment Failed",
        description:
          error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setPaymentProcessing(false);
    }
  };

  const downloadReceipt = (fee: Fee) => {
    if (!fee.paid) {
      toast({
        title: "Error",
        description: "Cannot download receipt for unpaid fee",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would generate and download a PDF receipt
    toast({
      title: "Receipt Downloaded",
      description: `Receipt for ${fee.fee_type} downloaded successfully`,
    });
  };

  const getFilteredFees = () => {
    return fees.filter((fee) => {
      const matchesSearch =
        fee.fee_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "paid" && fee.paid) ||
        (statusFilter === "pending" && !fee.paid) ||
        (statusFilter === "overdue" &&
          !fee.paid &&
          isPast(new Date(fee.due_date)));

      return matchesSearch && matchesStatus;
    });
  };

  const getStats = () => {
    const totalAmount = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const paidAmount = fees
      .filter((fee) => fee.paid)
      .reduce((sum, fee) => sum + fee.paid_amount, 0);
    const pendingAmount = fees
      .filter((fee) => !fee.paid)
      .reduce((sum, fee) => sum + fee.amount, 0);
    const overdueAmount = fees
      .filter((fee) => !fee.paid && isPast(new Date(fee.due_date)))
      .reduce((sum, fee) => sum + fee.amount, 0);

    return {
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueAmount,
      totalFees: fees.length,
      paidFees: fees.filter((fee) => fee.paid).length,
      pendingFees: fees.filter((fee) => !fee.paid).length,
      overdueFees: fees.filter(
        (fee) => !fee.paid && isPast(new Date(fee.due_date)),
      ).length,
    };
  };

  const getUpcomingDueFees = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    return fees.filter(
      (fee) =>
        !fee.paid &&
        new Date(fee.due_date) <= nextWeek &&
        new Date(fee.due_date) >= new Date(),
    );
  };

  const stats = getStats();
  const upcomingFees = getUpcomingDueFees();

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
          <h1 className="text-3xl font-bold">Fees & Payments</h1>
          <p className="text-muted-foreground">
            Manage your fee payments and view transaction history
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Summary
        </Button>
      </div>

      {/* Upcoming Due Fees Alert */}
      {upcomingFees.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Bell className="h-6 w-6 text-orange-500" />
              <div>
                <h3 className="font-medium text-orange-700 dark:text-orange-300">
                  Upcoming Due Dates
                </h3>
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  {upcomingFees.length} fee{upcomingFees.length > 1 ? "s" : ""}{" "}
                  due in the next 7 days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold">
                  ₹{stats.paidAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  ₹{stats.pendingAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">
                  ₹{stats.overdueAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Receipt className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Fees</p>
                <p className="text-2xl font-bold">{stats.totalFees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="current" className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="current">Current Fees</TabsTrigger>
            <TabsTrigger value="history">Payment History</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search fees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="current" className="space-y-4">
          <div className="grid gap-4">
            {getFilteredFees().map((fee) => (
              <FeeCard
                key={fee.id}
                fee={fee}
                onPayFee={payFee}
                onDownloadReceipt={downloadReceipt}
                onViewDetails={setSelectedFee}
                paymentProcessing={paymentProcessing}
              />
            ))}
            {getFilteredFees().length === 0 && (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No fees found matching your criteria
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="grid gap-4">
            {fees
              .filter((fee) => fee.paid)
              .map((fee) => (
                <PaymentHistoryCard
                  key={fee.id}
                  fee={fee}
                  onDownloadReceipt={downloadReceipt}
                />
              ))}
            {fees.filter((fee) => fee.paid).length === 0 && (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No payment history found
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid gap-4">
            {upcomingFees.map((fee) => (
              <UpcomingFeeCard
                key={fee.id}
                fee={fee}
                onPayFee={payFee}
                paymentProcessing={paymentProcessing}
              />
            ))}
            {upcomingFees.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No upcoming fees due in the next 7 days
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Fee Details Modal */}
      {selectedFee && (
        <FeeDetailsModal
          fee={selectedFee}
          onClose={() => setSelectedFee(null)}
          onPayFee={payFee}
          paymentProcessing={paymentProcessing}
        />
      )}
    </div>
  );
};

interface FeeCardProps {
  fee: Fee;
  onPayFee: (feeId: string, paymentMethod?: string) => void;
  onDownloadReceipt: (fee: Fee) => void;
  onViewDetails: (fee: Fee) => void;
  paymentProcessing: boolean;
}

const FeeCard = ({
  fee,
  onPayFee,
  onDownloadReceipt,
  onViewDetails,
  paymentProcessing,
}: FeeCardProps) => {
  const isOverdue = !fee.paid && isPast(new Date(fee.due_date));
  const isDueSoon =
    !fee.paid &&
    isWithinInterval(new Date(fee.due_date), {
      start: new Date(),
      end: subDays(new Date(), -7),
    });

  return (
    <Card
      className={`${
        isOverdue
          ? "border-red-200 bg-red-50/50 dark:bg-red-950/20"
          : isDueSoon
            ? "border-orange-200 bg-orange-50/50 dark:bg-orange-950/20"
            : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold">{fee.fee_type}</h3>
              <Badge
                variant={
                  fee.paid ? "default" : isOverdue ? "destructive" : "secondary"
                }
              >
                {fee.paid ? "Paid" : isOverdue ? "Overdue" : "Pending"}
              </Badge>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Amount: ₹{fee.amount.toLocaleString()}</p>
              <p>Due Date: {format(new Date(fee.due_date), "PPP")}</p>
              {fee.paid && fee.paid_date && (
                <p>Paid: {format(new Date(fee.paid_date), "PPP")}</p>
              )}
              {fee.transaction_id && (
                <p>Transaction ID: {fee.transaction_id}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewDetails(fee)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {fee.paid ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDownloadReceipt(fee)}
              >
                <Download className="h-4 w-4 mr-1" />
                Receipt
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => onPayFee(fee.id)}
                disabled={paymentProcessing}
                className={isOverdue ? "bg-red-500 hover:bg-red-600" : ""}
              >
                <CreditCard className="h-4 w-4 mr-1" />
                Pay Now
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface PaymentHistoryCardProps {
  fee: Fee;
  onDownloadReceipt: (fee: Fee) => void;
}

const PaymentHistoryCard = ({
  fee,
  onDownloadReceipt,
}: PaymentHistoryCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold">{fee.fee_type}</h3>
              <Badge variant="default">Paid</Badge>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Amount Paid: ₹{fee.paid_amount.toLocaleString()}</p>
              <p>
                Payment Date:{" "}
                {fee.paid_date ? format(new Date(fee.paid_date), "PPP") : "N/A"}
              </p>
              <p>Payment Method: {fee.payment_method || "N/A"}</p>
              <p>Transaction ID: {fee.transaction_id || "N/A"}</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDownloadReceipt(fee)}
          >
            <Download className="h-4 w-4 mr-1" />
            Receipt
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface UpcomingFeeCardProps {
  fee: Fee;
  onPayFee: (feeId: string, paymentMethod?: string) => void;
  paymentProcessing: boolean;
}

const UpcomingFeeCard = ({
  fee,
  onPayFee,
  paymentProcessing,
}: UpcomingFeeCardProps) => {
  const daysUntilDue = Math.ceil(
    (new Date(fee.due_date).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24),
  );

  return (
    <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <h3 className="font-semibold">{fee.fee_type}</h3>
              <Badge variant="secondary">
                Due in {daysUntilDue} day{daysUntilDue !== 1 ? "s" : ""}
              </Badge>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Amount: ₹{fee.amount.toLocaleString()}</p>
              <p>Due Date: {format(new Date(fee.due_date), "PPP")}</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => onPayFee(fee.id)}
            disabled={paymentProcessing}
          >
            <CreditCard className="h-4 w-4 mr-1" />
            Pay Early
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface FeeDetailsModalProps {
  fee: Fee;
  onClose: () => void;
  onPayFee: (feeId: string, paymentMethod?: string) => void;
  paymentProcessing: boolean;
}

const FeeDetailsModal = ({
  fee,
  onClose,
  onPayFee,
  paymentProcessing,
}: FeeDetailsModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState("online");
  const isOverdue = !fee.paid && isPast(new Date(fee.due_date));
  const lateFee = isOverdue ? 50 : 0; // Default late fee
  const totalAmount = fee.amount + lateFee;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Fee Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">{fee.fee_type}</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Base Amount: ₹{fee.amount.toLocaleString()}</p>
              {isOverdue && <p>Late Fee: ₹{lateFee}</p>}
              <p className="font-medium">
                Total Amount: ₹{totalAmount.toLocaleString()}
              </p>
              <p>Due Date: {format(new Date(fee.due_date), "PPP")}</p>
              {isOverdue && (
                <p className="text-red-600">
                  Overdue by{" "}
                  {formatDistance(new Date(fee.due_date), new Date())}
                </p>
              )}
            </div>
          </div>

          {!fee.paid && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Payment Method</label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online Payment</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="card">Debit/Credit Card</SelectItem>
                    <SelectItem value="netbanking">Net Banking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            {!fee.paid && (
              <Button
                onClick={() => onPayFee(fee.id, paymentMethod)}
                disabled={paymentProcessing}
                className="flex-1"
              >
                {paymentProcessing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                Pay ₹{totalAmount.toLocaleString()}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentFees;
