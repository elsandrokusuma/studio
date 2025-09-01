
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
  getDocs,
  updateDoc,
  deleteDoc,
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
    DollarSign,
    Folder,
    Search,
    Calendar as CalendarIcon,
    MoreHorizontal,
    Pencil,
    MapPin,
    FileDown,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { SparepartRequest } from "@/lib/types";
import { format } from "date-fns";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";


type GroupedRequest = {
  requestNumber: string;
  requests: SparepartRequest[];
  totalItems: number;
  totalQuantity: number;
  status: SparepartRequest['status'];
  requester: string;
  requestDate: string;
  location: string;
};

type POItem = {
  id: number;
  itemName: string;
  company: string;
  quantity: number | string;
};

export default function ApprovalSparepartPage() {
  const [allRequests, setAllRequests] = React.useState<SparepartRequest[]>([]);
  const [isCreatePoOpen, setCreatePoOpen] = React.useState(false);
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  // State for Create PO Dialog
  const [poItems, setPoItems] = React.useState<POItem[]>([{ id: 1, itemName: '', company: '', quantity: 1 }]);
  const [requesterName, setRequesterName] = React.useState('');
  const [location, setLocation] = React.useState('Jakarta');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Filtering and searching states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [dateFilter, setDateFilter] = React.useState<Date | undefined>();
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const [openAccordion, setOpenAccordion] = React.useState<string | undefined>();
  
  // States for editing individual items
  const [isEditItemOpen, setEditItemOpen] = React.useState(false);
  const [selectedOrderItem, setSelectedOrderItem] = React.useState<SparepartRequest | null>(null);
  const [revisedQuantity, setRevisedQuantity] = React.useState<number | string>('');
  
  // States for deleting a PO
  const [isDeleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedPo, setSelectedPo] = React.useState<GroupedRequest | null>(null);


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
      setLoading(false);
    }, (error) => {
      console.error("Error fetching all sparepart requests:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch sparepart requests.",
      });
      setLoading(false);
    });

    return () => {
        unsubscribeAll();
    };
  }, [toast]);
  
  const handleItemDecision = async (item: SparepartRequest, decision: 'Approved' | 'Rejected') => {
    if (!db) return;

    try {
        const itemRef = doc(db, "sparepart-requests", item.id);
        await updateDoc(itemRef, { itemStatus: decision });
        
        toast({
          title: `Item ${decision}`,
          description: `Item ${item.itemName} has been ${decision}.`,
        });

    } catch(error) {
        console.error("Failed to update item status", error);
        toast({
            variant: "destructive",
            title: "Error updating item status",
        });
    }
  };

  const handleEditItem = (item: SparepartRequest) => {
    setSelectedOrderItem(item);
    setRevisedQuantity(item.revisedQuantity || item.quantity);
    setEditItemOpen(true);
  };
  
  const handleSaveRevisedQuantity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderItem || !db) return;
    
    const newQuantity = Number(revisedQuantity);
    if (isNaN(newQuantity) || newQuantity < 0) {
      toast({ variant: "destructive", title: "Invalid Quantity", description: "Please enter a valid number." });
      return;
    }

    try {
      const itemRef = doc(db, "sparepart-requests", selectedOrderItem.id);
      await updateDoc(itemRef, { revisedQuantity: newQuantity });
      
      toast({ title: "Quantity Revised", description: `Quantity for ${selectedOrderItem.itemName} updated.` });
      setEditItemOpen(false);
      setSelectedOrderItem(null);
      setRevisedQuantity('');
    } catch (error) {
      console.error("Failed to revise quantity", error);
      toast({ variant: "destructive", title: "Error revising quantity" });
    }
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
          .map(req => parseInt(req.requestNumber.split('-')[2], 10))
          .reduce((max, num) => isNaN(num) ? max : Math.max(max, num), 0);
        
      const newReqNum = highestReqNum + 1;
      const locationPrefix = location === 'Jakarta' ? 'JKT' : 'SBY';
      const formattedReqNum = `PO-${locationPrefix}-${String(newReqNum).padStart(3, '0')}`;

      const batch = writeBatch(db);

      poItems.forEach(item => {
        const docRef = doc(collection(db, "sparepart-requests"));
        const newRequest: Omit<SparepartRequest, 'id'> = {
          requestNumber: formattedReqNum,
          itemName: item.itemName,
          company: item.company,
          quantity: Number(item.quantity),
          requester: requesterName,
          requestDate: new Date().toISOString(),
          status: 'Pending',
          itemStatus: 'Pending',
          location: location,
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
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData = results.data as { [key: string]: string }[];
        
        if (parsedData.length === 0) {
          toast({
            variant: 'destructive',
            title: 'Empty File',
            description: 'The selected CSV file is empty or has an invalid format.',
          });
          return;
        }

        const newItems = parsedData.map((row, index) => {
            const findValue = (keys: string[]) => {
                for (const key of keys) {
                    if (row[key]) return row[key];
                }
                return '';
            };
            
            const itemName = findValue(['itemName', 'item name', 'Name Item', 'nama barang']);
            const company = findValue(['company', 'Company', 'perusahaan']);
            const quantity = findValue(['quantity', 'qty', 'Quantity', 'jumlah']);

            return {
              id: Date.now() + index,
              itemName: itemName,
              company: company,
              quantity: quantity || 1,
            };
        }).filter(item => item.itemName);
        
        if (newItems.length === 0) {
            toast({
              variant: 'destructive',
              title: 'Invalid Data',
              description: 'Could not find valid item data in the CSV. Make sure columns are named correctly (e.g., itemName, company, quantity).',
            });
            return;
        }
        
        setPoItems(newItems);

        toast({
          title: 'Import Successful',
          description: `${newItems.length} items have been loaded into the form.`,
        });
      },
      error: (error) => {
        toast({
          variant: 'destructive',
          title: 'CSV Parsing Error',
          description: error.message,
        });
      },
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
   const handleDeleteRequest = async () => {
    if (!selectedPo || !db) return;
    
    try {
      const batch = writeBatch(db);
      selectedPo.requests.forEach(request => {
        const docRef = doc(db, "sparepart-requests", request.id);
        batch.delete(docRef);
      });
      await batch.commit();

      toast({
        title: "Request Deleted",
        description: `Request ${selectedPo.requestNumber} has been deleted.`,
      });

    } catch (error) {
      console.error("Error deleting request:", error);
      toast({
        variant: "destructive",
        title: "Failed to delete request.",
      });
    } finally {
      setDeleteOpen(false);
      setSelectedPo(null);
    }
  };

  const groupedRequests = React.useMemo(() => {
    const groups: { [key: string]: SparepartRequest[] } = {};
    allRequests.forEach(order => {
        if (!groups[order.requestNumber]) {
            groups[order.requestNumber] = [];
        }
        groups[order.requestNumber].push(order);
    });

    return Object.entries(groups).map(([requestNumber, requests]) => {
      const allApproved = requests.every(r => r.itemStatus === 'Approved');
      const anyRejected = requests.some(r => r.itemStatus === 'Rejected');
      let overallStatus: SparepartRequest['status'] = 'Pending';

      if (allApproved) {
        overallStatus = 'Approved';
      } else if (anyRejected) {
        overallStatus = 'Rejected';
      }

      const requester = requests[0]?.requester || '';
      const location = requests[0]?.location || 'Unknown';

      return {
          requestNumber,
          requests,
          totalItems: requests.length,
          totalQuantity: requests.reduce((sum, item) => sum + (item.revisedQuantity ?? item.quantity), 0),
          status: overallStatus,
          requester,
          requestDate: requests[0].requestDate,
          location: location
      }
    }).filter(req => req.requests.length > 0);
  }, [allRequests]);
  
  const filteredRequests = React.useMemo(() => {
    return groupedRequests.filter(req => {
        const searchLower = searchQuery.toLowerCase();
        const searchMatch = !searchQuery || 
            req.requestNumber.toLowerCase().includes(searchLower) ||
            req.requester.toLowerCase().includes(searchLower) ||
            req.requests.some(item => item.itemName.toLowerCase().includes(searchLower) || item.company.toLowerCase().includes(searchLower));

        const statusMatch = statusFilter === 'all' || req.status === statusFilter;
        const dateMatch = !dateFilter || format(new Date(req.requestDate), 'yyyy-MM-dd') === format(dateFilter, 'yyyy-MM-dd');

        return searchMatch && statusMatch && dateMatch;
    });
  }, [groupedRequests, searchQuery, statusFilter, dateFilter]);

  const totalRequestsCount = new Set(allRequests.map(r => r.requestNumber)).size;
  const totalLineItems = allRequests.length;
  const pendingCount = groupedRequests.filter(g => g.status === 'Pending').length;
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredRequests.map(req => req.requestNumber));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (requestNumber: string) => {
    setSelectedRows(prev =>
      prev.includes(requestNumber) ? prev.filter(rowId => rowId !== requestNumber) : [...prev, requestNumber]
    );
  };
  
  const isAllSelected = selectedRows.length > 0 && selectedRows.length === filteredRequests.length;

  const handleExportPdf = () => {
    if (selectedRows.length === 0) {
        toast({ variant: "destructive", title: "No POs selected to export" });
        return;
    }
    const selectedApprovedRequests = allRequests.filter(req => 
        selectedRows.includes(req.requestNumber) && req.itemStatus === 'Approved'
    );

    if (selectedApprovedRequests.length === 0) {
        toast({
            variant: "destructive",
            title: "No approved items to export",
            description: "Please select POs that contain approved items.",
        });
        return;
    }

    const ids = selectedApprovedRequests.map(req => req.id).join(',');
    router.push(`/sparepart-order?ids=${ids}`);
  };

  const handleExportCsv = () => {
    if (selectedRows.length === 0) {
      toast({ variant: "destructive", title: "No POs selected to export" });
      return;
    }
    const dataToExport = allRequests
      .filter(req => selectedRows.includes(req.requestNumber))
      .map(req => ({
        'Request Number': req.requestNumber,
        'Item Name': req.itemName,
        'Company': req.company,
        'Quantity': req.quantity,
        'Revised Quantity': req.revisedQuantity ?? '-',
        'Requester': req.requester,
        'Location': req.location,
        'Request Date': format(new Date(req.requestDate), "yyyy-MM-dd"),
        'Item Status': req.itemStatus,
      }));
    
    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "sparepart_requests_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Approval Sparepart
          </h1>
          <p className="text-muted-foreground text-sm">
            {totalRequestsCount} PO groups • {totalLineItems} line items
          </p>
        </div>
        <div className="flex items-center gap-2">
            {selectedRows.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <FileDown className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={handleExportCsv}>Export as CSV</DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleExportPdf}>Export as PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Dialog open={isCreatePoOpen} onOpenChange={setCreatePoOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Request
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Create Sparepart Request</DialogTitle>
                    <DialogDescription>
                      Fill in the details to create a new sparepart request. You can also import items from a CSV file.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateRequest}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 py-4">
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
                        <div className="space-y-2">
                             <div className="flex justify-between items-center">
                                <Label>Items</Label>
                                 <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                  >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Import from File
                                  </Button>
                                  <Input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".csv"
                                    onChange={handleFileSelect}
                                  />
                             </div>
                            <ScrollArea className="h-48 w-full rounded-md border p-2">
                                 <div className="space-y-3">
                                    {poItems.map((item) => (
                                        <div key={item.id} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
                                            <Input placeholder="Name item" value={item.itemName} onChange={(e) => handleItemChange(item.id, 'itemName', e.target.value)} />
                                            <Input placeholder="Company" value={item.company} onChange={(e) => handleItemChange(item.id, 'company', e.target.value)} />
                                            <Input type="number" min="1" className="w-24" placeholder="Qty" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} />
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
                        <Button type="button" variant="ghost" onClick={() => { setCreatePoOpen(false); resetPoForm(); }}>Cancel</Button>
                        <Button type="submit">Create Request</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="text-white" style={{ backgroundColor: 'hsl(var(--summary-card-1))' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total POs</CardTitle>
            <Folder className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalRequestsCount}</div>
          </CardContent>
        </Card>
        <Card className="text-white" style={{ backgroundColor: 'hsl(var(--summary-card-2))' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Line Items</CardTitle>
            <Boxes className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalLineItems}</div>
          </CardContent>
        </Card>
        <Card className="text-white" style={{ backgroundColor: 'hsl(var(--summary-card-3))' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <FileText className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
      </div>
      
       <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search PO or item..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-time">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={"outline"} className="w-full md:w-auto justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFilter ? format(dateFilter, "PPP") : <span>Pick date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateFilter} onSelect={setDateFilter} initialFocus />
            </PopoverContent>
          </Popover>
          <div className="flex items-center space-x-2">
            <Checkbox id="select-all" checked={isAllSelected} onCheckedChange={(checked) => handleSelectAll(Boolean(checked))} />
            <Label htmlFor="select-all" className="whitespace-nowrap">Select All</Label>
          </div>
          <Button variant="ghost" onClick={() => { setSearchQuery(""); setStatusFilter("all"); setDateFilter(undefined); setSelectedRows([]); }}>Clear Filters</Button>
        </CardContent>
      </Card>


      {filteredRequests.length > 0 ? (
        <Accordion type="single" collapsible className="w-full space-y-4" value={openAccordion} onValueChange={setOpenAccordion}>
          {filteredRequests.map((req) => (
             <AccordionItem value={req.requestNumber} key={req.requestNumber} className="border-0">
                <Card data-state={selectedRows.includes(req.requestNumber) ? "selected" : "unselected"} className="data-[state=selected]:ring-2 ring-primary relative overflow-hidden">
                    <div className={cn("absolute left-0 top-0 h-full w-1.5", 
                        req.status === 'Approved' ? 'bg-green-500' :
                        req.status === 'Rejected' ? 'bg-red-500' :
                        'bg-yellow-500'
                    )}></div>
                    <CardHeader className="p-4 pl-8">
                        <div className="flex items-start gap-4">
                            <Checkbox
                                checked={selectedRows.includes(req.requestNumber)}
                                onCheckedChange={() => handleSelectRow(req.requestNumber)}
                                aria-label={`Select request ${req.requestNumber}`}
                            />
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-semibold text-base">{req.requestNumber}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Badge variant={req.status === 'Approved' ? 'default' : req.status === 'Rejected' ? 'destructive' : 'warning'} className={req.status === 'Approved' ? 'bg-green-100 text-green-800' : ''}>
                                        {req.status}
                                    </Badge>
                                    <span>• {req.totalQuantity} units</span>
                                    <span className="hidden sm:inline-flex items-center"><MapPin className="h-3 w-3 mr-1"/>{req.location}</span>
                                </div>
                            </div>
                            <div className="text-right text-sm">
                                <div className="font-medium">{format(new Date(req.requestDate), "MMMM dd, yyyy")}</div>
                                <div className="text-muted-foreground">Req: {req.requester}</div>
                            </div>
                            <div className="flex items-center">
                                <AccordionTrigger className="p-2 hover:bg-muted rounded-md [&[data-state=open]>svg]:rotate-180" />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem>Mark as Approved</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-red-600 focus:text-red-700"
                                            onSelect={() => {
                                            setSelectedPo(req);
                                            setDeleteOpen(true);
                                            }}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </CardHeader>
                    <AccordionContent>
                        <CardContent className="p-4 pt-0 pl-8">
                             <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Item Name</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Qty Request</TableHead>
                                    <TableHead>Revisi Qty Request</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[50px]"><span className="sr-only">Actions</span></TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {req.requests.map((item) => (
                                    <TableRow key={item.id}>
                                      <TableCell className="font-medium">{item.itemName}</TableCell>
                                      <TableCell>{item.company}</TableCell>
                                      <TableCell>{item.quantity}</TableCell>
                                      <TableCell>{item.revisedQuantity ?? '-'}</TableCell>
                                      <TableCell>
                                        <Badge variant={
                                            item.itemStatus === 'Approved' ? 'default' :
                                            item.itemStatus === 'Rejected' ? 'destructive' :
                                            'warning'
                                        } className={item.itemStatus === 'Approved' ? 'bg-green-100 text-green-800' : ''}>
                                          {item.itemStatus || 'Pending'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEditItem(item)}>
                                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-green-600 focus:text-green-700" onClick={() => handleItemDecision(item, "Approved")}>
                                                <Check className="mr-2 h-4 w-4" /> Approve
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600 focus:text-red-700" onClick={() => handleItemDecision(item, "Rejected")}>
                                                <X className="mr-2 h-4 w-4" /> Reject
                                            </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                        </CardContent>
                    </AccordionContent>
                </Card>
             </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-24">
          <div className="flex flex-col items-center gap-4 text-center">
             <div className="p-4 bg-primary/10 rounded-full">
                <Wrench className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">
              No pending approvals found
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              There are currently no sparepart requests matching your filters.
            </p>
          </div>
        </div>
      )}

      {/* Edit Item Dialog */}
      <Dialog open={isEditItemOpen} onOpenChange={setEditItemOpen}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Edit Quantity: {selectedOrderItem?.itemName}</DialogTitle>
            <DialogDescription>
                Revise the quantity for this item. The original request will be preserved.
            </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveRevisedQuantity}>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="revised-quantity" className="text-right">
                    Revised Quantity
                </Label>
                <Input
                    id="revised-quantity"
                    type="number"
                    min="0"
                    className="col-span-3"
                    value={revisedQuantity}
                    onChange={(e) => setRevisedQuantity(e.target.value)}
                    required
                />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditItemOpen(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
            </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the request{' '}
              <span className="font-semibold">{selectedPo?.requestNumber}</span> and all its items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedPo(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRequest}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
