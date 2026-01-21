"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

/* ================= TYPES ================= */

interface DashboardData {
  summary: {
    totalCustomers: number;
    totalHokers: number;
    thisMonthBills: number;
    paidAmount: number;
    pendingAmount: number;
  };
  bills: {
    paid: number;
    pending: number;
    lastGeneratedAt: string | null;
  };
  today: {
    deliveries: number;
    hokersWorked: number;
  };
  recentDeliveries: Array<{
    date: string;
    customerName: string;
    hokerName: string;
    items: number;
    _id?: string;
  }>;
  recentPayments: Array<{
    customerName: string;
    paidAmount: number;
    paidAt: string;
    _id?: string;
  }>;
}

/* ================= HELPER FUNCTIONS ================= */

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  } catch {
    return "Invalid date";
  }
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);
};

/* ================= SMALL COMPONENT ================= */

function Stat({ title, value }: { title: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

/* ================= PAGE ================= */

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/agent/dashboard/view", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load dashboard";
      setError(errorMessage);
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 mb-4" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-600 font-medium mb-4">{error}</div>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <p>No dashboard data available</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* ================= SUMMARY ================= */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Stat title="Customers" value={data.summary.totalCustomers} />
        <Stat title="Hokers" value={data.summary.totalHokers} />
        <Stat title="Bills (Month)" value={data.summary.thisMonthBills} />
        <Stat title="Paid Amount" value={formatCurrency(data.summary.paidAmount)} />
        <Stat title="Pending Amount" value={formatCurrency(data.summary.pendingAmount)} />
      </div>

      {/* ================= TODAY ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📦</span>
              <span>Today Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>Deliveries: <b>{data.today.deliveries}</b></p>
            <p>Hokers Worked: <b>{data.today.hokersWorked}</b></p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🧾</span>
              <span>Bills Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="flex items-center gap-2">
              <span>Paid Bills:</span>
              <Badge variant="default">{data.bills.paid}</Badge>
            </p>
            <p className="flex items-center gap-2">
              <span>Pending Bills:</span>
              <Badge variant="destructive">{data.bills.pending}</Badge>
            </p>
            {data.bills.lastGeneratedAt && (
              <p className="text-sm text-muted-foreground">
                Last Bill: {formatDate(data.bills.lastGeneratedAt)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ================= RECENT DELIVERIES ================= */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🚲</span>
            <span>Recent Deliveries</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentDeliveries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Hoker</TableHead>
                  <TableHead>Items</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentDeliveries.map((delivery, index) => (
                  <TableRow key={delivery._id || index}>
                    <TableCell>{formatDate(delivery.date)}</TableCell>
                    <TableCell>{delivery.customerName}</TableCell>
                    <TableCell>{delivery.hokerName}</TableCell>
                    <TableCell>{delivery.items}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-4">No recent deliveries</p>
          )}
        </CardContent>
      </Card>

      {/* ================= RECENT PAYMENTS ================= */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>💰</span>
            <span>Recent Payments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentPayments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentPayments.map((payment, index) => (
                  <TableRow key={payment._id || index}>
                    <TableCell>{payment.customerName}</TableCell>
                    <TableCell>{formatCurrency(payment.paidAmount)}</TableCell>
                    <TableCell>{formatDate(payment.paidAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-4">No recent payments</p>
          )}
        </CardContent>
      </Card>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh Dashboard
        </button>
      </div>
    </div>
  );
}