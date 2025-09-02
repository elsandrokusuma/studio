
"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  collection,
  query,
  where,
  getDocs,
  documentId,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SparepartRequest } from "@/lib/types";
import { Printer } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FullPageSpinner } from "@/components/full-page-spinner";

type GroupedOrders = {
  requestNumber: string;
  requester: string;
  location: string;
  requestDate: string;
  items: SparepartRequest[];
};

function SparepartOrderContent({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const [groupedOrders, setGroupedOrders] = React.useState<GroupedOrders[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchOrders = async () => {
        if (!db) {
            setError("Firebase not configured. Please check your environment variables.");
            setLoading(false);
            return;
        }

        const idsParam = searchParams?.ids;
        const ids = typeof idsParam === 'string' ? idsParam.split(",") : [];

        if (!ids || ids.length === 0) {
            setGroupedOrders([]);
            setLoading(false);
            return;
        };

        try {
            const q = query(collection(db, "sparepart-requests"), where(documentId(), "in", ids));
            const querySnapshot = await getDocs(q);
            const selectedOrders: SparepartRequest[] = [];
            querySnapshot.forEach((doc) => {
                selectedOrders.push({ id: doc.id, ...doc.data() } as SparepartRequest);
            });
            
            const groups: { [key: string]: SparepartRequest[] } = {};
            selectedOrders.forEach(order => {
                if (!groups[order.requestNumber]) {
                    groups[order.requestNumber] = [];
                }
                groups[order.requestNumber].push(order);
            });

            const groupedData = Object.values(groups).map(items => ({
              requestNumber: items[0].requestNumber,
              requester: items[0].requester,
              location: items[0].location,
              requestDate: items[0].requestDate,
              items: items,
            }));

            setGroupedOrders(groupedData);

        } catch (error) {
            console.error("Failed to fetch sparepart requests from Firestore", error);
            setError("Failed to fetch order details.");
        } finally {
            setLoading(false);
        }
    };
    
    fetchOrders();
  }, [searchParams]);

  const handlePrint = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  if (loading) {
    return <FullPageSpinner />;
  }
  
  if (error) {
     return (
      <div className="flex items-center justify-center h-full">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (groupedOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h1 className="text-2xl font-bold mb-2">No Orders Found</h1>
        <p className="text-muted-foreground">
          The requested orders could not be found or no orders were selected.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
       <style>
        {`
          @media print {
            body {
              background-color: #fff;
            }
            .no-print {
              display: none;
            }
            .printable-area {
              border: none;
              box-shadow: none;
              margin: 0;
              padding: 0;
            }
          }
        `}
      </style>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-8 no-print">
            <h1 className="text-3xl font-bold tracking-tight">Sparepart Order</h1>
            <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
            </Button>
        </div>

        {groupedOrders.map(orderGroup => (
            <Card key={orderGroup.requestNumber} className="printable-area p-8 mb-8">
            <CardContent>
                <header className="mb-12">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-primary">SPAREPART ORDER</h2>
                        <p className="text-muted-foreground">{orderGroup.requestNumber}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="font-bold text-lg">Stationery Inventory</h3>
                        <p className="text-sm text-muted-foreground">{orderGroup.location}, {today}</p>
                    </div>
                </div>
                </header>

                <main className="mb-12">
                <div className="mb-6">
                    <p className="mb-1 text-muted-foreground">Requester:</p>
                    <p className="font-semibold">{orderGroup.requester}</p>
                </div>
                
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50%]">Item Name</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {orderGroup.items.map((item) => (
                        <TableRow key={item.id}>
                        <TableCell className="font-medium">
                            {item.itemName}
                        </TableCell>
                        <TableCell>{item.company}</TableCell>
                        <TableCell className="text-right">
                            {item.revisedQuantity ?? item.quantity}
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </main>

                <footer className="pt-12">
                <div className="flex justify-between text-center">
                    <div>
                    <p className="mb-16">Admin</p>
                    <p>(.........................)</p>
                    </div>
                    <div>
                    <p className="mb-16">Approval HRD,</p>
                    <p>(.........................)</p>
                    </div>
                </div>
                </footer>
            </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}

export default function SparepartOrderPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  return (
    <React.Suspense fallback={<FullPageSpinner />}>
      <SparepartOrderContent searchParams={searchParams} />
    </React.Suspense>
  )
}
