
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  writeBatch,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { PreOrder } from "@/lib/types";
import { Check, X, Box, Eye, Ban } from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { useAuth } from "@/hooks/use-auth";

type GroupedPO = {
  poNumber: string;
  orders: PreOrder[];
  totalItems: number;
  totalValue: number;
  totalQuantity: number;
  status: PreOrder['status'];
  orderDate: string;
};

export default function ApprovalPage() {
  const [approvalItems, setApprovalItems] = React.useState<GroupedPO[]>([]);
  const [selectedPo, setSelectedPo] = React.useState<GroupedPO | null>(null);
  const [isDetailsOpen, setDetailsOpen] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const { user, loading: authLoading } = useAuth();

  React.useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    };
    const q = query(collection(db, "pre-orders"), where("status", "==", "Awaiting Approval"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const orders: PreOrder[] = [];
      querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as PreOrder);
      });

      const groups: { [key: string]: PreOrder[] } = {};
      orders.forEach(order => {
          if (!groups[order.poNumber]) {
              groups[order.poNumber] = [];
          }
          groups[order.poNumber].push(order);
      });

      const groupedPOs = Object.entries(groups).map(([poNumber, orders]) => ({
          poNumber,
          orders,
          totalItems: orders.length,
          totalValue: orders.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          totalQuantity: orders.reduce((sum, item) => sum + item.quantity, 0),
          status: orders[0].status,
          orderDate: orders[0].orderDate,
      }));

      setApprovalItems(groupedPOs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching approvals:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch approval items.",
      });
      setLoading(false);
    });

    return () => {
      unsubscribe();
    }
  }, [toast]);

  const handleDecision = async (po: GroupedPO, decision: "approved" | "rejected") => {
    if (!db) return;
    const newStatus = decision === "approved" ? "Approved" : "Rejected";
    
    try {
        const batch = writeBatch(db);
        po.orders.forEach(order => {
            if (!db) return;
            const orderRef = doc(db, "pre-orders", order.id);
            batch.update(orderRef, { status: newStatus });
        });
        await batch.commit();

        toast({
          title: `Pre-Order ${decision}`,
          description: `The pre-order ${po.poNumber} has been ${decision}.`,
        });
        
    } catch(error) {
        console.error("Failed to update pre-order status", error);
        toast({
            variant: "destructive",
            title: "Error updating pre-order status",
        });
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }
  
  const handleViewDetails = (po: GroupedPO) => {
    setSelectedPo(po);
    setDetailsOpen(true);
  };

  if (loading || authLoading) {
    return <FullPageSpinner />;
  }
  
  if (user && user.email === 'kreztservice@gmail.com') {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] text-center">
        <div className="p-4 bg-destructive/10 rounded-full mb-4">
            <Ban className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground max-w-sm">
            You do not have permission to view this page. Please contact an administrator if you believe this is an error.
        </p>
      </div>
    );
  }

  if (!db) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Firebase Not Configured</AlertTitle>
          <AlertDescription>
            Please configure your Firebase credentials in the environment variables to use this application.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Approval Stationery</h1>
        <p className="text-muted-foreground">
          Review and approve or reject pending pre-orders.
        </p>
      </header>
      
      {approvalItems.length > 0 ? (
        <div className="space-y-4">
          {approvalItems.map((po) => (
            <Card key={po.poNumber}>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-y-2">
                <div className="flex items-center gap-3">
                   <div className="p-3 bg-primary/10 rounded-lg">
                      <Box className="h-6 w-6 text-primary" />
                   </div>
                   <div>
                      <CardTitle>{po.poNumber}</CardTitle>
                       <Badge variant="warning">{po.status}</Badge>
                   </div>
                </div>
                 <div className="text-left sm:text-right text-sm text-muted-foreground w-full sm:w-auto">
                    <div>{format(new Date(po.orderDate), "MMM d, yyyy")}</div>
                    <div>{format(new Date(po.orderDate), "p")}</div>
                  </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Request Details</p>
                        <p>{po.totalItems} Items • {po.totalQuantity} Units</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                        <p className="font-semibold text-lg">{formatCurrency(po.totalValue)}</p>
                    </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap justify-end gap-2">
                 <Button variant="outline" onClick={() => handleViewDetails(po)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Button>
                <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDecision(po, "rejected")}>
                  <X className="mr-2 h-4 w-4" /> Reject
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleDecision(po, "approved")}>
                  <Check className="mr-2 h-4 w-4" /> Approve
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-24">
          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-2xl font-bold tracking-tight">
              No pending approvals
            </h3>
            <p className="text-sm text-muted-foreground">
              There are currently no items that require your approval.
            </p>
          </div>
        </div>
      )}
      
      <Dialog open={isDetailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Details for {selectedPo?.poNumber}</DialogTitle>
            <DialogDescription>
              A detailed list of all items in this pre-order.
            </DialogDescription>
          </DialogHeader>
          {selectedPo && (
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPo.orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.itemName}</TableCell>
                          <TableCell>{order.unit}</TableCell>
                          <TableCell className="text-right">{order.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(order.price)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(order.price * order.quantity)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
