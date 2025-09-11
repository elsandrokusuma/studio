
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
import type { PreOrder } from "@/lib/types";
import { Printer } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export function SuratJalanClientContent({ orders }: { orders: PreOrder[] }) {
  const { componentOpacity } = useTheme();

  const handlePrint = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h1 className="text-2xl font-bold mb-2">No Orders Found</h1>
        <p className="text-muted-foreground">
          The requested delivery orders could not be found or no orders were selected.
        </p>
      </div>
    );
  }
  
  const cardStyle = {
    '--component-opacity': componentOpacity,
    backgroundColor: `hsl(var(--card) / var(--component-opacity))`,
  } as React.CSSProperties;

  return (
    <div className="bg-background text-foreground min-h-screen">
       <style>
        {`
          @media print {
            body {
              background-color: #fff !important;
              background-image: none !important;
            }
            .no-print {
              display: none;
            }
            .printable-area {
              border: none !important;
              box-shadow: none !important;
              margin: 0 !important;
              padding: 0 !important;
              background-color: #fff !important;
            }
             .printable-area, .printable-area * {
               color: #000 !important;
             }
          }
        `}
      </style>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-8 no-print">
            <h1 className="text-3xl font-bold tracking-tight">Surat Jalan</h1>
            <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
            </Button>
        </div>

        <Card 
          className="printable-area p-8"
          style={cardStyle}
        >
          <CardContent>
            <header className="mb-12">
              <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-primary">SURAT JALAN</h2>
                    <p className="text-muted-foreground">Delivery Order</p>
                  </div>
                  <div className="text-right">
                    <h3 className="font-bold text-lg">Stationery Inventory</h3>
                    <p className="text-sm text-muted-foreground">Surakarta, {today}</p>
                  </div>
              </div>
            </header>

            <main className="mb-12">
               <div className="mb-6">
                <p className="mb-1 text-muted-foreground">Kepada Yth,</p>
                <div className="w-1/2 h-20 border-b-2 border-dashed">
                  {/* Recipient area */}
                </div>
              </div>
              <p className="mb-4 text-muted-foreground">
                Dengan hormat, Bersama ini kami membuat re-order barang-barang ATK sebagai berikut:
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60%] text-foreground font-semibold">Nama Barang</TableHead>
                    <TableHead className="text-foreground font-semibold">Unit</TableHead>
                    <TableHead className="text-right text-foreground font-semibold">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="border-b">
                      <TableCell className="font-medium text-foreground">
                        {order.itemName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{order.unit}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {order.quantity}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </main>

            <footer className="pt-12">
              <div className="flex justify-between text-center">
                <div>
                  <p className="mb-16">Hormat Kami,</p>
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
      </div>
    </div>
  );
}
