
"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  writeBatch,
  query,
  orderBy,
  deleteDoc
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
} from "@/components/ui/alert-dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, MoreHorizontal, Send, Calendar as CalendarIcon, X, FileDown, Trash2, Folder, Box, CalendarDays, Undo2, ChevronsUpDown, Check, Pencil, CheckCircle } from "lucide-react";
import type { PreOrder, InventoryItem } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


type GroupedPO = {
  poNumber: string;
  orders: PreOrder[];
  totalItems: number;
  totalValue: number;
  totalQuantity: number;
  status: PreOrder['status'];
  orderDate: string;
  expectedDate: string;
};

function PreOrdersContent() {
  const [preOrders, setPreOrders] = React.useState<PreOrder[]>([]);
  const [inventoryItems, setInventoryItems] = React.useState<InventoryItem[]>([]);
  const [isCreateOpen, setCreateOpen] = React.useState(false);
  const [isDeleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedPo, setSelectedPo] = React.useState<GroupedPO | null>(null);
  const { toast } = useToast();
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [dateFilter, setDateFilter] = React.useState<Date | undefined>(undefined);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedUnit, setSelectedUnit] = React.useState<string | undefined>();
  const [poPrice, setPoPrice] = React.useState<number | string>("");
  const [activePoNumber, setActivePoNumber] = React.useState<string>("");
  const [isCreatingNewPo, setIsCreatingNewPo] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  // States for editing/deleting individual items
  const [isEditItemOpen, setEditItemOpen] = React.useState(false);
  const [isDeleteItemOpen, setDeleteItemOpen] = React.useState(false);
  const [selectedOrderItem, setSelectedOrderItem] = React.useState<PreOrder | null>(null);

  // State for combobox
  const [comboPoOpen, setComboPoOpen] = React.useState(false);
  const [selectedItemId, setSelectedItemId] = React.useState<string | undefined>();
  const [selectedItemName, setSelectedItemName] = React.useState<string>("Select an item...");
  
  React.useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const qPreOrders = query(collection(db, "pre-orders"), orderBy("orderDate", "desc"));
    const unsubscribePreOrders = onSnapshot(qPreOrders, (querySnapshot) => {
      const orders: PreOrder[] = [];
      querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as PreOrder);
      });
      setPreOrders(orders);
      setLoading(false);
    }, () => setLoading(false));

    const qInventory = query(collection(db, "inventory"), orderBy("name"));
    const unsubscribeInventory = onSnapshot(qInventory, (querySnapshot) => {
      const items: InventoryItem[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as InventoryItem);
      });
      setInventoryItems(items);
    });

    return () => {
      unsubscribePreOrders();
      unsubscribeInventory();
    };
  }, []);
  
  React.useEffect(() => {
    const create = searchParams.get('create');
    const itemId = searchParams.get('itemId');

    if (create === 'true' && itemId) {
        setSelectedItemId(itemId);
        const item = inventoryItems.find(i => i.id === itemId);
        if (item) {
          setSelectedItemName(item.name);
          setPoPrice(item.price);
        }
        setCreateOpen(true);
        // Clean up URL params
        router.replace('/pre-orders', { scroll: false });
    }
  }, [searchParams, router, inventoryItems]);

  React.useEffect(() => {
    const pendingPO = preOrders.find(po => po.status === 'Pending');
    
    if (pendingPO) {
        setActivePoNumber(pendingPO.poNumber);
        setIsCreatingNewPo(false);
    } else {
        const highestPoNum = preOrders
          .map(po => parseInt(po.poNumber.replace('POATK-', ''), 10))
          .reduce((max, num) => isNaN(num) ? max : Math.max(max, num), 0);
        
        const newPoNum = highestPoNum + 1;
        const formattedPoNum = `POATK-${String(newPoNum).padStart(3, '0')}`;
        setActivePoNumber(formattedPoNum);
        setIsCreatingNewPo(true);
    }
  }, [preOrders]);


  const handleCreatePreOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db) return;
    const formData = new FormData(e.currentTarget);
    const selectedItem = inventoryItems.find(i => i.id === selectedItemId);

    if (!selectedItem) {
        toast({ variant: "destructive", title: "Please select an item." });
        return;
    };

    const newPreOrderData: Omit<PreOrder, 'id'> = {
      poNumber: activePoNumber,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      price: Number(formData.get("price")),
      unit: selectedUnit || selectedItem.unit || "Pcs",
      quantity: Number(formData.get("quantity")),
      orderDate: new Date().toISOString(),
      expectedDate: new Date(formData.get("expectedDate") as string).toISOString(),
      status: "Pending",
    };
    
    await addDoc(collection(db, "pre-orders"), newPreOrderData);
    
    toast({
      title: isCreatingNewPo ? "Pre-Order Created" : "Item Added to Pre-Order",
      description: `Item ${newPreOrderData.itemName} has been added to PO ${newPreOrderData.poNumber}.`,
    });
    setCreateOpen(false);
    setSelectedUnit(undefined);
    setSelectedItemId(undefined);
    setSelectedItemName("Select an item...");
    setPoPrice("");
    (e.target as HTMLFormElement).reset();
  };
  
  const handleEditOrderItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedOrderItem || !db) return;

    const formData = new FormData(e.currentTarget);
    const updatedData = {
      price: Number(formData.get("price")),
      unit: selectedUnit || selectedOrderItem.unit,
      quantity: Number(formData.get("quantity")),
    };

    const itemRef = doc(db, "pre-orders", selectedOrderItem.id);
    await updateDoc(itemRef, updatedData);

    toast({
      title: "Item Updated",
      description: `${selectedOrderItem.itemName} has been updated.`,
    });
    setEditItemOpen(false);
    setSelectedOrderItem(null);
    setSelectedUnit(undefined);
  };

  const handleDeleteOrderItem = async () => {
    if (!selectedOrderItem || !db) return;
    await deleteDoc(doc(db, "pre-orders", selectedOrderItem.id));
    toast({
      title: "Item Deleted",
      description: `${selectedOrderItem.itemName} has been removed from the pre-order.`
    });
    setDeleteItemOpen(false);
    setSelectedOrderItem(null);
  };

  const handleDeletePreOrder = async () => {
    if (!selectedPo || !db) return;
    
    const batch = writeBatch(db);
    selectedPo.orders.forEach(order => {
        const docRef = doc(db, "pre-orders", order.id);
        batch.delete(docRef);
    });
    await batch.commit();

    toast({
        title: "Pre-Order Deleted",
        description: `The pre-order ${selectedPo.poNumber} has been removed.`
    });
    setDeleteOpen(false);
    setSelectedPo(null);
  }

  const updateStatus = async (orders: PreOrder[], status: PreOrder['status']) => {
    if (!db) return;
    const batch = writeBatch(db);
    orders.forEach(order => {
        const orderRef = doc(db, "pre-orders", order.id);
        batch.update(orderRef, { status });
    });
    await batch.commit();
    toast({
      title: 'Status Updated',
      description: `PO ${orders[0].poNumber} marked as ${status}.`
    });
  };

  const handleItemStatusUpdate = async (orderItem: PreOrder, status: PreOrder['status']) => {
    if (!db) return;
    const itemRef = doc(db, "pre-orders", orderItem.id);
    await updateDoc(itemRef, { status });
    toast({
      title: 'Item Status Updated',
      description: `${orderItem.itemName} marked as ${status}.`
    });

    // Check if all items in the PO are fulfilled
    const po = groupedPreOrders.find(p => p.poNumber === orderItem.poNumber);
    if (po) {
      const allItems = preOrders.filter(o => o.poNumber === po.poNumber);
      const allFulfilled = allItems.every(item => item.id === orderItem.id ? status === 'Fulfilled' : item.status === 'Fulfilled');
      if (allFulfilled) {
        await updateStatus(po.orders, 'Fulfilled');
      }
    }
  };


  const handleRequestApproval = async () => {
    if (!db) return;
    const posToApprove = groupedPreOrders.filter(po => selectedRows.includes(po.poNumber) && po.status === 'Pending');

    if (posToApprove.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No items to send',
        description: 'Please select pending pre-orders to request approval.',
      });
      return;
    }
    
    try {
      const batch = writeBatch(db);
      posToApprove.forEach(po => {
        po.orders.forEach(order => {
            const orderRef = doc(db, 'pre-orders', order.id);
            batch.update(orderRef, { status: 'Awaiting Approval' });
        });
      });

      await batch.commit();

      setSelectedRows([]);
      toast({
        title: 'Approval Requested',
        description: `${posToApprove.length} pre-order(s) have been sent for approval.`,
      });
      router.push('/approval');
    } catch (error) {
       console.error("Error requesting approval: ", error);
      toast({
        variant: 'destructive',
        title: 'Failed to request approvals',
        description: 'Could not update pre-order statuses in the database.',
      });
    }
  };
  
  const handleExportPdf = () => {
     if (selectedRows.length === 0) {
      toast({
        variant: "destructive",
        title: "No items selected",
        description: "Please select one or more approved items to export.",
      });
      return;
    }

    const selectedApprovedOrders = preOrders.filter(order => selectedRows.includes(order.poNumber) && order.status === 'Approved');

    if (selectedApprovedOrders.length === 0) {
      toast({
        variant: "destructive",
        title: "No approved POs selected",
        description: "Only approved pre-orders can be exported to a delivery order.",
      });
      return;
    }

    const ids = selectedApprovedOrders.map(o => o.id).join(',');
    router.push(`/surat-jalan?ids=${ids}`);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const selectableRows = groupedPreOrders
        .filter(po => po.status === 'Pending' || po.status === 'Approved')
        .map(po => po.poNumber);
      setSelectedRows(selectableRows);
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (poNumber: string) => {
    setSelectedRows(prev =>
      prev.includes(poNumber) ? prev.filter(rowId => rowId !== poNumber) : [...prev, poNumber]
    );
  };
  
  const handleItemSelectForPo = (itemId: string) => {
    const item = inventoryItems.find(i => i.id === itemId);
    if(item) {
      setSelectedItemName(item.name)
      setSelectedItemId(item.id)
      setPoPrice(item.price);
      setSelectedUnit(item.unit);
    } else {
      setSelectedItemName("Select an item...")
      setSelectedItemId(undefined);
      setPoPrice("");
      setSelectedUnit(undefined);
    }
    setComboPoOpen(false);
  };

  const groupedPreOrders = React.useMemo(() => {
    const groups: { [key: string]: PreOrder[] } = {};
    preOrders.forEach(order => {
        if (!groups[order.poNumber]) {
            groups[order.poNumber] = [];
        }
        groups[order.poNumber].push(order);
    });

    return Object.entries(groups).map(([poNumber, orders]) => {
      const allFulfilled = orders.every(o => o.status === 'Fulfilled');
      const anyApproved = orders.some(o => o.status === 'Approved');

      let overallStatus: PreOrder['status'] = orders[0]?.status || 'Pending';
      if (allFulfilled) {
        overallStatus = 'Fulfilled';
      } else if (anyApproved) {
        // If some are approved but not all fulfilled, the PO is still considered 'Approved' at a high level
        // to allow fulfilling other items. The single status on GroupedPO is a simplification.
        // We will show 'Approved' if not all are Fulfilled.
        const firstNonFulfilled = orders.find(o => o.status !== 'Fulfilled');
        if (firstNonFulfilled) {
          overallStatus = firstNonFulfilled.status;
        }
      }

      return {
        poNumber,
        orders,
        totalItems: orders.length,
        totalValue: orders.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        totalQuantity: orders.reduce((sum, item) => sum + item.quantity, 0),
        status: allFulfilled ? 'Fulfilled' : orders[0]?.status,
        orderDate: orders[0]?.orderDate,
        expectedDate: orders[0]?.expectedDate,
      };
    }).filter(po => po.orders.length > 0); // Filter out empty POs
  }, [preOrders]);

  const filteredPreOrders = groupedPreOrders.filter(po => {
    const statusMatch = statusFilter === 'all' || po.status === statusFilter;
    const dateMatch = !dateFilter || format(new Date(po.expectedDate), 'yyyy-MM-dd') === format(dateFilter, 'yyyy-MM-dd');
    return statusMatch && dateMatch;
  });
  
  const selectableRowCount = filteredPreOrders.filter(po => po.status === 'Pending' || po.status === 'Approved').length;
  const isAllSelected = selectedRows.length > 0 && selectableRowCount > 0 && selectedRows.length === selectableRowCount;
  const canRequestApproval = selectedRows.some(poNumber => groupedPreOrders.find(po => po.poNumber === poNumber)?.status === 'Pending');
  const canExport = selectedRows.some(poNumber => groupedPreOrders.find(po => po.poNumber === poNumber)?.status === 'Approved');
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }
  
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
    <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pre-Orders</h1>
          <p className="text-muted-foreground">
            Track and manage your upcoming stock deliveries.
          </p>
        </div>
        <div className="flex flex-col md:flex-row w-full md:w-auto items-center gap-2">
           <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Awaiting Approval">Awaiting Approval</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
              <SelectItem value="Fulfilled">Fulfilled</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

           <div className="flex w-full md:w-auto items-center gap-2">
             <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full md:w-auto justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter ? format(dateFilter, "PPP") : <span>Filter by date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFilter}
                  onSelect={setDateFilter}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {dateFilter && (
                <Button variant="ghost" size="icon" onClick={() => setDateFilter(undefined)}>
                    <X className="h-4 w-4" />
                </Button>
            )}
           </div>
          
          <Button onClick={handleRequestApproval} disabled={!canRequestApproval}>
            <Send className="mr-2 h-4 w-4" />
            Request Approval
          </Button>
           <Button onClick={handleExportPdf} disabled={!canExport}>
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>

          <Dialog open={isCreateOpen} onOpenChange={(isOpen) => { setCreateOpen(isOpen); if(!isOpen) {setSelectedItemId(undefined); setSelectedItemName("Select an item..."); setPoPrice("")} }}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                 {isCreatingNewPo ? 'Create New PO' : 'Add Item to PO'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isCreatingNewPo ? 'Create New Pre-Order' : `Add Item to ${activePoNumber}`}</DialogTitle>
                <DialogDescription>
                  {isCreatingNewPo ? 'Fill in the details for the first item of your new pre-order.' : 'Add another item to your pending pre-order.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreatePreOrder} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="poNumber" className="text-right">PO Number</Label>
                  <Input id="poNumber" name="poNumber" className="col-span-3" value={activePoNumber} readOnly disabled />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="item" className="text-right">Item</Label>
                  <div className="col-span-3">
                    <Popover open={comboPoOpen} onOpenChange={setComboPoOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={comboPoOpen}
                          className="w-full justify-between"
                        >
                          {selectedItemName}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0">
                        <Command>
                          <CommandInput placeholder="Search item..." />
                          <CommandList>
                            <CommandEmpty>No item found.</CommandEmpty>
                            <CommandGroup>
                              {inventoryItems.map((item) => (
                                <CommandItem
                                  key={item.id}
                                  value={item.name}
                                  onSelect={() => handleItemSelectForPo(item.id)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedItemId === item.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {item.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">Price</Label>
                  <Input id="price" name="price" type="number" min="0" className="col-span-3" required value={poPrice} onChange={(e) => setPoPrice(e.target.value)} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unit" className="text-right">Unit</Label>
                  <Select name="unit" required onValueChange={setSelectedUnit} value={selectedUnit}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pcs">Pcs</SelectItem>
                      <SelectItem value="Pack">Pack</SelectItem>
                      <SelectItem value="Box">Box</SelectItem>
                      <SelectItem value="Roll">Roll</SelectItem>
                      <SelectItem value="Rim">Rim</SelectItem>
                      <SelectItem value="Tube">Tube</SelectItem>
                      <SelectItem value="Bottle">Bottle</SelectItem>
                      <SelectItem value="Can">Can</SelectItem>
                      <SelectItem value="Sheet">Sheet</SelectItem>
                      <SelectItem value="Cartridge">Cartridge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">Quantity</Label>
                  <Input id="quantity" name="quantity" type="number" min="1" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expectedDate" className="text-right">Expected Date</Label>
                  <Input id="expectedDate" name="expectedDate" type="date" className="col-span-3" required />
                </div>
                <DialogFooter>
                  <Button type="submit">Add Item</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>
      
      <div className="space-y-4">
        <div className="px-4 hidden sm:flex">
             <Checkbox
                checked={isAllSelected}
                onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                aria-label="Select all"
                disabled={selectableRowCount === 0}
                className="mr-4"
              />
              <span className="text-sm text-muted-foreground">Select all</span>
        </div>
        {filteredPreOrders.length > 0 ? filteredPreOrders.map((po) => (
          <Accordion key={po.poNumber} type="single" collapsible>
            <AccordionItem value={po.poNumber} className="border-0">
               <Card data-state={selectedRows.includes(po.poNumber) && "selected"} className="data-[state=selected]:ring-2 ring-primary">
                 <CardHeader className="p-4">
                    <div className="flex items-center gap-4">
                         <Checkbox
                          checked={selectedRows.includes(po.poNumber)}
                          onCheckedChange={() => handleSelectRow(po.poNumber)}
                          aria-label="Select PO"
                          disabled={!(po.status === 'Pending' || po.status === 'Approved')}
                        />
                         <div className="p-3 bg-primary/10 rounded-lg">
                           <Folder className="h-6 w-6 text-primary" />
                         </div>
                        <div className="flex-grow">
                            <div className="flex flex-col sm:flex-row justify-between">
                                <h3 className="font-semibold text-lg">{po.poNumber}</h3>
                                <div className="text-sm text-muted-foreground">{format(new Date(po.orderDate), "MMM d, yyyy")}</div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge
                                    variant={
                                    po.status === 'Approved' ? 'default' :
                                    po.status === 'Fulfilled' ? 'default' :
                                    po.status === 'Rejected' || po.status === 'Cancelled' ? 'destructive' :
                                    po.status === 'Pending' ? 'secondary' :
                                    po.status === 'Awaiting Approval' ? 'warning' : 'outline'
                                    }
                                    className={
                                    po.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                    po.status === 'Fulfilled' ? 'bg-blue-100 text-blue-800' :
                                    po.status === 'Rejected' || po.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                    po.status === 'Pending' ? 'bg-gray-100 text-gray-800' :
                                    po.status === 'Awaiting Approval' ? 'bg-yellow-100 text-yellow-800' : ''
                                    }
                                >
                                    {po.status}
                                </Badge>
                                <span>•</span>
                                <span>{po.totalItems} {po.totalItems > 1 ? 'items' : 'item'}</span>
                            </div>
                        </div>
                        <div className="text-right hidden sm:block">
                            <div className="font-semibold text-lg">{formatCurrency(po.totalValue)}</div>
                        </div>
                        <AccordionTrigger className="p-2 hover:bg-muted rounded-md [&[data-state=open]>svg]:rotate-180" />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              {po.status === 'Rejected' && <DropdownMenuItem onSelect={() => updateStatus(po.orders, 'Pending')}>Re-submit</DropdownMenuItem>}
                              {(po.status === 'Approved' || po.status === 'Rejected') && (
                                <DropdownMenuItem onSelect={() => updateStatus(po.orders, 'Pending')}>
                                  <Undo2 className="mr-2 h-4 w-4" />
                                  Undo Decision
                                </DropdownMenuItem>
                              )}
                              {po.status === 'Pending' && <DropdownMenuItem onSelect={() => updateStatus(po.orders, 'Cancelled')}>Cancel Order</DropdownMenuItem>}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600 focus:text-red-700" onSelect={() => { setSelectedPo(po); setDeleteOpen(true); }}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                    </div>
                 </CardHeader>
                <AccordionContent>
                  <CardContent className="p-4 pt-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {po.orders.map(order => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">{order.itemName}</TableCell>
                              <TableCell>{order.unit}</TableCell>
                              <TableCell>
                                 <Badge
                                      variant={
                                      order.status === 'Approved' ? 'default' :
                                      order.status === 'Fulfilled' ? 'default' :
                                      order.status === 'Rejected' || order.status === 'Cancelled' ? 'destructive' :
                                      order.status === 'Pending' ? 'secondary' :
                                      order.status === 'Awaiting Approval' ? 'warning' : 'outline'
                                      }
                                      className={
                                      order.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                      order.status === 'Fulfilled' ? 'bg-blue-100 text-blue-800' :
                                      order.status === 'Rejected' || order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                      order.status === 'Pending' ? 'bg-gray-100 text-gray-800' :
                                      order.status === 'Awaiting Approval' ? 'bg-yellow-100 text-yellow-800' : ''
                                      }
                                  >
                                      {order.status}
                                  </Badge>
                              </TableCell>
                              <TableCell className="text-right">{order.quantity}</TableCell>
                              <TableCell className="text-right">{formatCurrency(order.price)}</TableCell>
                              <TableCell className="text-right font-medium">{formatCurrency(order.quantity * order.price)}</TableCell>
                              <TableCell className="text-right">
                                 <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="icon" variant="ghost">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Item Actions</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {order.status === 'Approved' && (
                                      <DropdownMenuItem onSelect={() => handleItemStatusUpdate(order, 'Fulfilled')}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Mark as Fulfilled
                                      </DropdownMenuItem>
                                    )}
                                    {po.status === 'Pending' && (
                                      <>
                                        <DropdownMenuItem onSelect={() => { setSelectedOrderItem(order); setEditItemOpen(true); }}>
                                          <Pencil className="mr-2 h-4 w-4" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-500" onSelect={() => { setSelectedOrderItem(order); setDeleteItemOpen(true); }}>
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-2 bg-muted/30 flex-wrap gap-4 justify-between text-sm">
                       <div className="flex items-center gap-2">
                         <Box className="h-4 w-4 text-muted-foreground" />
                         <div>
                            <p className="text-muted-foreground text-xs">Total Quantity</p>
                            <p className="font-medium">{po.totalQuantity} units</p>
                         </div>
                      </div>
                       <div className="flex items-center gap-2">
                         <CalendarDays className="h-4 w-4 text-muted-foreground" />
                         <div>
                            <p className="text-muted-foreground text-xs">Expected Delivery</p>
                            <p className="font-medium">{format(new Date(po.expectedDate), "MMM d, yyyy")}</p>
                         </div>
                      </div>
                  </CardFooter>
                </AccordionContent>
               </Card>
            </AccordionItem>
          </Accordion>
        )) : (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-24">
              <div className="flex flex-col items-center gap-1 text-center">
                <h3 className="text-2xl font-bold tracking-tight">
                  No pre-orders found
                </h3>
                <p className="text-sm text-muted-foreground">
                  Create your first pre-order to get started.
                </p>
              </div>
            </div>
        )}
      </div>

        {/* Dialogs */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the pre-order
                <span className="font-semibold"> {selectedPo?.poNumber}</span> and all its items.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedPo(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeletePreOrder}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isEditItemOpen} onOpenChange={setEditItemOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Item: {selectedOrderItem?.itemName}</DialogTitle>
              <DialogDescription>
                Update the quantity, unit, or price for this item.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditOrderItem} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Price</Label>
                <Input id="price" name="price" type="number" min="0" className="col-span-3" defaultValue={selectedOrderItem?.price} required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unit" className="text-right">Unit</Label>
                <Select name="unit" required onValueChange={setSelectedUnit} defaultValue={selectedOrderItem?.unit}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pcs">Pcs</SelectItem>
                    <SelectItem value="Pack">Pack</SelectItem>
                    <SelectItem value="Box">Box</SelectItem>
                    <SelectItem value="Roll">Roll</SelectItem>
                    <SelectItem value="Rim">Rim</SelectItem>
                    <SelectItem value="Tube">Tube</SelectItem>
                    <SelectItem value="Bottle">Bottle</SelectItem>
                    <SelectItem value="Can">Can</SelectItem>
                    <SelectItem value="Sheet">Sheet</SelectItem>
                    <SelectItem value="Cartridge">Cartridge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">Quantity</Label>
                <Input id="quantity" name="quantity" type="number" min="1" className="col-span-3" defaultValue={selectedOrderItem?.quantity} required />
              </div>
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteItemOpen} onOpenChange={setDeleteItemOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this item?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove <span className="font-semibold">{selectedOrderItem?.itemName}</span> from this pre-order. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedOrderItem(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteOrderItem}>
                Delete Item
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

    </div>
  );
}

export default function PreOrdersPage() {
    return (
        <React.Suspense fallback={<FullPageSpinner />}>
            <PreOrdersContent />
        </React.Suspense>
    )
}
