
"use client";

import * as React from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Papa from "papaparse";

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
    PlusCircle,
    Trash2,
    Upload,
    ChevronDown
} from "lucide-react";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { SparepartRequest } from "@/lib/types";
import { format } from "date-fns";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";


type GroupedRequest = {
  requestNumber: string;
  requests: SparepartRequest[];
  totalItems: number;
  totalQuantity: number;
  status: SparepartRequest['status'];
  requester: string;
  requestDate: string;
};

type POItem = {
  id: number;
  itemName: string;
  company: string;
  quantity: number | string;
};

export default function ApprovalSparepartPage() {
  const [approvalItems, setApprovalItems] = React.useState<GroupedRequest[]>([]);
  const [allRequests, setAllRequests] = React.useState<SparepartRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = React.useState<GroupedRequest | null>(null);
  const [isDetailsOpen, setDetailsOpen] = React.useState(false);
  const [isCreatePoOpen, setCreatePoOpen] = React.useState(false);
  const [isImportOpen, setImportOpen] = React.useState(false);
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);

  // State for Create PO Dialog
  const [poItems, setPoItems] = React.useState<POItem[]>([{ id: 1, itemName: '', company: '', quantity: 1 }]);
  const [requesterName, setRequesterName] = React.useState('');
  const [location, setLocation] = React.useState('Jakarta');

  // State for CSV import
  const [csvFile, setCsvFile] = React.useState<File | null>(null);
  const [isImporting, setIsImporting] = React.useState(false);


  React.useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    
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
  
  // Handlers for Create PO Dialog
  const handleAddItem = () => {
    setPoItems([...poItems, { id: Date.now(), itemName: '', company: '', quantity: 1 }]);
  };

  const handleRemoveItem = (id: number) => {
    setPoItems(poItems.filter(item => item.id !== id));
  };

  const handleItemChange = (id: number, field: keyof Omit<POItem, 'id'>, value: string) => {
    setPoItems(poItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const resetPoForm = () => {
    setRequesterName('');
    setLocation('Jakarta');
    setPoItems([{ id: 1, itemName: '', company: '', quantity: 1 }]);
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    if (!requesterName.trim() || poItems.some(item => !item.itemName.trim() || !item.company.trim() || Number(item.quantity) <= 0)) {
      toast({ variant: "destructive", title: "Validation Error", description: "Please fill all required fields." });
      return;
    }

    try {
      const querySnapshot = await getDocs(query(collection(db, "sparepart-requests")));
      const existingRequests: SparepartRequest[] = [];
      querySnapshot.forEach((doc) => {
        existingRequests.push(doc.data() as SparepartRequest);
      });
      
      const highestReqNum = existingRequests
          .map(req => parseInt(req.requestNumber.replace('SP-', ''), 10))
          .reduce((max, num) => isNaN(num) ? max : Math.max(max, num), 0);
        
      const newReqNum = highestReqNum + 1;
      const formattedReqNum = `SP-${String(newReqNum).padStart(3, '0')}`;

      const batch = writeBatch(db);

      poItems.forEach(item => {
        const docRef = doc(collection(db, "sparepart-requests"));
        const newRequest: Omit<SparepartRequest, 'id'> = {
          requestNumber: formattedReqNum,
          itemName: item.itemName,
          company: item.company,
          quantity: Number(item.quantity),
          requester: `${requesterName} (${location})`,
          requestDate: new Date().toISOString(),
          status: 'Awaiting Approval'
        };
        batch.set(docRef, newRequest);
      });
      
      await batch.commit();
      
      toast({ title: "Request Created", description: `Request ${formattedReqNum} has been submitted for approval.` });
      setCreatePoOpen(false);
      resetPoForm();
    } catch (error) {
      console.error("Error creating request:", error);
      toast({ variant: "destructive", title: "Failed to create request." });
    }
  };
  
  const handleImportCsv = async () => {
    if (!csvFile) {
        toast({ variant: "destructive", title: "No file selected" });
        return;
    }
    if (!db) return;

    setIsImporting(true);

    Papa.parse(csvFile, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
            const newRequests = results.data as { itemName: string; company: string; quantity: string; requester: string; location: string }[];

            if (!newRequests || newRequests.length === 0) {
                toast({ variant: "destructive", title: "CSV is empty or invalid" });
                setIsImporting(false);
                return;
            }

            try {
                const querySnapshot = await getDocs(query(collection(db, "sparepart-requests")));
                const existingRequests: SparepartRequest[] = [];
                querySnapshot.forEach((doc) => {
                  existingRequests.push(doc.data() as SparepartRequest);
                });

                const highestReqNum = existingRequests
                  .map(req => parseInt(req.requestNumber.replace('SP-', ''), 10))
                  .reduce((max, num) => isNaN(num) ? max : Math.max(max, num), 0);
                
                const newReqNum = highestReqNum + 1;
                const formattedReqNum = `SP-${String(newReqNum).padStart(3, '0')}`;
                
                const batch = writeBatch(db);
                const validNewRequests = newRequests.filter(req => typeof req === 'object' && req !== null && req.itemName);

                validNewRequests.forEach(req => {
                    const docRef = doc(collection(db, "sparepart-requests"));
                    
                    const newRequestData: Omit<SparepartRequest, 'id'> = {
                        requestNumber: formattedReqNum,
                        itemName: req.itemName || "",
                        company: req.company || "",
                        quantity: Number(req.quantity) || 0,
                        requester: `${req.requester || 'N/A'} (${req.location || 'Jakarta'})`,
                        requestDate: new Date().toISOString(),
                        status: 'Awaiting Approval'
                    };

                    batch.set(docRef, newRequestData);
                });

                await batch.commit();

                toast({
                    title: "Import Successful",
                    description: `${validNewRequests.length} requests have been added with PO Number ${formattedReqNum}.`,
                });

                setImportOpen(false);
                setCsvFile(null);
            } catch (error) {
                console.error("Error importing data: ", error);
                toast({
                    variant: "destructive",
                    title: "Import Failed",
                    description: "Could not write data to the database. Check console for details.",
                });
            } finally {
                setIsImporting(false);
            }
        },
        error: (error) => {
            toast({
                variant: "destructive",
                title: "CSV Parsing Error",
                description: error.message,
            });
            setIsImporting(false);
        },
    });
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
        <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  Actions
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setCreatePoOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Request
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setImportOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import from CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>

      </header>
      
      <Dialog open={isCreatePoOpen} onOpenChange={setCreatePoOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Sparepart Request</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new sparepart request.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateRequest}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="requesterName">Requester Name</Label>
                            <Input id="requesterName" placeholder="e.g. John Doe" value={requesterName} onChange={(e) => setRequesterName(e.target.value)} />
                        </div>
                        <div>
                            <Label>Location</Label>
                             <RadioGroup defaultValue="Jakarta" className="flex items-center gap-4 pt-2" value={location} onValueChange={setLocation}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Jakarta" id="jakarta" />
                                    <Label htmlFor="jakarta">Jakarta</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Surabaya" id="surabaya" />
                                    <Label htmlFor="surabaya">Surabaya</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <Label>Items</Label>
                        <ScrollArea className="h-48 w-full rounded-md border p-2">
                             <div className="space-y-3">
                                {poItems.map((item, index) => (
                                    <div key={item.id} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
                                        <Input placeholder="Name item" value={item.itemName} onChange={(e) => handleItemChange(item.id, 'itemName', e.target.value)} />
                                        <Input placeholder="Company" value={item.company} onChange={(e) => handleItemChange(item.id, 'company', e.target.value)} />
                                        <Input type="number" min="1" className="w-24" placeholder="qty request" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)} disabled={poItems.length === 1}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <Button type="button" variant="outline" className="w-full" onClick={handleAddItem}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                        </Button>
                    </div>
                </div>
                 <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setCreatePoOpen(false)}>Cancel</Button>
                    <Button type="submit">Create Request</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
           <Dialog open={isImportOpen} onOpenChange={setImportOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import from CSV</DialogTitle>
                <DialogDescription>
                  Upload a CSV file to add sparepart requests in bulk. The file must have columns: `itemName`, `company`, `quantity`, `requester`, `location`.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  <Label htmlFor="csv-file">CSV File</Label>
                  <Input 
                    id="csv-file" 
                    type="file" 
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files ? e.target.files[0] : null)}
                  />
              </div>
              <DialogFooter>
                <Button onClick={handleImportCsv} disabled={!csvFile || isImporting}>
                  {isImporting ? 'Importing...' : 'Import Data'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
                        <TableHead>Company</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedRequest.requests.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.itemName}</TableCell>
                          <TableCell>{order.company}</TableCell>
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
