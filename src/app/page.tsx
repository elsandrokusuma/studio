
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
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, Line, LineChart } from "recharts";
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
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  Loader2,
} from "lucide-react";
import {
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  doc,
  updateDoc,
  getDocs,
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { format, subDays } from 'date-fns';
import { useAuth } from "@/hooks/use-auth";
import { LoginForm } from "@/components/login-form";
import { useNotifications } from "@/hooks/use-notifications";
import { manageTransaction } from "@/lib/transactions";
import { useTheme } from "@/hooks/use-theme";


const chartConfig = {
  stockIn: {
    label: "Stock In",
    color: "#17b878",
  },
  stockOut: {
    label: "Stock Out",
    color: "hsl(var(--chart-2))",
  },
};

const motivationalQuotes = {
  en: [
    "Every small step is progress.",
    "Focus on progress, not perfection.",
    "Today is a new opportunity to grow.",
    "Hard work today is victory tomorrow.",
    "Don't stop when you're tired, stop when you're done.",
    "Start where you are. Use what you have.",
    "Success is the sum of small efforts.",
    "Make each day your masterpiece.",
    "Trust the process.",
    "The only limit is your mind.",
    "Keep moving forward, don't look back.",
    "Action is the foundational key to all success.",
    "Your passion is your fire. Keep it burning.",
    "Every accomplishment starts with the decision to try.",
    "Don't be afraid to fail, be afraid not to try.",
    "You are stronger than you think.",
    "Do your best, and forget the rest.",
    "Big dreams start with one step.",
    "Be the best version of yourself today.",
    "Challenges make life interesting.",
    "Consistency is more important than perfection.",
    "Focus on the goal, not the obstacles.",
    "Patience is the key to victory.",
    "Every day is a new page in your story.",
    "Don't wait for opportunity, create it.",
    "Stay positive, work hard, and make it happen.",
    "Learn from yesterday, live for today.",
    "Strength does not come from winning, but from struggle.",
    "Miracles happen when you don't give up.",
    "Do something today that your future self will thank you for.",
    "Fall down seven times, get up eight."
  ],
  id: [
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
  ]
};

const translations = {
    en: {
        goodMorning: "Good morning",
        goodAfternoon: "Good afternoon",
        goodEvening: "Good evening",
        goodNight: "Good night",
        totalItems: "Total Items",
        stockValue: "Stock Value",
        lowStock: "Low Stock",
        outOfStock: "Out of Stock",
        pendingApprovals: "Pending Approvals",
        quickActions: "Quick Actions",
        commonTasks: "Common tasks",
        addItem: "Add Item",
        addItemDesc: "New inventory item",
        stockIn: "Stock In",
        stockInDesc: "Receive items",
        stockOut: "Stock Out",
        stockOutDesc: "Issue items",
        createPO: "Create PO",
        createPODesc: "Purchase order",
        stockMovement: "Stock Movement Trends",
        last6Months: "Last 6 months activity",
        last7Days: "Last 7 days activity",
        daily: "Daily",
        monthly: "Monthly",
        allitems: "All Items",
        recentTransactions: "Recent Transactions",
        recentTransactionsDesc: "The latest stock movements in your inventory.",
        item: "Item",
        qty: "Qty",
        type: "Type",
        noTransactions: "No transactions recorded yet.",
        transactionDetails: "Transaction Details",
        transactionDetailsDesc: "Detailed information about the stock movement.",
        date: "Date",
        itemName: "Item Name",
        quantity: "Quantity",
        from: "From",
        to: "To",
        stockStatusTitle: (title: string) => `${title} Items`,
        stockStatusDesc: (title: string) => `A list of all items that are currently ${title.toLowerCase()}.`,
        addNewItem: "Add New Inventory Item",
        addNewItemDesc: "Fill in the details below to add a new product.",
        name: "Name",
        price: "Price",
        unit: "Unit",
        photoUrl: "Photo URL",
        saveItem: "Save Item",
        recordStockIn: "Record Stock In",
        recordStockInDesc: "Add new stock received for an item.",
        addStock: "Add Stock",
        recordStockOut: "Record Stock Out",
        recordStockOutDesc: "Record stock that has been sold or used.",
        removeStock: "Remove Stock",
        createNewPO: "Create New Pre-Order",
        createNewPODesc: "Fill in the details for the new pre-order.",
        poNumber: "PO Number",
        expectedDate: "Expected Date",
        createPreOrder: "Create Pre-Order",
        unitRequired: "Unit is required",
        unitRequiredDesc: "Please select a unit for the item.",
        itemRequired: "Please select an item.",
        fieldRequired: "Field Required",
        fieldRequiredDesc: "This field cannot be empty.",
        negativeStock: "Stock cannot be negative.",
    },
    id: {
        goodMorning: "Selamat pagi",
        goodAfternoon: "Selamat siang",
        goodEvening: "Selamat sore",
        goodNight: "Selamat malam",
        totalItems: "Total Barang",
        stockValue: "Nilai Stok",
        lowStock: "Stok Rendah",
        outOfStock: "Stok Habis",
        pendingApprovals: "Persetujuan Tertunda",
        quickActions: "Aksi Cepat",
        commonTasks: "Tugas umum",
        addItem: "Tambah Barang",
        addItemDesc: "Barang inventaris baru",
        stockIn: "Stok Masuk",
        stockInDesc: "Terima barang",
        stockOut: "Stok Keluar",
        stockOutDesc: "Keluarkan barang",
        createPO: "Buat PO",
        createPODesc: "Pesanan pembelian",
        stockMovement: "Tren Pergerakan Stok",
        last6Months: "Aktivitas 6 bulan terakhir",
        last7Days: "Aktivitas 7 hari terakhir",
        daily: "Harian",
        monthly: "Bulanan",
        allitems: "Semua Barang",
        recentTransactions: "Transaksi Terkini",
        recentTransactionsDesc: "Pergerakan stok terbaru di inventaris Anda.",
        item: "Barang",
        qty: "Jml",
        type: "Tipe",
        noTransactions: "Belum ada transaksi yang tercatat.",
        transactionDetails: "Detail Transaksi",
        transactionDetailsDesc: "Informasi rinci tentang pergerakan stok.",
        date: "Tanggal",
        itemName: "Nama Barang",
        quantity: "Jumlah",
        from: "Dari",
        to: "Ke",
        stockStatusTitle: (title: string) => `Barang Stok ${title}`,
        stockStatusDesc: (title: string) => `Daftar semua barang yang saat ini ${title.toLowerCase()}.`,
        addNewItem: "Tambah Barang Inventaris Baru",
        addNewItemDesc: "Isi detail di bawah untuk menambahkan produk baru.",
        name: "Nama",
        price: "Harga",
        unit: "Unit",
        photoUrl: "URL Foto",
        saveItem: "Simpan Barang",
        recordStockIn: "Catat Stok Masuk",
        recordStockInDesc: "Tambahkan stok baru yang diterima untuk suatu barang.",
        addStock: "Tambah Stok",
        recordStockOut: "Catat Stok Keluar",
        recordStockOutDesc: "Catat stok yang telah terjual atau digunakan.",
        removeStock: "Keluarkan Stok",
        createNewPO: "Buat Pre-Order Baru",
        createNewPODesc: "Isi detail untuk pre-order baru.",
        poNumber: "Nomor PO",
        expectedDate: "Tanggal Perkiraan",
        createPreOrder: "Buat Pre-Order",
        unitRequired: "Unit diperlukan",
        unitRequiredDesc: "Silakan pilih unit untuk barang tersebut.",
        itemRequired: "Silakan pilih barang.",
        fieldRequired: "Kolom Diperlukan",
        fieldRequiredDesc: "Kolom ini tidak boleh kosong.",
        negativeStock: "Stok tidak boleh negatif.",
    }
};


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
  const [loadingData, setLoadingData] = React.useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const { user, loading: authLoading } = useAuth();
  const [showLogin, setShowLogin] = React.useState(false);
  const { language } = useTheme();

  const t = language === 'id' ? translations.id : translations.en;

  // Dialog states
  const [isAddOpen, setAddOpen] = React.useState(false);
  const [isStockInOpen, setStockInOpen] = React.useState(false);
  const [isStockOutOpen, setStockOutOpen] = React.useState(false);
  const [isCreatePoOpen, setCreatePoOpen] = React.useState(false);
  const [selectedUnit, setSelectedUnit] = React.useState<string | undefined>();
  const [activePoNumber, setActivePoNumber] = React.useState<string>("");
  const [poPrice, setPoPrice] = React.useState<number | string>("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);


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

  // State for chart type and time period
  const [chartType, setChartType] = React.useState<'bar' | 'line' | 'area'>('bar');
  const [timePeriod, setTimePeriod] = React.useState<'monthly' | 'daily'>('monthly');


  const chartData = React.useMemo(() => {
    const filteredTransactions =
      selectedChartItem === "all"
        ? transactions
        : transactions.filter((t) => t.itemId === selectedChartItem);

    if (timePeriod === 'monthly') {
      const data: { [key: string]: { month: string; stockIn: number; stockOut: number } } = {};
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      filteredTransactions.forEach((t) => {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        const monthLabel = `${monthNames[date.getMonth()]} '${String(date.getFullYear()).slice(2)}`;

        if (!data[monthKey]) {
          data[monthKey] = { month: monthLabel, stockIn: 0, stockOut: 0 };
        }
        if (t.type === "in" || t.type === "add") data[monthKey].stockIn += t.quantity;
        else if (t.type === "out") data[monthKey].stockOut += t.quantity;
      });

      return Object.values(data)
        .sort((a, b) => {
          const aDate = new Date(a.month.split(" '")[0] + " 1, 20" + a.month.split(" '")[1]);
          const bDate = new Date(b.month.split(" '")[0] + " 1, 20" + b.month.split(" '")[1]);
          return aDate.getTime() - bDate.getTime();
        })
        .slice(-6);
    } else { // Daily
      const data: { [key: string]: { date: string; stockIn: number; stockOut: number } } = {};
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = subDays(new Date(), i);
        return format(d, 'yyyy-MM-dd');
      }).reverse();

      last7Days.forEach(day => {
        data[day] = { date: format(new Date(day), 'dd MMM'), stockIn: 0, stockOut: 0 };
      });
      
      const sevenDaysAgo = subDays(new Date(), 6);

      filteredTransactions.forEach((t) => {
        const transactionDate = new Date(t.date);
        if (transactionDate >= sevenDaysAgo) {
          const dayKey = format(transactionDate, 'yyyy-MM-dd');
          if(data[dayKey]) {
            if (t.type === "in" || t.type === "add") data[dayKey].stockIn += t.quantity;
            else if (t.type === "out") data[dayKey].stockOut += t.quantity;
          }
        }
      });
      return Object.values(data);
    }
  }, [transactions, selectedChartItem, timePeriod]);


  React.useEffect(() => {
    const getGreeting = (): GreetingInfo => {
        const now = new Date();
        const utcOffset = now.getTimezoneOffset() * 60000;
        const wibOffset = 7 * 3600000;
        const wibTime = new Date(now.getTime() + utcOffset + wibOffset);
        const currentHour = wibTime.getHours();

        if (currentHour >= 1 && currentHour < 11) {
            return { text: t.goodMorning, icon: Sun };
        } else if (currentHour >= 11 && currentHour < 15) {
            return { text: t.goodAfternoon, icon: Sun };
        } else if (currentHour >= 15 && currentHour < 19) {
            return { text: t.goodEvening, icon: Sunset };
        } else {
            return { text: t.goodNight, icon: Moon };
        }
    };
    setGreetingInfo(getGreeting());

    // Set daily motivational quote
    const dayOfMonth = new Date().getDate();
    setDailyQuote(motivationalQuotes[language][dayOfMonth - 1]);

    const fetchData = async () => {
        if (!db) {
            setLoadingData(false);
            return;
        }

        try {
            // Fetch Inventory
            const qInventory = query(collection(db, "inventory"), orderBy("name"));
            const inventorySnapshot = await getDocs(qInventory);
            const items: InventoryItem[] = [];
            inventorySnapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() } as InventoryItem);
            });
            setInventoryItems(items);

            // Fetch all Transactions for chart
            const qTransactions = query(collection(db, "transactions"), orderBy("date", "desc"));
            const transactionsSnapshot = await getDocs(qTransactions);
            const trans: Transaction[] = [];
            transactionsSnapshot.forEach((doc) => {
                trans.push({ id: doc.id, ...doc.data() } as Transaction);
            });
            setTransactions(trans);

            // Fetch Recent Transactions
            const qRecentTransactions = query(collection(db, "transactions"), orderBy("date", "desc"), limit(5));
            const recentTransactionsSnapshot = await getDocs(qRecentTransactions);
            const recentTrans: Transaction[] = [];
            recentTransactionsSnapshot.forEach((doc) => {
                recentTrans.push({ id: doc.id, ...doc.data() } as Transaction);
            });
            setRecentTransactions(recentTrans);

            // Fetch Pre-Orders
            const qPreOrders = query(collection(db, "pre-orders"), orderBy("orderDate", "desc"));
            const preOrdersSnapshot = await getDocs(qPreOrders);
            const orders: PreOrder[] = [];
            preOrdersSnapshot.forEach((doc) => {
                orders.push({ id: doc.id, ...doc.data() } as PreOrder);
            });
            setPreOrders(orders);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not fetch dashboard data.",
            });
        } finally {
            setLoadingData(false);
        }
    };

    fetchData();
  }, [toast, t, language]);

  React.useEffect(() => {
    if (!authLoading) {
      if (user && user.email === 'kreztservice@gmail.com') {
        router.push('/approval-sparepart');
      } else {
        setShowLogin(!user);
      }
    }
  }, [user, authLoading, router]);

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

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db) return;
    const formData = new FormData(e.currentTarget);
    const newItemData = {
      name: formData.get("name") as string,
      price: Number(formData.get("price")),
      unit: selectedUnit,
      quantity: Number(formData.get("quantity")),
      photoUrl: (formData.get("photoUrl") as string) || undefined,
    };

    if (!newItemData.unit) {
        toast({
            variant: "destructive",
            title: t.unitRequired,
            description: t.unitRequiredDesc,
        });
        return;
    }

    const docRef = await addDoc(collection(db, "inventory"), newItemData);

    manageTransaction({
      itemId: docRef.id,
      itemName: newItemData.name,
      type: "add",
      quantity: newItemData.quantity,
    });

    addNotification({
      title: "Item Added",
      description: `${newItemData.name} has been added to inventory.`,
      icon: Plus
    });

    setAddOpen(false);
    setSelectedUnit(undefined);
    (e.target as HTMLFormElement).reset();
  };

  const handleStockUpdate =
    (type: "in" | "out") => async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!db || isSubmitting) return;
      
      setIsSubmitting(true);
      
      try {
        const selectedItem = inventoryItems.find((i) => i.id === selectedItemId);

        if (!selectedItem) {
          toast({ variant: "destructive", title: t.itemRequired });
          return;
        }

        const formData = new FormData(e.currentTarget);
        const quantity = Number(formData.get("quantity"));
        const person = formData.get("person") as string;
        
        if (type === 'out' && !person.trim()) {
          toast({
            variant: "destructive",
            title: t.fieldRequired,
            description: t.fieldRequiredDesc,
          });
          return;
        }

        const itemRef = doc(db, "inventory", selectedItem.id);
        const newQuantity =
          type === "in"
            ? selectedItem.quantity + quantity
            : selectedItem.quantity - quantity;

        if (newQuantity < 0) {
          toast({
            variant: "destructive",
            title: "Error",
            description: t.negativeStock,
          });
          return;
        }

        await updateDoc(itemRef, { quantity: newQuantity });
        await manageTransaction({
          itemId: selectedItem.id,
          itemName: selectedItem.name,
          type,
          quantity,
          person,
        });

        addNotification({
          title: "Stock Updated",
          description: `Quantity for ${selectedItem.name} updated.`,
          icon: type === 'in' ? TrendingUp : TrendingDown,
        });

        if (type === "in") setStockInOpen(false);
        else setStockOutOpen(false);

        setSelectedItemId(null);
        setSelectedItemName("Select an item...");
      } catch(error) {
        console.error("Error updating stock:", error);
        toast({ variant: "destructive", title: "Failed to update stock" });
      } finally {
        setIsSubmitting(false);
      }
    };

  const handleCreatePreOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db) return;
    const formData = new FormData(e.currentTarget);
    const selectedItem = inventoryItems.find((i) => i.id === selectedItemId);

    if (!selectedItem) {
      toast({ variant: "destructive", title: t.itemRequired });
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

    addNotification({
      title: "Pre-Order Created",
      description: `PO for ${newPreOrderData.quantity}x ${newPreOrderData.itemName} created.`,
      icon: FileText
    });
    setCreatePoOpen(false);
    setSelectedUnit(undefined);
    setSelectedItemId(null);
    setSelectedItemName("Select an item...");
    setPoPrice("");
    (e.target as HTMLFormElement).reset();
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailsOpen(true);
  };

  const handleShowLowStock = () => {
    setStockStatusTitle("Low Stock");
    setStockStatusItems(
      inventoryItems.filter((item) => item.quantity <= 5 && item.quantity > 0)
    );
    setStockStatusOpen(true);
  };

  const handleShowOutOfStock = () => {
    setStockStatusTitle("Out of Stock");
    setStockStatusItems(inventoryItems.filter((item) => item.quantity === 0));
    setStockStatusOpen(true);
  };

  const handleStockItemClick = (item: InventoryItem) => {
    setStockStatusOpen(false);
    setSelectedItemId(item.id);
    setSelectedItemName(item.name);
    setSelectedUnit(item.unit);
    setPoPrice(item.price);
    setCreatePoOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (authLoading || loadingData) {
    return <FullPageSpinner />;
  }
  
  if (showLogin) {
    return <LoginForm />;
  }
  
  if (user && user.email === 'kreztservice@gmail.com') {
    return null;
  }

  if (!user) {
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
  const isHrdUser = user.email === 'krezthrd@gmail.com';
  const isStandardUser = user.email === 'kreztuser@gmail.com';


  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <GreetingIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{`${greetingInfo.text}!`}</h1>
              <p className="text-muted-foreground">
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
            <CardTitle className="text-sm font-medium">{t.totalItems}</CardTitle>
            <Package className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalItems.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card 
            className="text-white"
            style={{ backgroundColor: 'hsl(var(--stock-card-2))' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.stockValue}</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
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
            <CardTitle className="text-sm font-medium">{t.lowStock}</CardTitle>
            <AlertCircle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems}</div>
          </CardContent>
        </Card>
        <Card
          onClick={handleShowOutOfStock}
          className="cursor-pointer hover:shadow-lg transition-shadow text-white"
          style={{ backgroundColor: 'hsl(var(--stock-card-4))' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.outOfStock}</CardTitle>
            <Ban className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockItems}</div>
          </CardContent>
        </Card>
        <Card
          onClick={() => router.push("/pre-orders")}
          className="cursor-pointer hover:shadow-lg transition-shadow text-white"
          style={{ backgroundColor: 'hsl(var(--stock-card-5))' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.pendingApprovals}
            </CardTitle>
            <Clock className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{awaitingApprovalCount}</div>
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
              <CardTitle>{t.quickActions}</CardTitle>
              <CardDescription>{t.commonTasks}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button
              onClick={() => setAddOpen(true)}
              className="w-full justify-start h-auto p-4 bg-gradient-to-r from-blue-400 to-cyan-400 text-white hover:from-blue-500 hover:to-cyan-500"
              disabled={isHrdUser || isStandardUser}
            >
              <div className="bg-white/20 p-2 rounded-lg mr-4">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-base">{t.addItem}</p>
                <p className="font-normal text-sm text-left">
                  {t.addItemDesc}
                </p>
              </div>
            </Button>
            <Button
              onClick={() => setStockInOpen(true)}
              className="w-full justify-start h-auto p-4 bg-gradient-to-r from-green-400 to-emerald-400 text-white hover:from-green-500 hover:to-emerald-500"
              disabled={isHrdUser || isStandardUser}
            >
              <div className="bg-white/20 p-2 rounded-lg mr-4">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-base">{t.stockIn}</p>
                <p className="font-normal text-sm text-left">{t.stockInDesc}</p>
              </div>
            </Button>
            <Button
              onClick={() => setStockOutOpen(true)}
              className="w-full justify-start h-auto p-4 bg-gradient-to-r from-red-400 to-pink-400 text-white hover:from-red-500 hover:to-pink-500"
              disabled={isHrdUser}
            >
              <div className="bg-white/20 p-2 rounded-lg mr-4">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-base">{t.stockOut}</p>
                <p className="font-normal text-sm text-left">{t.stockOutDesc}</p>
              </div>
            </Button>
            <Button
              onClick={() => setCreatePoOpen(true)}
              className="w-full justify-start h-auto p-4 bg-gradient-to-r from-purple-400 to-indigo-400 text-white hover:from-purple-500 hover:to-indigo-500"
              disabled={isHrdUser || isStandardUser}
            >
              <div className="bg-white/20 p-2 rounded-lg mr-4">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-base">{t.createPO}</p>
                <p className="font-normal text-sm text-left">{t.createPODesc}</p>
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
                  <CardTitle>{t.stockMovement}</CardTitle>
                  <CardDescription>
                    {timePeriod === 'monthly' ? t.last6Months : t.last7Days}
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
                 <ToggleGroup 
                  type="single" 
                  defaultValue={chartType}
                  variant="outline" 
                  className="w-full sm:w-auto"
                  onValueChange={(value: 'bar' | 'line' | 'area') => value && setChartType(value)}
                >
                  <ToggleGroupItem value="bar" aria-label="Bar chart">
                    <BarChart4 className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="line" aria-label="Line chart">
                    <LineChartIcon className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="area" aria-label="Area chart">
                    <AreaChartIcon className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
                 <ToggleGroup 
                  type="single" 
                  defaultValue={timePeriod}
                  variant="outline" 
                  className="w-full sm:w-auto"
                  onValueChange={(value: 'daily' | 'monthly') => value && setTimePeriod(value)}
                >
                  <ToggleGroupItem value="daily" aria-label="Daily view">{t.daily}</ToggleGroupItem>
                  <ToggleGroupItem value="monthly" aria-label="Monthly view">{t.monthly}</ToggleGroupItem>
                </ToggleGroup>
                <Select
                  value={selectedChartItem}
                  onValueChange={setSelectedChartItem}
                >
                  <SelectTrigger className="w-full md:w-auto">
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allitems}</SelectItem>
                    {inventoryItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto h-[350px] flex items-end">
              <ChartContainer
                config={chartConfig}
                className="min-w-[300px] w-full h-[300px]"
              >
                {chartType === 'bar' && (
                  <BarChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey={timePeriod === 'monthly' ? 'month' : 'date'} tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="stockIn" fill="var(--color-stockIn)" radius={[4, 4, 0, 0]} name={t.stockIn} />
                    <Bar dataKey="stockOut" fill="var(--color-stockOut)" radius={[4, 4, 0, 0]} name={t.stockOut} />
                  </BarChart>
                )}
                {chartType === 'line' && (
                  <LineChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey={timePeriod === 'monthly' ? 'month' : 'date'} tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="stockIn" stroke="var(--color-stockIn)" strokeWidth={2} dot={false} name={t.stockIn} />
                    <Line type="monotone" dataKey="stockOut" stroke="var(--color-stockOut)" strokeWidth={2} dot={false} name={t.stockOut} />
                  </LineChart>
                )}
                {chartType === 'area' && (
                  <AreaChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey={timePeriod === 'monthly' ? 'month' : 'date'} tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <defs>
                      <linearGradient id="fillStockIn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-stockIn)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-stockIn)" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="fillStockOut" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-stockOut)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-stockOut)" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="stockIn" stroke="var(--color-stockIn)" fill="url(#fillStockIn)" stackId="1" name={t.stockIn} />
                    <Area type="monotone" dataKey="stockOut" stroke="var(--color-stockOut)" fill="url(#fillStockOut)" stackId="1" name={t.stockOut} />
                  </AreaChart>
                )}
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.recentTransactions}</CardTitle>
          <CardDescription>
            {t.recentTransactionsDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.item}</TableHead>
                    <TableHead className="text-right">{t.qty}</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">
                      {t.type}
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
              {t.noTransactions}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.transactionDetails}</DialogTitle>
            <DialogDescription>
              {t.transactionDetailsDesc}
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="grid gap-4 py-4 text-sm">
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">
                  {t.date}
                </span>
                <span className="col-span-2">
                  {new Date(selectedTransaction.date).toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">
                  {t.itemName}
                </span>
                <span className="col-span-2">
                  {selectedTransaction.itemName}
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">
                  {t.quantity}
                </span>
                <span className="col-span-2">
                  {selectedTransaction.quantity}
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">
                  {t.type}
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
                      ? t.from
                      : t.to}
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
            <DialogTitle>{t.stockStatusTitle(stockStatusTitle)}</DialogTitle>
            <DialogDescription>
              {t.stockStatusDesc(stockStatusTitle)}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.itemName}</TableHead>
                    <TableHead className="text-right">{t.quantity}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockStatusItems.map((item) => (
                    <TableRow key={item.id} onClick={() => handleStockItemClick(item)} className="cursor-pointer">
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
            <DialogTitle>{t.addNewItem}</DialogTitle>
            <DialogDescription>
              {t.addNewItemDesc}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddItem} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t.name}
              </Label>
              <Input id="name" name="name" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                {t.price}
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
                {t.unit}
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
                {t.quantity}
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
                {t.photoUrl}
              </Label>
              <Input
                id="photoUrl"
                name="photoUrl"
                placeholder="Optional: https://..."
                className="col-span-3"
              />
            </div>
            <DialogFooter>
              <Button type="submit">{t.saveItem}</Button>
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
            <DialogTitle>{t.recordStockIn}</DialogTitle>
            <DialogDescription>
              {t.recordStockInDesc}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStockUpdate("in")} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="item" className="text-right">
                {t.item}
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
                {t.quantity}
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
                {t.from}
              </Label>
              <Input
                id="person"
                name="person"
                placeholder="e.g., Supplier Name"
                className="col-span-3"
              />
            </div>
            <DialogFooter>
               <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.addStock}
              </Button>
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
            <DialogTitle>{t.recordStockOut}</DialogTitle>
            <DialogDescription>
              {t.recordStockOutDesc}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStockUpdate("out")} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="item" className="text-right">
                {t.item}
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
                {t.quantity}
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
                {t.to}
              </Label>
              <Input
                id="person"
                name="person"
                placeholder="e.g., Customer, Department"
                className="col-span-3"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={!selectedItemId || isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.removeStock}
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
            setPoPrice("");
          }
          setCreatePoOpen(isOpen);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.createNewPO}</DialogTitle>
            <DialogDescription>
              {t.createNewPODesc}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePreOrder} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="poNumber" className="text-right">
                {t.poNumber}
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
                {t.item}
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
                                setPoPrice(item.price);
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
                {t.price}
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="1"
                className="col-span-3"
                required
                value={poPrice}
                onChange={(e) => setPoPrice(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">
                {t.unit}
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
                {t.quantity}
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
                {t.expectedDate}
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
              <Button type="submit">{t.createPreOrder}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    