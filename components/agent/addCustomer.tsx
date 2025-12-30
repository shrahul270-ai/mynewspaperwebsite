"use client";

import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";

interface Customer {
  _id: string;
  name: string;
  surname: string;
  mobile: string;
  email: string;
}

export default function AddAgentCustomersClient() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Fetch customers from API
    fetch("/api/customers/not-alloted")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCustomers(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAllot = async (customerId: string) => {
    await fetch("/api/agent/allot-customer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerId,
        PB: 0,
        BH: 0,
        HT: 0,
        TIMES: 0,
        HINDU: 0,
      }),
    });

    // refresh list after allot
    setCustomers((prev) => prev.filter((c) => c._id !== customerId));
  };

  return (
    <div className="p-6 w-full h-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Available Customers (Not Allotted)</CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          {loading ? (
            <p className="text-sm opacity-70 text-center">Loading...</p>
          ) : customers.length === 0 ? (
            <p className="text-sm opacity-70 text-center">
              No available customers
            </p>
          ) : (
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell>
                      {customer.name} {customer.surname}
                    </TableCell>
                    <TableCell>{customer.mobile}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Not Allotted</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleAllot(customer._id)}
                      >
                        Allot
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
