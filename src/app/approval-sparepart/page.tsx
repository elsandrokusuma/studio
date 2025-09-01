
"use client";

import * as React from "react";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Wrench,
    FileText,
    Boxes,
    Clock,
    Check,
    X,
    Eye,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { SparepartRequest } from "@/lib/types";
import { format } from "date-fns";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


type GroupedRequest = {
  requestNumber: string;
  requests: SparepartRequest[];
  totalItems: number;
  totalQuantity: number;
  status: SparepartRequest['status'];
  requester: string;
  requestDate: string;
};

export default function ApprovalSparepartPage() {
  const [approvalItems, setApprovalItems] = React.useState<GroupedRequest[]>([]);
  const [allRequests, setAllRequests] = React.useState<SparepartRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = React.useState<GroupedRequest | null>(null);
  const [isDetailsOpen, setDetailsOpen] = React.useState(false);
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    
    // Listener for all requests to populate summary cards
    const qAll = query(collection(db, "sparepart-requests"));
    const unsubscribeAll = onSnapshot(qAll, (querySnapshot) => {
      const requests: SparepartRequest[] = [];
      querySnapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() } as SparepartRequest);
      });
      setAllRequests(requests);
    }, (error) => {
      console.error("Error fetching all sparepart requests:", error);
    });

    // Listener for requests awaiting approval
    const qApproval = query(collection(db, "sparepart-requests"), where("status", "==", "Awaiting Approval"));
    const unsubscribeApproval = onSnapshot(qApproval, (querySnapshot) => {
      const orders: SparepartRequest[] = [];
      querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as SparepartRequest);
      });

      const groups: { [key: string]: SparepartRequest[] } = {};
      orders.forEach(order => {
          if (!groups[order.requestNumber]) {
              groups[order.requestNumber] = [];
          }
          groups[order.requestNumber].push(order);
      });

      const groupedRequests = Object.entries(groups).map(([requestNumber, requests]) => ({
          requestNumber,
          requests,
          totalItems: requests.length,
          totalQuantity: requests.reduce((sum, item) => sum + item.quantity, 0),
          status: requests[0].status,
          requester: requests[0].requester,
          requestDate: requests[0].requestDate,
      }));

      setApprovalItems(groupedRequests);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching sparepart approvals:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch sparepart approval items.",
      });
      setLoading(false);
    });

    return () => {
        unsubscribeAll();
        unsubscribeApproval();
    };
  }, [toast]);
  
  const handleDecision = async (req: GroupedRequest, decision: "approved" | "rejected") => {
    if (!db) return;
    const newStatus = decision === "approved" ? "Approved" : "Rejected";
    
    try {
        const batch = writeBatch(db);
        req.requests.forEach(order => {
            if (!db) return;
            const orderRef = doc(db, "sparepart-requests", order.id);
            batch.update(orderRef, { status: newStatus });
        });
        await batch.commit();

        toast({
          title: `Request ${decision}`,
          description: `The request ${req.requestNumber} has been ${decision}.`,
        });
        
    } catch(error) {
        console.error("Failed to update request status", error);
        toast({
            variant: "destructive",
            title: "Error updating request status",
        });
    }
  };

  const handleViewDetails = (req: GroupedRequest) => {
    setSelectedRequest(req);
    setDetailsOpen(true);
  };

  const totalRequestsCount = new Set(allRequests.map(r => r.requestNumber)).size;
  const totalItemsCount = allRequests.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return <FullPageSpinner />;
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
    <div className="flex flex-col gap-6">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg hidden sm:block">
            <Wrench className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Approval Sparepart
            </h1>
            <p className="text-muted-foreground">
              {approvalItems.length} Requests Awaiting Approval
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="text-white" style={{ backgroundColor: 'hsl(var(--summary-card-1))' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalRequestsCount}</div>
          </CardContent>
        </Card>
        <Card className="text-white" style={{ backgroundColor: 'hsl(var(--summary-card-2))' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items Requested</CardTitle>
            <Boxes className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalItemsCount}</div>
          </CardContent>
        </Card>
        <Card className="text-white" style={{ backgroundColor: 'hsl(var(--summary-card-3))' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{approvalItems.length}</div>
          </CardContent>
        </Card>
      </div>

      {approvalItems.length > 0 ? (
        <div className="space-y-4">
          {approvalItems.map((req) => (
            <Card key={req.requestNumber}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                     <div className="p-3 bg-primary/10 rounded-lg">
                        <Wrench className="h-6 w-6 text-primary" />
                     </div>
                     <div>
                        <CardTitle>{req.requestNumber}</CardTitle>
                         <p className="text-sm text-muted-foreground">by {req.requester}</p>
                     </div>
                  </div>
                </div>
                 <div className="text-right text-sm text-muted-foreground">
                    <div>{format(new Date(req.requestDate), "MMM d, yyyy")}</div>
                  </div>
              </CardHeader>
              <CardContent>
                 <p className="text-sm font-medium text-muted-foreground">Request Details</p>
                 <p>{req.totalItems} Items • {req.totalQuantity} Units</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                 <Button variant="outline" onClick={() => handleViewDetails(req)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Button>
                <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDecision(req, "rejected")}>
                  <X className="mr-2 h-4 w-4" /> Reject
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleDecision(req, "approved")}>
                  <Check className="mr-2 h-4 w-4" /> Approve
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-24">
          <div className="flex flex-col items-center gap-4 text-center">
             <div className="p-4 bg-primary/10 rounded-full">
                <Wrench className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">
              No pending approvals
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              There are currently no sparepart requests that require your approval.
            </p>
          </div>
        </div>
      )}

       <Dialog open={isDetailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Details for {selectedRequest?.requestNumber}</DialogTitle>
            <DialogDescription>
              A detailed list of all items in this sparepart request.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Item Code</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedRequest.requests.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.itemName}</TableCell>
                          <TableCell>{order.itemCode}</TableCell>
                          <TableCell className="text-right">{order.quantity}</TableCell>
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

    