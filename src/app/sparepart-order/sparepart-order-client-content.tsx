
"use client";

import * as React from "react";
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

export type GroupedOrders = {
  requestNumber: string;
  requester: string;
  location: string;
  requestDate: string;
  items: SparepartRequest[];
};

export function SparepartOrderClientContent({ groupedOrders }: { groupedOrders: GroupedOrders[] }) {

  const handlePrint = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

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
              color: #000 !important; /* Force text to black for printing */
            }
             .printable-area h2, .printable-area h3, .printable-area p, .printable-area div, .printable-area th, .printable-area td {
               color: #000 !important;
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
                        <h2 className="text-2xl font-bold text-primary">SURAT JALAN</h2>
                        <p className="text-muted-foreground">{orderGroup.requestNumber}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="font-bold text-lg">Sparepart Inventory</h3>
                        <p className="text-sm text-muted-foreground">Surakarta, {today}</p>
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
                        <TableCell className="font-medium text-black">
                            {item.itemName}
                        </TableCell>
                        <TableCell className="text-black">{item.company}</TableCell>
                        <TableCell className="text-right text-black">
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
                    <p className="mb-16">Approval</p>
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
