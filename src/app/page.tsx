
"use client";
import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import type { InventoryItem, Transaction, PreOrder } from "@/lib/types";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  ClipboardCheck,
  PackageX,
  DollarSign,
  Ban,
  Clock,
  BarChart4,
  Plus,
  TrendingUp,
  TrendingDown,
  FileText,
  Zap,
  Check,
  ChevronsUpDown,
  Sun,
  Moon,
  Sunset,
} from "lucide-react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  addDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const chartConfig = {
  quantity: {
    label: "Quantity",
    color: "hsl(var(--chart-1))",
  },
  stockIn: {
    label: "Stock In",
    color: "hsl(var(--chart-1))",
  },
  stockOut: {
    label: "Stock Out",
    color: "hsl(var(--chart-2))",
  },
};

const motivationalQuotes = [
  "Setiap langkah kecil adalah kemajuan.",
  "Fokus pada kemajuan, bukan kesempurnaan.",
  "Hari ini adalah kesempatan baru untuk berkembang.",
  "Kerja keras hari ini adalah kemenangan esok hari.",
  "Jangan berhenti saat lelah, berhentilah saat selesai.",
  "Mulai dari mana Anda berada. Gunakan apa yang Anda miliki.",
  "Kesuksesan adalah jumlah dari usaha-usaha kecil.",
  "Jadikan setiap hari mahakarya Anda.",
  "Percayalah pada proses.",
  "Satu-satunya batasan adalah pikiran Anda.",
  "Terus bergerak maju, jangan melihat ke belakang.",
  "Tindakan adalah kunci dasar untuk semua kesuksesan.",
  "Semangatmu adalah apimu. Jaga agar tetap menyala.",
  "Setiap pencapaian dimulai dengan keputusan untuk mencoba.",
  "Jangan takut gagal, takutlah tidak mencoba.",
  "Anda lebih kuat dari yang Anda kira.",
  "Lakukan yang terbaik, dan lupakan sisanya.",
  "Mimpi besar dimulai dengan satu langkah.",
  "Jadilah versi terbaik dari dirimu hari ini.",
  "Tantangan membuat hidup menarik.",
  "Konsistensi lebih penting dari kesempurnaan.",
  "Fokus pada tujuan, bukan rintangan.",
  "Kesabaran adalah kunci kemenangan.",
  "Setiap hari adalah halaman baru dalam ceritamu.",
  "Jangan menunggu kesempatan, ciptakanlah.",
  "Tetap positif, bekerja keras, dan wujudkan.",
  "Belajar dari kemarin, hidup untuk hari ini.",
  "Kekuatan tidak datang dari kemenangan, tapi dari perjuangan.",
  "Keajaiban terjadi saat Anda tidak menyerah.",
  "Lakukan sesuatu hari ini yang akan membuat dirimu di masa depan berterima kasih.",
  "Jatuh tujuh kali, bangkit delapan kali."
];


type GreetingInfo = {
  text: string;
  icon: React.ElementType;
};

export default function DashboardPage() {
  const [inventoryItems, setInventoryItems] = React.useState<InventoryItem[]>(
    []
  );
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [recentTransactions, setRecentTransactions] = React.useState<
    Transaction[]
  >([]);
  const [preOrders, setPreOrders] = React.useState<PreOrder[]>([]);
  const [selectedChartItem, setSelectedChartItem] =
    React.useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] =
    React.useState<Transaction | null>(null);
  const [isDetailsOpen, setDetailsOpen] = React.useState(false);
  const [greetingInfo, setGreetingInfo] = React.useState<GreetingInfo>({ text: "", icon: Sun });
  const [dailyQuote, setDailyQuote] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Dialog states
  const [isAddOpen, setAddOpen] = React.useState(false);
  const [isStockInOpen, setStockInOpen] = React.useState(false);
  const [isStockOutOpen, setStockOutOpen] = React.useState(false);
  const [isCreatePoOpen, setCreatePoOpen] = React.useState(false);
  const [selectedUnit, setSelectedUnit] = React.useState<string | undefined>();
  const [activePoNumber, setActivePoNumber] = React.useState<string>("");

  // States for stock status dialog
  const [isStockStatusOpen, setStockStatusOpen] = React.useState(false);
  const [stockStatusTitle, setStockStatusTitle] = React.useState("");
  const [stockStatusItems, setStockStatusItems] = React.useState<
    InventoryItem[]
  >([]);

  // State for combobox
  const [comboInOpen, setComboInOpen] = React.useState(false);
  const [comboOutOpen, setComboOutOpen] = React.useState(false);
  const [comboPoOpen, setComboPoOpen] = React.useState(false);
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(
    null
  );
  const [selectedItemName, setSelectedItemName] =
    React.useState<string>("Select an item...");

  const monthlyStockData = React.useMemo(() => {
    const data: {
      [key: string]: { month: string; stockIn: number; stockOut: number };
    } = {};
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const filteredTransactions =
      selectedChartItem === "all"
        ? transactions
        : transactions.filter((t) => t.itemId === selectedChartItem);

    filteredTransactions.forEach((t) => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthLabel = `${monthNames[date.getMonth()]} '${String(
        date.getFullYear()
      ).slice(2)}`;

      if (!data[monthKey]) {
        data[monthKey] = { month: monthLabel, stockIn: 0, stockOut: 0 };
      }

      if (t.type === "in" || t.type === "add") {
        data[monthKey].stockIn += t.quantity;
      } else if (t.type === "out") {
        data[monthKey].stockOut += t.quantity;
      }
    });

    return Object.values(data)
      .sort((a, b) => {
        const aDate = new Date(
          a.month.split(" '")[0] + " 1, 20" + a.month.split(" '")[1]
        );
        const bDate = new Date(
          b.month.split(" '")[0] + " 1, 20" + b.month.split(" '")[1]
        );
        return aDate.getTime() - bDate.getTime();
      })
      .slice(-6); // Get last 6 months
  }, [transactions, selectedChartItem]);

  React.useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    let active = true;

    const getGreeting = (): GreetingInfo => {
        const now = new Date();
        const utcOffset = now.getTimezoneOffset() * 60000;
        const wibOffset = 7 * 3600000;
        const wibTime = new Date(now.getTime() + utcOffset + wibOffset);
        const currentHour = wibTime.getHours();

        if (currentHour >= 1 && currentHour < 11) {
            return { text: "Good morning", icon: Sun };
        } else if (currentHour >= 11 && currentHour < 15) {
            return { text: "Good afternoon", icon: Sun };
        } else if (currentHour >= 15 && currentHour < 19) {
            return { text: "Good evening", icon: Sunset };
        } else {
            return { text: "Good night", icon: Moon };
        }
    };
    setGreetingInfo(getGreeting());

    // Set daily motivational quote
    const dayOfMonth = new Date().getDate();
    setDailyQuote(motivationalQuotes[dayOfMonth - 1]);


    const qInventory = query(collection(db, "inventory"), orderBy("name"));
    const unsubscribeInventory = onSnapshot(
      qInventory,
      (querySnapshot) => {
        if (!active) return;
        const items: InventoryItem[] = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as InventoryItem);
        });
        setInventoryItems(items);
        setLoading(false);
      },
      () => setLoading(false)
    );

    const qTransactions = query(
      collection(db, "transactions"),
      orderBy("date", "desc")
    );
    const unsubscribeTransactions = onSnapshot(
      qTransactions,
      (querySnapshot) => {
        if (!active) return;
        const trans: Transaction[] = [];
        querySnapshot.forEach((doc) => {
          trans.push({ id: doc.id, ...doc.data() } as Transaction);
        });
        setTransactions(trans);
      }
    );

    const qRecentTransactions = query(
      collection(db, "transactions"),
      orderBy("date", "desc"),
      limit(5)
    );
    const unsubscribeRecentTransactions = onSnapshot(
      qRecentTransactions,
      (querySnapshot) => {
        if (!active) return;
        const trans: Transaction[] = [];
        querySnapshot.forEach((doc) => {
          trans.push({ id: doc.id, ...doc.data() } as Transaction);
        });
        setRecentTransactions(trans);
      }
    );

    const qPreOrders = query(
      collection(db, "pre-orders"),
      orderBy("orderDate", "desc")
    );
    const unsubscribePreOrders = onSnapshot(qPreOrders, (querySnapshot) => {
      if (!active) return;
      const orders: PreOrder[] = [];
      querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as PreOrder);
      });
      setPreOrders(orders);
    });

    return () => {
      active = false;
      unsubscribeInventory();
      unsubscribeTransactions();
      unsubscribeRecentTransactions();
      unsubscribePreOrders();
    };
  }, []);

  React.useEffect(() => {
    const pendingPO = preOrders.find(po => po.status === 'Pending');
    
    if (pendingPO) {
        setActivePoNumber(pendingPO.poNumber);
    } else {
        const highestPoNum = preOrders
          .map(po => parseInt(po.poNumber.replace('POATK-', ''), 10))
          .reduce((max, num) => isNaN(num) ? max : Math.max(max, num), 0);
        
        const newPoNum = highestPoNum + 1;
        const formattedPoNum = `POATK-${String(newPoNum).padStart(3, '0')}`;
        setActivePoNumber(formattedPoNum);
    }
  }, [preOrders]);

  const addTransaction = async (
    transaction: Omit<Transaction, "id" | "date">
  ) => {
    if (!db) return;
    await addDoc(collection(db, "transactions"), {
      ...transaction,
      date: new Date().toISOString(),
    });
  };

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db) return;
    const formData = new FormData(e.currentTarget);
    const newItemData = {
      name: formData.get("name") as string,
      price: Number(formData.get("price")),
      unit: selectedUnit || "Pcs",
      quantity: Number(formData.get("quantity")),
      photoUrl: (formData.get("photoUrl") as string) || undefined,
    };

    const docRef = await addDoc(collection(db, "inventory"), newItemData);

    addTransaction({
      itemId: docRef.id,
      itemName: newItemData.name,
      type: "add",
      quantity: newItemData.quantity,
    });

    toast({
      title: "Success",
      description: `${newItemData.name} has been added to inventory.`,
    });

    setAddOpen(false);
    setSelectedUnit(undefined);
    (e.target as HTMLFormElement).reset();
  };

  const handleStockUpdate =
    (type: "in" | "out") => async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!db) return;
      const selectedItem = inventoryItems.find((i) => i.id === selectedItemId);

      if (!selectedItem) {
        toast({ variant: "destructive", title: "Please select an item." });
        return;
      }

      const formData = new FormData(e.currentTarget);
      const quantity = Number(formData.get("quantity"));
      const person = formData.get("person") as string | undefined;

      const itemRef = doc(db, "inventory", selectedItem.id);
      const newQuantity =
        type === "in"
          ? selectedItem.quantity + quantity
          : selectedItem.quantity - quantity;

      if (newQuantity < 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Stock cannot be negative.",
        });
        return;
      }

      await updateDoc(itemRef, { quantity: newQuantity });
      addTransaction({
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        type,
        quantity,
        person,
      });

      toast({
        title: "Stock Updated",
        description: `Quantity for ${selectedItem.name} updated.`,
      });

      if (type === "in") setStockInOpen(false);
      else setStockOutOpen(false);

      setSelectedItemId(null);
      setSelectedItemName("Select an item...");
    };

  const handleCreatePreOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db) return;
    const formData = new FormData(e.currentTarget);
    const selectedItem = inventoryItems.find((i) => i.id === selectedItemId);

    if (!selectedItem) {
      toast({ variant: "destructive", title: "Please select an item." });
      return;
    }

    const newPreOrderData: Omit<PreOrder, "id"> = {
      poNumber: activePoNumber,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      price: Number(formData.get("price")),
      unit: selectedUnit || "Pcs",
      quantity: Number(formData.get("quantity")),
      orderDate: new Date().toISOString(),
      expectedDate: new Date(
        formData.get("expectedDate") as string
      ).toISOString(),
      status: "Pending",
    };

    await addDoc(collection(db, "pre-orders"), newPreOrderData);

    toast({
      title: "Pre-Order Created",
      description: `Pre-order for ${newPreOrderData.quantity}x ${newPreOrderData.itemName} has been created.`,
    });
    setCreatePoOpen(false);
    setSelectedUnit(undefined);
    setSelectedItemId(null);
    setSelectedItemName("Select an item...");
    (e.target as HTMLFormElement).reset();
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailsOpen(true);
  };

  const handleShowLowStock = () => {
    setStockStatusTitle("Low Stock Items");
    setStockStatusItems(
      inventoryItems.filter((item) => item.quantity <= 5 && item.quantity > 0)
    );
    setStockStatusOpen(true);
  };

  const handleShowOutOfStock = () => {
    setStockStatusTitle("Out of Stock Items");
    setStockStatusItems(inventoryItems.filter((item) => item.quantity === 0));
    setStockStatusOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
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
            Please configure your Firebase credentials in the environment
            variables to use this application.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalItems = inventoryItems.reduce(
    (acc, item) => acc + item.quantity,
    0
  );
  const stockValue = inventoryItems.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );
  const lowStockItems = inventoryItems.filter(
    (item) => item.quantity <= 5 && item.quantity > 0
  ).length;
  const outOfStockItems = inventoryItems.filter(
    (item) => item.quantity === 0
  ).length;
  const awaitingApprovalCount = preOrders.filter(
    (order) => order.status === "Awaiting Approval"
  ).length;

  const topItemsData = [...inventoryItems]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const selectedItemNameChart =
    selectedChartItem === "all"
      ? "All Items"
      : inventoryItems.find((item) => item.id === selectedChartItem)?.name;

  const selectedItemForStockOut = inventoryItems.find(
    (i) => i.id === selectedItemId
  );
  
  const GreetingIcon = greetingInfo.icon;

  return (
    <div className="flex flex-col gap-8">
      <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/50">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="bg-green-100 dark:bg-green-800/30 p-3 rounded-full">
              <GreetingIcon className="h-6 w-6 text-green-700 dark:text-green-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-900 dark:text-green-200">{`${greetingInfo.text}!`}</h1>
              <p className="text-green-800 dark:text-green-300/80">
                {dailyQuote}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card
          onClick={() => router.push("/inventory")}
          className="cursor-pointer hover:shadow-lg transition-shadow text-white"
          style={{ backgroundColor: 'hsl(var(--stock-card-1))' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalItems.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card 
            className="text-white"
            style={{ backgroundColor: 'hsl(var(--stock-card-2))' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(stockValue)}
            </div>
          </CardContent>
        </Card>
        <Card
          onClick={handleShowLowStock}
          className="cursor-pointer hover:shadow-lg transition-shadow text-white"
           style={{ backgroundColor: 'hsl(var(--stock-card-3))' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertCircle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{lowStockItems}</div>
          </CardContent>
        </Card>
        <Card
          onClick={handleShowOutOfStock}
          className="cursor-pointer hover:shadow-lg transition-shadow text-white"
          style={{ backgroundColor: 'hsl(var(--stock-card-4))' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <Ban className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{outOfStockItems}</div>
          </CardContent>
        </Card>
        <Card
          onClick={() => router.push("/approval")}
          className="cursor-pointer hover:shadow-lg transition-shadow text-white"
          style={{ backgroundColor: 'hsl(var(--stock-card-5))' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approvals
            </CardTitle>
            <Clock className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{awaitingApprovalCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button
              onClick={() => setAddOpen(true)}
              className="w-full justify-start h-auto p-4 bg-gradient-to-r from-blue-400 to-cyan-400 text-white hover:from-blue-500 hover:to-cyan-500"
            >
              <div className="bg-white/20 p-2 rounded-lg mr-4">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-base">Add Item</p>
                <p className="font-normal text-sm text-left">
                  New inventory item
                </p>
              </div>
            </Button>
            <Button
              onClick={() => setStockInOpen(true)}
              className="w-full justify-start h-auto p-4 bg-gradient-to-r from-green-400 to-emerald-400 text-white hover:from-green-500 hover:to-emerald-500"
            >
              <div className="bg-white/20 p-2 rounded-lg mr-4">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-base">Stock In</p>
                <p className="font-normal text-sm text-left">Receive items</p>
              </div>
            </Button>
            <Button
              onClick={() => setStockOutOpen(true)}
              className="w-full justify-start h-auto p-4 bg-gradient-to-r from-red-400 to-pink-400 text-white hover:from-red-500 hover:to-pink-500"
            >
              <div className="bg-white/20 p-2 rounded-lg mr-4">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-base">Stock Out</p>
                <p className="font-normal text-sm text-left">Issue items</p>
              </div>
            </Button>
            <Button
              onClick={() => setCreatePoOpen(true)}
              className="w-full justify-start h-auto p-4 bg-gradient-to-r from-purple-400 to-indigo-400 text-white hover:from-purple-500 hover:to-indigo-500"
            >
              <div className="bg-white/20 p-2 rounded-lg mr-4">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-base">Create PO</p>
                <p className="font-normal text-sm text-left">Purchase order</p>
              </div>
            </Button>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-md">
                  <BarChart4 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Stock Movement Trends</CardTitle>
                  <CardDescription>Last 6 months activity</CardDescription>
                </div>
              </div>
              <Select
                value={selectedChartItem}
                onValueChange={setSelectedChartItem}
              >
                <SelectTrigger className="w-full md:w-[250px]">
                  <SelectValue placeholder="Select an item to view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  {inventoryItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <ChartContainer
                config={chartConfig}
                className="h-[300px] min-w-[300px] w-full"
              >
                <BarChart accessibilityLayer data={monthlyStockData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar
                    dataKey="stockIn"
                    fill="var(--color-stockIn)"
                    radius={[4, 4, 0, 0]}
                    name="Stock In"
                  />
                  <Bar
                    dataKey="stockOut"
                    fill="var(--color-stockOut)"
                    radius={[4, 4, 0, 0]}
                    name="Stock Out"
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            The latest stock movements in your inventory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">
                      Type
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((transaction) => (
                    <TableRow
                      key={transaction.id}
                      onClick={() => handleTransactionClick(transaction)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <div className="font-medium">
                          {transaction.itemName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {transaction.quantity}
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell">
                        <Badge
                          variant={
                            transaction.type === "in" ||
                            transaction.type === "add"
                              ? "default"
                              : transaction.type === "edit"
                              ? "secondary"
                              : "destructive"
                          }
                          className={
                            transaction.type === "in" ||
                            transaction.type === "add"
                              ? "bg-green-100 text-green-800"
                              : transaction.type === "edit"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {transaction.type === "in" ||
                          transaction.type === "add" ? (
                            <ArrowDownLeft className="mr-1 h-3 w-3" />
                          ) : (
                            <ArrowUpRight className="mr-1 h-3 w-3" />
                          )}
                          {transaction.type.charAt(0).toUpperCase() +
                            transaction.type.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-8">
              No transactions recorded yet.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Detailed information about the stock movement.
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="grid gap-4 py-4 text-sm">
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">
                  Date
                </span>
                <span className="col-span-2">
                  {new Date(selectedTransaction.date).toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">
                  Item Name
                </span>
                <span className="col-span-2">
                  {selectedTransaction.itemName}
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">
                  Quantity
                </span>
                <span className="col-span-2">
                  {selectedTransaction.quantity}
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">
                  Type
                </span>
                <span className="col-span-2">
                  <Badge
                    variant={
                      selectedTransaction.type === "in" ||
                      selectedTransaction.type === "add"
                        ? "default"
                        : selectedTransaction.type === "edit"
                        ? "secondary"
                        : "destructive"
                    }
                    className={
                      selectedTransaction.type === "in" ||
                      selectedTransaction.type === "add"
                        ? "bg-green-100 text-green-800"
                        : selectedTransaction.type === "edit"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {selectedTransaction.type.charAt(0).toUpperCase() +
                      selectedTransaction.type.slice(1)}
                  </Badge>
                </span>
              </div>
              {selectedTransaction.person && (
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">
                    {selectedTransaction.type === "in" ||
                    selectedTransaction.type === "add"
                      ? "From"
                      : "To"}
                  </span>
                  <span className="col-span-2">
                    {selectedTransaction.person}
                  </span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isStockStatusOpen} onOpenChange={setStockStatusOpen}>
        <DialogContent className="h-[60vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{stockStatusTitle}</DialogTitle>
            <DialogDescription>
              A list of all items that are currently{" "}
              {stockStatusTitle.toLowerCase().replace(" items", "")}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockStatusItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Action Dialogs */}
      <Dialog open={isAddOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Inventory Item</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new product.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddItem} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" name="name" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                className="col-span-3"
                required
                min="0"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">
                Unit
              </Label>
              <Select name="unit" required onValueChange={setSelectedUnit}>
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
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                className="col-span-3"
                required
                min="0"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="photoUrl" className="text-right">
                Photo URL
              </Label>
              <Input
                id="photoUrl"
                name="photoUrl"
                placeholder="Optional: https://..."
                className="col-span-3"
              />
            </div>
            <DialogFooter>
              <Button type="submit">Save Item</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isStockInOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedItemId(null);
            setSelectedItemName("Select an item...");
          }
          setStockInOpen(isOpen);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Stock In</DialogTitle>
            <DialogDescription>
              Add new stock received for an item.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStockUpdate("in")} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="item" className="text-right">
                Item
              </Label>
              <div className="col-span-3">
                <Popover open={comboInOpen} onOpenChange={setComboInOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={comboInOpen}
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
                              onSelect={() => {
                                setSelectedItemId(item.id);
                                setSelectedItemName(item.name);
                                setComboInOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedItemId === item.id
                                    ? "opacity-100"
                                    : "opacity-0"
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
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                className="col-span-3"
                required
                min="1"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="person" className="text-right">
                From
              </Label>
              <Input
                id="person"
                name="person"
                placeholder="e.g., Supplier Name"
                className="col-span-3"
              />
            </div>
            <DialogFooter>
              <Button type="submit">Add Stock</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isStockOutOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedItemId(null);
            setSelectedItemName("Select an item...");
          }
          setStockOutOpen(isOpen);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Stock Out</DialogTitle>
            <DialogDescription>
              Record stock that has been sold or used.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStockUpdate("out")} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="item" className="text-right">
                Item
              </Label>
              <div className="col-span-3">
                <Popover open={comboOutOpen} onOpenChange={setComboOutOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={comboOutOpen}
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
                              onSelect={() => {
                                setSelectedItemId(item.id);
                                setSelectedItemName(item.name);
                                setComboOutOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedItemId === item.id
                                    ? "opacity-100"
                                    : "opacity-0"
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
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                className="col-span-3"
                required
                min="1"
                max={selectedItemForStockOut?.quantity}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="person" className="text-right">
                To
              </Label>
              <Input
                id="person"
                name="person"
                placeholder="e.g., Customer, Department"
                className="col-span-3"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={!selectedItemId}>
                Remove Stock
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCreatePoOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedItemId(null);
            setSelectedItemName("Select an item...");
          }
          setCreatePoOpen(isOpen);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Pre-Order</DialogTitle>
            <DialogDescription>
              Fill in the details for the new pre-order. This will create a
              single item PO.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePreOrder} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="poNumber" className="text-right">
                PO Number
              </Label>
              <Input
                id="poNumber"
                name="poNumber"
                className="col-span-3"
                value={activePoNumber}
                readOnly
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="item" className="text-right">
                Item
              </Label>
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
                              onSelect={() => {
                                setSelectedItemId(item.id);
                                setSelectedItemName(item.name);
                                setSelectedUnit(item.unit);
                                setComboPoOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedItemId === item.id
                                    ? "opacity-100"
                                    : "opacity-0"
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
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="1"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">
                Unit
              </Label>
              <Select
                name="unit"
                required
                onValueChange={setSelectedUnit}
                value={selectedUnit}
              >
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
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expectedDate" className="text-right">
                Expected Date
              </Label>
              <Input
                id="expectedDate"
                name="expectedDate"
                type="date"
                className="col-span-3"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit">Create Pre-Order</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
