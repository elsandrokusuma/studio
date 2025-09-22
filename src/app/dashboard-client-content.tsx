
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
  onSnapshot,
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
import { useNotifications, playNotificationSound } from "@/hooks/use-notifications";
import { manageTransaction } from "@/lib/transactions";
import { useTheme } from "@/hooks/use-theme";
import { useAudio } from "@/hooks/use-audio";


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
    "Every small step is progress.", "Focus on progress, not perfection.", "Today is a new opportunity to grow.", "Hard work today is victory tomorrow.", "Don't stop when you're tired, stop when you're done.", "Start where you are. Use what you have.", "Success is the sum of small efforts.", "Make each day your masterpiece.", "Trust the process.", "The only limit is your mind.", "Keep moving forward, don't look back.", "Action is the foundational key to all success.", "Your passion is your fire. Keep it burning.", "Every accomplishment starts with the decision to try.", "Don't be afraid to fail, be afraid not to try.", "You are stronger than you think.", "Do your best, and forget the rest.", "Big dreams start with one step.", "Be the best version of yourself today.", "Challenges make life interesting.", "Consistency is more important than perfection.", "Focus on the goal, not on the obstacles.", "Patience is the key to victory.", "Every day is a new page in your story.", "Don't wait for opportunity, create it.", "Stay positive, work hard, and make it happen.", "Learn from yesterday, live for today.", "Strength does not come from winning, but from struggle.", "Miracles happen when you don't give up.", "Do something today that your future self will thank you for.", "Fall down seven times, get up eight."
  ],
  id: [
    "Setiap langkah kecil adalah kemajuan.", "Fokus pada kemajuan, bukan kesempurnaan.", "Hari ini adalah kesempatan baru untuk berkembang.", "Kerja keras hari ini adalah kemenangan esok hari.", "Jangan berhenti saat lelah, berhentilah saat selesai.", "Mulai dari mana Anda berada. Gunakan apa yang Anda miliki.", "Kesuksesan adalah jumlah dari usaha-usaha kecil.", "Jadikan setiap hari mahakarya Anda.", "Percayalah pada proses.", "Satu-satunya batasan adalah pikiran Anda.", "Terus bergerak maju, jangan melihat ke belakang.", "Tindakan adalah kunci dasar untuk semua kesuksesan.", "Semangatmu adalah apimu. Jaga agar tetap menyala.", "Setiap pencapaian dimulai dengan keputusan untuk mencoba.", "Jangan takut gagal, takutlah tidak mencoba.", "Anda lebih kuat dari yang Anda kira.", "Lakukan yang terbaik, dan lupakan sisanya.", "Mimpi besar dimulai dengan satu langkah.", "Jadilah versi terbaik dari dirimu hari ini.", "Tantangan membuat hidup menarik.", "Konsistensi lebih penting dari kesempurnaan.", "Fokus pada tujuan, bukan rintangan.", "Kesabaran adalah kunci kemenangan.", "Setiap hari adalah halaman baru dalam ceritamu.", "Jangan menunggu kesempatan, ciptakanlah.", "Tetap positif, bekerja keras, dan wujudkan.", "Belajar dari kemarin, hidup untuk hari ini.", "Kekuatan tidak datang dari kemenangan, tapi dari perjuangan.", "Keajaiban terjadi saat Anda tidak menyerah.", "Lakukan sesuatu hari ini yang akan membuat dirimu di masa depan berterimakasih.", "Jatuh tujuh kali, bangkit delapan kali."
  ],
  es: [
    "Cada pequeño paso es un progreso.", "Enfócate en el progreso, no en la perfección.", "Hoy es una nueva oportunidad para crecer.", "El trabajo duro de hoy es la victoria de mañana.", "No te detengas cuando estés cansado, detente cuando hayas terminado.", "Empieza donde estás. Usa lo que tienes.", "El éxito es la suma de pequeños esfuerzos.", "Haz de cada día tu obra maestra.", "Confía en el proceso.", "El único límite es tu mente.", "Sigue avanzando, no mires atrás.", "La acción es la clave fundamental de todo éxito.", "Tu pasión es tu fuego. Mantenlo encendido.", "Cada logro comienza con la decisión de intentarlo.", "No tengas miedo de fallar, ten miedo de no intentarlo.", "Eres más fuerte de lo que crees.", "Haz lo mejor que puedas y olvida el resto.", "Los grandes sueños comienzan con un solo paso.", "Sé la mejor versión de ti mismo hoy.", "Los desafíos hacen la vida interesante.", "La constancia es más importante que la perfección.", "Concéntrate en la meta, no en los obstáculos.", "La paciencia es la clave de la victoria.", "Cada día es una nueva página en tu historia.", "No esperes la oportunidad, créala.", "Mantente positivo, trabaja duro y haz que suceda.", "Aprende de ayer, vive para hoy.", "La fuerza no viene de la victoria, sino de la lucha.", "Los milagros ocurren cuando no te rindes.", "Haz algo hoy por lo que tu yo futuro te lo agradecerá.", "Cae siete veces, levántate ocho."
  ],
  fr: [
    "Chaque petit pas est un progrès.", "Concentrez-vous sur le progrès, pas sur la perfection.", "Aujourd'hui est une nouvelle opportunité de grandir.", "Le travail acharné d'aujourd'hui est la victoire de demain.", "Ne vous arrêtez pas lorsque vous êtes fatigué, arrêtez-vous lorsque vous avez terminé.", "Commencez là où vous êtes. Utilisez ce que vous avez.", "Le succès est la somme de petits efforts.", "Faites de chaque jour votre chef-d'œuvre.", "Faites confiance au processus.", "La seule limite est votre esprit.", "Continuez d'avancer, ne regardez pas en arrière.", "L'action est la clé fondamentale de tout succès.", "Votre passion est votre feu. Maintenez-le allumé.", "Chaque accomplissement commence par la decisión d'essayer.", "N'ayez pas peur d'échouer, ayez peur de ne pas essayer.", "Vous êtes plus fort que vous ne le pensez.", "Faites de votre mieux et oubliez le reste.", "Les grands rêves commencent par un pas.", "Soyez la meilleure version de vous-même aujourd'hui.", "Les défis rendent la vie intéressante.", "La constance est plus importante que la perfection.", "Concentrez-vous sur l'objectif, pas sur les obstacles.", "La patience est la clé de la victoire.", "Chaque jour est une nouvelle page de votre histoire.", "N'attendez pas l'opportunité, créez-la.", "Restez positif, travaillez dur et réalisez-le.", "Apprenez d'hier, vivez pour aujourd'hui.", "La force ne vient pas de la victoire, mais de la lutte.", "Les miracles se produisent lorsque vous n'abandonnez pas.", "Faites quelque chose aujourd'hui que votre futur vous remerciera.", "Tombez sept fois, relevez-vous huit fois."
  ],
  de: [
    "Jeder kleine Schritt ist ein Fortschritt.", "Konzentriere dich auf den Fortschritt, nicht auf die Perfektion.", "Heute ist eine neue Gelegenheit zu wachsen.", "Harte Arbeit heute ist der Sieg von morgen.", "Höre nicht auf, wenn du müde bist, sondern wenn du fertig bist.", "Beginne dort, wo du bist. Nutze, was du hast.", "Erfolg ist die Summe kleiner Anstrengungen.", "Mache jeden Tag zu deinem Meisterwerk.", "Vertraue dem Prozess.", "Die einzige Grenze ist dein Verstand.", "Gehe weiter vorwärts, schaue nicht zurück.", "Handeln ist der grundlegende Schlüssel zu jedem Erfolg.", "Deine Leidenschaft ist dein Feuer. Halte es am Brennen.", "Jede Errungenschaft beginnt mit der Entscheidung, es zu versuchen.", "Habe keine Angst zu scheitern, habe Angst, es nicht zu versuchen.", "Du bist stärker, als du denkst.", "Gib dein Bestes und vergiss den Rest.", "Große Träume beginnen mit einem Schritt.", "Sei heute die beste Version von dir.", "Herausforderungen machen das Leben interessant.", "Beständigkeit ist wichtiger als Perfektion.", "Konzentriere dich auf das Ziel, nicht auf die Hindernisse.", "Geduld ist der Schlüssel zum Sieg.", "Jeder Tag ist eine neue Seite in deiner Geschichte.", "Warte nicht auf die Gelegenheit, schaffe sie.", "Bleib positiv, arbeite hart und verwirkliche es.", "Lerne von gestern, lebe für heute.", "Stärke kommt nicht vom Gewinnen, sondern vom Kämpfen.", "Wunder geschehen, wenn du nicht aufgibst.", "Tue heute etwas, wofür dir dein zukünftiges Ich danken wird.", "Falle siebenmal hin, stehe achtmal auf."
  ],
  ja: [
    "小さな一歩も進歩です。", "完璧さではなく、進歩に焦点を当てなさい。", "今日は成長するための新しい機会です。", "今日の努力は明日の勝利です。", "疲れたときにやめるのではなく、終わったときにやめなさい。", "今いる場所から始めなさい。持っているものを使いなさい。", "成功は小さな努力の積み重ねです。", "毎日をあなたの傑作にしなさい。", "プロセスを信じなさい。", "唯一の限界はあなたの心です。", "前進し続け、振り返るな。", "行動こそがすべての成功の基本的な鍵です。", "あなたの情熱はあなたの火です。燃やし続けなさい。", "すべての達成は、試みるという決断から始まります。", "失敗を恐れるな、挑戦しないことを恐れなさい。", "あなたは自分が思っているよりも強い。", "最善を尽くし、残りは忘れなさい。", "大きな夢は一歩から始まります。", "今日の最高の自分でありなさい。", "挑戦が人生を面白くします。", "完璧さよりも一貫性が重要です。", "障害ではなく、目標に集中しなさい。", "忍耐は勝利の鍵です。", "毎日はあなたの物語の新しいページです。", "機会を待つな、作り出しなさい。", "前向きに、一生懸命働き、実現させなさい。", "昨日から学び、今日を生きなさい。", "強さは勝利からではなく、闘いから生まれます。", "諦めないときに奇跡は起こります。", "未来の自分が感謝するようなことを今日しなさい。", "七転び八起き。"
  ],
  ko: [
    "모든 작은 발걸음이 진전입니다.", "완벽이 아닌 진전에 집중하세요.", "오늘은 성장할 새로운 기회입니다.", "오늘의 노력이 내일의 승리입니다.", "피곤할 때 멈추지 말고, 끝났을 때 멈추세요.", "지금 있는 곳에서 시작하세요. 가진 것을 사용하세요.", "성공은 작은 노력들의 합입니다.", "매일을 당신의 걸작으로 만드세요.", "과정을 믿으세요.", "유일한 한계는 당신의 마음입니다.", "계속 나아가고, 뒤돌아보지 마세요.", "행동이 모든 성공의 기본 열쇠입니다.", "당신의 열정은 당신의 불입니다. 계속 타오르게 하세요.", "모든 성취는 시도하려는 결심에서 시작됩니다.", "실패를 두려워하지 말고, 시도하지 않는 것을 두려워하세요.", "당신은 생각보다 강합니다.", "최선을 다하고 나머지는 잊어버리세요.", "큰 꿈은 한 걸음에서 시작됩니다.", "오늘 최고의 자신이 되세요.", "도전이 인생을 흥미롭게 만듭니다.", "완벽함보다 일관성이 더 중요합니다.", "장애물이 아닌 목표에 집중하세요.", "인내가 승리의 열쇠입니다.", "매일이 당신 이야기의 새로운 페이지입니다.", "기회를 기다리지 말고, 만드세요.", "긍정적으로 생각하고, 열심히 일하고, 실현하세요.", "어제로부터 배우고, 오늘을 위해 사세요.", "힘은 이기는 것에서 오는 것이 아니라, 고군분투에서 옵니다.", "포기하지 않을 때 기적은 일어납니다.", "미래의 당신이 감사할 일을 오늘 하세요.", "일곱 번 넘어져도 여덟 번 일어나라."
  ],
  'zh-CN': [
    "每走一小步都是进步。", "注重进步，而非完美。", "今天是成长的又一个新机会。", "今天的辛勤努力是明天的胜利。", "不要在疲惫时停下，而要在完成时停下。", "从你所在的地方开始。利用你所拥有的。", "成功是点滴努力的积累。", "让每一天都成为你的杰作。", "相信过程。", "唯一的限制是你的思想。", "勇往直前，不要回头。", "行动是所有成功的根本关键。", "你的热情是你的火焰。让它持续燃烧。", "每一项成就都始于尝试的决心。", "不要害怕失败，要害怕不去尝试。", "你比你想象的更强大。", "尽力而为，其余的顺其自然。", "伟大的梦想始于一步。", "做今天最好的自己。", "挑战使生活变得有趣。", "持之以恒比完美更重要。", "专注于目标，而不是障碍。", "耐心是胜利的关键。", "每一天都是你故事的新篇章。", "不要等待机会，要创造机会。", "保持积极，努力工作，让它成真。", "学习昨天，活在今天。", "力量并非来自胜利，而是来自奋斗。", "奇迹在你永不放弃时发生。", "今天做一些你未来会感谢自己的事。", "七次跌倒，八次爬起。"
  ]
};

const translations = {
    en: {
        goodMorning: (name: string) => `Good morning, ${name}!`,
        goodAfternoon: (name: string) => `Good afternoon, ${name}!`,
        goodEvening: (name: string) => `Good evening, ${name}!`,
        goodNight: (name: string) => `Good night, ${name}!`,
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
        selectUnit: "Select a unit",
        supplierNamePlaceholder: "e.g., Supplier Name",
        customerDeptPlaceholder: "e.g., Customer, Department",
        optionalPhotoUrl: "Optional: https://...",
        searchItem: "Search item...",
        noItemFound: "No item found.",
        unitsFull: {
          "Pcs": "Pcs", "Pack": "Pack", "Box": "Box", "Roll": "Roll", "Rim": "Rim", "Tube": "Tube", "Bottle": "Bottle", "Can": "Can", "Sheet": "Sheet", "Cartridge": "Cartridge"
        }
    },
    id: {
        goodMorning: (name: string) => `Selamat pagi, ${name}!`,
        goodAfternoon: (name: string) => `Selamat siang, ${name}!`,
        goodEvening: (name: string) => `Selamat sore, ${name}!`,
        goodNight: (name: string) => `Selamat malam, ${name}!`,
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
        selectUnit: "Pilih unit",
        supplierNamePlaceholder: "contoh: Nama Pemasok",
        customerDeptPlaceholder: "contoh: Pelanggan, Departemen",
        optionalPhotoUrl: "Opsional: https://...",
        searchItem: "Cari item...",
        noItemFound: "Item tidak ditemukan.",
        unitsFull: {
          "Pcs": "Pcs", "Pack": "Pak", "Box": "Kotak", "Roll": "Gulungan", "Rim": "Rim", "Tube": "Tabung", "Bottle": "Botol", "Can": "Kaleng", "Sheet": "Lembar", "Cartridge": "Kartrid"
        }
    },
    es: {
        goodMorning: (name: string) => `Buenos días, ${name}!`,
        goodAfternoon: (name: string) => `Buenas tardes, ${name}!`,
        goodEvening: (name: string) => `Buenas tardes, ${name}!`,
        goodNight: (name: string) => `Buenas noches, ${name}!`,
        totalItems: "Total de Artículos",
        stockValue: "Valor del Stock",
        lowStock: "Stock Bajo",
        outOfStock: "Sin Stock",
        pendingApprovals: "Aprobaciones Pendientes",
        quickActions: "Acciones Rápidas",
        commonTasks: "Tareas comunes",
        addItem: "Añadir Artículo",
        addItemDesc: "Nuevo artículo de inventario",
        stockIn: "Entrada de Stock",
        stockInDesc: "Recibir artículos",
        stockOut: "Salida de Stock",
        stockOutDesc: "Entregar artículos",
        createPO: "Crear OC",
        createPODesc: "Orden de compra",
        stockMovement: "Tendencias de Movimiento de Stock",
        last6Months: "Actividad de los últimos 6 meses",
        last7Days: "Actividad de los últimos 7 días",
        daily: "Diario",
        monthly: "Mensual",
        allitems: "Todos los Artículos",
        recentTransactions: "Transacciones Recientes",
        recentTransactionsDesc: "Los últimos movimientos de stock en tu inventario.",
        item: "Artículo",
        qty: "Cant",
        type: "Tipo",
        noTransactions: "Aún no se han registrado transacciones.",
        transactionDetails: "Detalles de la Transacción",
        transactionDetailsDesc: "Información detallada sobre el movimiento de stock.",
        date: "Fecha",
        itemName: "Nombre del Artículo",
        quantity: "Cantidad",
        from: "De",
        to: "A",
        stockStatusTitle: (title: string) => `Artículos con Stock ${title}`,
        stockStatusDesc: (title: string) => `Una lista de todos los artículos que actualmente tienen ${title.toLowerCase()}.`,
        addNewItem: "Añadir Nuevo Artículo de Inventario",
        addNewItemDesc: "Rellena los detalles a continuación para añadir un nuevo producto.",
        name: "Nombre",
        price: "Precio",
        unit: "Unidad",
        photoUrl: "URL de la Foto",
        saveItem: "Guardar Artículo",
        recordStockIn: "Registrar Entrada de Stock",
        recordStockInDesc: "Añadir nuevo stock recibido para un artículo.",
        addStock: "Añadir Stock",
        recordStockOut: "Registrar Salida de Stock",
        recordStockOutDesc: "Registrar stock que ha sido vendido o utilizado.",
        removeStock: "Retirar Stock",
        createNewPO: "Crear Nueva Pre-Orden",
        createNewPODesc: "Rellena los detalles para la nueva pre-orden.",
        poNumber: "Número de OC",
        expectedDate: "Fecha Prevista",
        createPreOrder: "Crear Pre-Orden",
        unitRequired: "La unidad es requerida",
        unitRequiredDesc: "Por favor, selecciona una unidad para el artículo.",
        itemRequired: "Por favor, selecciona un artículo.",
        fieldRequired: "Campo Requerido",
        fieldRequiredDesc: "Este campo no puede estar vacío.",
        negativeStock: "El stock no puede ser negativo.",
        selectUnit: "Selecciona una unidad",
        supplierNamePlaceholder: "ej., Nombre del Proveedor",
        customerDeptPlaceholder: "ej., Cliente, Departamento",
        optionalPhotoUrl: "Opcional: https://...",
        searchItem: "Buscar artículo...",
        noItemFound: "No se encontró ningún artículo.",
        unitsFull: {
            "Pcs": "Pzs", "Pack": "Paquete", "Box": "Caja", "Roll": "Rollo", "Rim": "Resma", "Tube": "Tubo", "Bottle": "Botella", "Can": "Lata", "Sheet": "Hoja", "Cartridge": "Cartucho"
        }
    },
    fr: {
        goodMorning: (name: string) => `Bonjour, ${name}!`,
        goodAfternoon: (name: string) => `Bon après-midi, ${name}!`,
        goodEvening: (name: string) => `Bonsoir, ${name}!`,
        goodNight: (name: string) => `Bonne nuit, ${name}!`,
        totalItems: "Total des Articles",
        stockValue: "Valeur du Stock",
        lowStock: "Stock Faible",
        outOfStock: "En Rupture de Stock",
        pendingApprovals: "Approbations en Attente",
        quickActions: "Actions Rapides",
        commonTasks: "Tâches courantes",
        addItem: "Ajouter un Article",
        addItemDesc: "Nouvel article d'inventaire",
        stockIn: "Entrée de Stock",
        stockInDesc: "Recevoir des articles",
        stockOut: "Sortie de Stock",
        stockOutDesc: "Délivrer des articles",
        createPO: "Créer un BC",
        createPODesc: "Bon de commande",
        stockMovement: "Tendances des Mouvements de Stock",
        last6Months: "Activité des 6 derniers mois",
        last7Days: "Activité des 7 derniers jours",
        daily: "Quotidien",
        monthly: "Mensuel",
        allitems: "Tous les Articles",
        recentTransactions: "Transactions Récentes",
        recentTransactionsDesc: "Les derniers mouvements de stock dans votre inventaire.",
        item: "Article",
        qty: "Qté",
        type: "Type",
        noTransactions: "Aucune transaction enregistrée pour le moment.",
        transactionDetails: "Détails de la Transaction",
        transactionDetailsDesc: "Informations détaillées sur le mouvement de stock.",
        date: "Date",
        itemName: "Nom de l'Article",
        quantity: "Quantité",
        from: "De",
        to: "À",
        stockStatusTitle: (title: string) => `Articles en ${title}`,
        stockStatusDesc: (title: string) => `Une liste de tous les articles qui sont actuellement en ${title.toLowerCase()}.`,
        addNewItem: "Ajouter un Nouvel Article à l'Inventaire",
        addNewItemDesc: "Remplissez les détails ci-dessous pour ajouter un nouveau produit.",
        name: "Nom",
        price: "Prix",
        unit: "Unité",
        photoUrl: "URL de la Photo",
        saveItem: "Enregistrer l'Article",
        recordStockIn: "Enregistrer une Entrée de Stock",
        recordStockInDesc: "Ajouter le nouveau stock reçu pour un article.",
        addStock: "Ajouter du Stock",
        recordStockOut: "Enregistrer une Sortie de Stock",
        recordStockOutDesc: "Enregistrer le stock vendu ou utilisé.",
        removeStock: "Retirer du Stock",
        createNewPO: "Créer une Nouvelle Pré-Commande",
        createNewPODesc: "Remplissez les détails de la nouvelle pré-commande.",
        poNumber: "Numéro de BC",
        expectedDate: "Date Prévue",
        createPreOrder: "Créer une Pré-Commande",
        unitRequired: "L'unité est requise",
        unitRequiredDesc: "Veuillez sélectionner une unité pour l'article.",
        itemRequired: "Veuillez sélectionner un article.",
        fieldRequired: "Champ Requis",
        fieldRequiredDesc: "Ce champ ne peut pas être vide.",
        negativeStock: "Le stock ne peut pas être négatif.",
        selectUnit: "Sélectionnez une unité",
        supplierNamePlaceholder: "ex., Nom du Fournisseur",
        customerDeptPlaceholder: "ex., Client, Département",
        optionalPhotoUrl: "Facultatif : https://...",
        searchItem: "Rechercher un article...",
        noItemFound: "Aucun article trouvé.",
        unitsFull: {
            "Pcs": "Pcs", "Pack": "Paquet", "Box": "Boîte", "Roll": "Rouleau", "Rim": "Rame", "Tube": "Tube", "Bottle": "Bouteille", "Can": "Canette", "Sheet": "Feuille", "Cartridge": "Cartouche"
        }
    },
    de: {
        goodMorning: (name: string) => `Guten Morgen, ${name}!`,
        goodAfternoon: (name: string) => `Guten Tag, ${name}!`,
        goodEvening: (name: string) => `Guten Abend, ${name}!`,
        goodNight: (name: string) => `Gute Nacht, ${name}!`,
        totalItems: "Gesamtanzahl Artikel",
        stockValue: "Lagerwert",
        lowStock: "Niedriger Lagerbestand",
        outOfStock: "Nicht vorrätig",
        pendingApprovals: "Ausstehende Genehmigungen",
        quickActions: "Schnellaktionen",
        commonTasks: "Häufige Aufgaben",
        addItem: "Artikel Hinzufügen",
        addItemDesc: "Neuer Inventarartikel",
        stockIn: "Wareneingang",
        stockInDesc: "Artikel erhalten",
        stockOut: "Warenausgang",
        stockOutDesc: "Artikel ausgeben",
        createPO: "Bestellung Erstellen",
        createPODesc: "Bestellauftrag",
        stockMovement: "Lagerbewegungstrends",
        last6Months: "Aktivität der letzten 6 Monate",
        last7Days: "Aktivität der letzten 7 Tage",
        daily: "Täglich",
        monthly: "Monatlich",
        allitems: "Alle Artikel",
        recentTransactions: "Letzte Transaktionen",
        recentTransactionsDesc: "Die neuesten Lagerbewegungen in Ihrem Inventar.",
        item: "Artikel",
        qty: "Menge",
        type: "Typ",
        noTransactions: "Noch keine Transaktionen erfasst.",
        transactionDetails: "Transaktionsdetails",
        transactionDetailsDesc: "Detaillierte Informationen zur Lagerbewegung.",
        date: "Datum",
        itemName: "Artikelname",
        quantity: "Menge",
        from: "Von",
        to: "An",
        stockStatusTitle: (title: string) => `${title} Artikel`,
        stockStatusDesc: (title: string) => `Eine Liste aller Artikel, die derzeit ${title.toLowerCase()} sind.`,
        addNewItem: "Neuen Inventarartikel Hinzufügen",
        addNewItemDesc: "Füllen Sie die folgenden Details aus, um ein neues Produkt hinzuzufügen.",
        name: "Name",
        price: "Preis",
        unit: "Einheit",
        photoUrl: "Foto-URL",
        saveItem: "Artikel Speichern",
        recordStockIn: "Wareneingang Erfassen",
        recordStockInDesc: "Neuen Wareneingang für einen Artikel hinzufügen.",
        addStock: "Lagerbestand Hinzufügen",
        recordStockOut: "Warenausgang Erfassen",
        recordStockOutDesc: "Verkauften oder verbrauchten Lagerbestand erfassen.",
        removeStock: "Lagerbestand Entfernen",
        createNewPO: "Neue Vorbestellung Erstellen",
        createNewPODesc: "Füllen Sie die Details für die neue Vorbestellung aus.",
        poNumber: "Bestellnummer",
        expectedDate: "Erwartetes Datum",
        createPreOrder: "Vorbestellung Erstellen",
        unitRequired: "Einheit ist erforderlich",
        unitRequiredDesc: "Bitte wählen Sie eine Einheit für den Artikel.",
        itemRequired: "Bitte wählen Sie einen Artikel aus.",
        fieldRequired: "Feld Erforderlich",
        fieldRequiredDesc: "Dieses Feld darf nicht leer sein.",
        negativeStock: "Der Lagerbestand darf nicht negativ sein.",
        selectUnit: "Wählen Sie eine Einheit",
        supplierNamePlaceholder: "z.B., Lieferantenname",
        customerDeptPlaceholder: "z.B., Kunde, Abteilung",
        optionalPhotoUrl: "Optional: https://...",
        searchItem: "Artikel suchen...",
        noItemFound: "Kein Artikel gefunden.",
        unitsFull: {
            "Pcs": "Stk", "Pack": "Packung", "Box": "Kasten", "Roll": "Rolle", "Rim": "Ries", "Tube": "Tube", "Bottle": "Flasche", "Can": "Dose", "Sheet": "Blatt", "Cartridge": "Patrone"
        }
    },
    ja: {
        goodMorning: (name: string) => `おはようございます、${name}さん！`,
        goodAfternoon: (name: string) => `こんにちは、${name}さん！`,
        goodEvening: (name: string) => `こんばんは、${name}さん！`,
        goodNight: (name: string) => `おやすみなさい、${name}さん！`,
        totalItems: "総アイテム数",
        stockValue: "在庫評価額",
        lowStock: "在庫僅少",
        outOfStock: "在庫切れ",
        pendingApprovals: "承認待ち",
        quickActions: "クイックアクション",
        commonTasks: "一般的なタスク",
        addItem: "アイテムを追加",
        addItemDesc: "新しい在庫アイテム",
        stockIn: "入荷",
        stockInDesc: "アイテムを受け取る",
        stockOut: "出庫",
        stockOutDesc: "アイテムを払い出す",
        createPO: "発注書を作成",
        createPODesc: "発注書",
        stockMovement: "在庫変動トレンド",
        last6Months: "過去6ヶ月のアクティビティ",
        last7Days: "過去7日間のアクティビティ",
        daily: "毎日",
        monthly: "毎月",
        allitems: "すべてのアイテム",
        recentTransactions: "最近の取引",
        recentTransactionsDesc: "あなたの在庫における最新の在庫変動。",
        item: "アイテム",
        qty: "数量",
        type: "タイプ",
        noTransactions: "まだ取引は記録されていません。",
        transactionDetails: "取引詳細",
        transactionDetailsDesc: "在庫変動に関する詳細情報。",
        date: "日付",
        itemName: "アイテム名",
        quantity: "数量",
        from: "から",
        to: "へ",
        stockStatusTitle: (title: string) => `${title}のアイテム`,
        stockStatusDesc: (title: string) => `現在${title.toLowerCase()}のすべてのアイテムのリスト。`,
        addNewItem: "新しい在庫アイテムを追加",
        addNewItemDesc: "新しい製品を追加するには、以下の詳細を入力してください。",
        name: "名前",
        price: "価格",
        unit: "単位",
        photoUrl: "写真URL",
        saveItem: "アイテムを保存",
        recordStockIn: "入荷を記録",
        recordStockInDesc: "アイテムの新しい入荷を記録します。",
        addStock: "在庫を追加",
        recordStockOut: "出庫を記録",
        recordStockOutDesc: "販売または使用された在庫を記録します。",
        removeStock: "在庫を削除",
        createNewPO: "新しい先行予約を作成",
        createNewPODesc: "新しい先行予約の詳細を入力してください。",
        poNumber: "発注番号",
        expectedDate: "予定日",
        createPreOrder: "先行予約を作成",
        unitRequired: "単位は必須です",
        unitRequiredDesc: "アイテムの単位を選択してください。",
        itemRequired: "アイテムを選択してください。",
        fieldRequired: "必須フィールド",
        fieldRequiredDesc: "このフィールドは空にできません。",
        negativeStock: "在庫はマイナスにできません。",
        selectUnit: "単位を選択",
        supplierNamePlaceholder: "例：サプライヤー名",
        customerDeptPlaceholder: "例：顧客、部門",
        optionalPhotoUrl: "オプション: https://...",
        searchItem: "アイテムを検索...",
        noItemFound: "アイテムが見つかりません。",
        unitsFull: {
            "Pcs": "個", "Pack": "パック", "Box": "箱", "Roll": "ロール", "Rim": "連", "Tube": "チューブ", "Bottle": "ボトル", "Can": "缶", "Sheet": "枚", "Cartridge": "カートリッジ"
        }
    },
    ko: {
        goodMorning: (name: string) => `좋은 아침입니다, ${name}님!`,
        goodAfternoon: (name: string) => `안녕하세요, ${name}님!`,
        goodEvening: (name: string) => `좋은 저녁입니다, ${name}님!`,
        goodNight: (name: string) => `안녕히 주무세요, ${name}님!`,
        totalItems: "총 품목 수",
        stockValue: "재고 가치",
        lowStock: "재고 부족",
        outOfStock: "재고 없음",
        pendingApprovals: "승인 대기 중",
        quickActions: "빠른 작업",
        commonTasks: "일반적인 작업",
        addItem: "품목 추가",
        addItemDesc: "새 재고 품목",
        stockIn: "입고",
        stockInDesc: "품목 수령",
        stockOut: "출고",
        stockOutDesc: "품목 출고",
        createPO: "발주서 생성",
        createPODesc: "구매 주문서",
        stockMovement: "재고 이동 추세",
        last6Months: "최근 6개월 활동",
        last7Days: "최근 7일 활동",
        daily: "매일",
        monthly: "매월",
        allitems: "모든 품목",
        recentTransactions: "최근 거래",
        recentTransactionsDesc: "재고의 최신 재고 이동 내역입니다。",
        item: "품목",
        qty: "수량",
        type: "유형",
        noTransactions: "아직 기록된 거래가 없습니다.",
        transactionDetails: "거래 세부 정보",
        transactionDetailsDesc: "재고 이동에 대한 자세한 정보입니다。",
        date: "날짜",
        itemName: "품목명",
        quantity: "수량",
        from: "보낸 사람",
        to: "받는 사람",
        stockStatusTitle: (title: string) => `${title} 품목`,
        stockStatusDesc: (title: string) => `현재 ${title.toLowerCase()} 상태인 모든 품목 목록입니다.`,
        addNewItem: "새 재고 품목 추가",
        addNewItemDesc: "새 제품을 추가하려면 아래 세부 정보를 입력하세요.",
        name: "이름",
        price: "가격",
        unit: "단위",
        photoUrl: "사진 URL",
        saveItem: "품목 저장",
        recordStockIn: "입고 기록",
        recordStockInDesc: "품목에 대한 새 입고를 추가합니다.",
        addStock: "재고 추가",
        recordStockOut: "출고 기록",
        recordStockOutDesc: "판매되거나 사용된 재고를 기록합니다.",
        removeStock: "재고 제거",
        createNewPO: "새 선주문 생성",
        createNewPODesc: "새 선주문에 대한 세부 정보를 입력하세요.",
        poNumber: "발주 번호",
        expectedDate: "예상 날짜",
        createPreOrder: "선주문 생성",
        unitRequired: "단위는 필수입니다",
        unitRequiredDesc: "품목의 단위를 선택하세요.",
        itemRequired: "품목을 선택하세요.",
        fieldRequired: "필수 필드",
        fieldRequiredDesc: "이 필드는 비워 둘 수 없습니다.",
        negativeStock: "재고는 음수가 될 수 없습니다.",
        selectUnit: "단위를 선택하세요",
        supplierNamePlaceholder: "예: 공급업체 이름",
        customerDeptPlaceholder: "예: 고객, 부서",
        optionalPhotoUrl: "선택 사항: https://...",
        searchItem: "품목 검색...",
        noItemFound: "품목을 찾을 수 없습니다.",
        unitsFull: {
            "Pcs": "개", "Pack": "팩", "Box": "상자", "Roll": "롤", "Rim": "연", "Tube": "튜브", "Bottle": "병", "Can": "캔", "Sheet": "장", "Cartridge": "카트리지"
        }
    },
    'zh-CN': {
        goodMorning: (name: string) => `早上好, ${name}!`,
        goodAfternoon: (name: string) => `下午好, ${name}!`,
        goodEvening: (name: string) => `晚上好, ${name}!`,
        goodNight: (name: string) => `晚安, ${name}!`,
        totalItems: "物品总数",
        stockValue: "库存价值",
        lowStock: "低库存",
        outOfStock: "缺货",
        pendingApprovals: "待审批",
        quickActions: "快捷操作",
        commonTasks: "常见任务",
        addItem: "添加物品",
        addItemDesc: "新库存物品",
        stockIn: "入库",
        stockInDesc: "接收物品",
        stockOut: "出库",
        stockOutDesc: "发出物品",
        createPO: "创建采购订单",
        createPODesc: "采购订单",
        stockMovement: "库存变动趋势",
        last6Months: "过去6个月的活动",
        last7Days: "过去7天的活动",
        daily: "每日",
        monthly: "每月",
        allitems: "所有物品",
        recentTransactions: "最近的交易",
        recentTransactionsDesc: "您库存中最新的库存变动。",
        item: "物品",
        qty: "数量",
        type: "类型",
        noTransactions: "暂无交易记录。",
        transactionDetails: "交易详情",
        transactionDetailsDesc: "关于库存变动的详细信息。",
        date: "日期",
        itemName: "物品名称",
        quantity: "数量",
        from: "从",
        to: "至",
        stockStatusTitle: (title: string) => `${title}物品`,
        stockStatusDesc: (title: string) => `所有当前${title.toLowerCase()}的物品列表。`,
        addNewItem: "添加新库存物品",
        addNewItemDesc: "填写以下详细信息以添加新产品。",
        name: "名称",
        price: "价格",
        unit: "单位",
        photoUrl: "照片链接",
        saveItem: "保存物品",
        recordStockIn: "记录入库",
        recordStockInDesc: "为物品添加入库的新库存。",
        addStock: "添加入库",
        recordStockOut: "记录出库",
        recordStockOutDesc: "记录已售出或已使用的库存。",
        removeStock: "移除库存",
        createNewPO: "创建新预购单",
        createNewPODesc: "填写新预购单的详细信息。",
        poNumber: "采购订单号",
        expectedDate: "预计日期",
        createPreOrder: "创建预购单",
        unitRequired: "单位是必需的",
        unitRequiredDesc: "请为物品选择一个单位。",
        itemRequired: "请选择一个物品。",
        fieldRequired: "必填字段",
        fieldRequiredDesc: "此字段不能为空。",
        negativeStock: "库存不能为负。",
        selectUnit: "选择一个单位",
        supplierNamePlaceholder: "例如，供应商名称",
        customerDeptPlaceholder: "例如，客户、部门",
        optionalPhotoUrl: "可选：https://...",
        searchItem: "搜索物品...",
        noItemFound: "未找到物品。",
        unitsFull: {
            "Pcs": "件", "Pack": "包", "Box": "盒", "Roll": "卷", "Rim": "令", "Tube": "管", "Bottle": "瓶", "Can": "罐", "Sheet": "张", "Cartridge": "墨盒"
        }
    },
};


type GreetingInfo = {
  text: string;
  icon: React.ElementType;
};

interface DashboardClientContentProps {
  initialInventoryItems: InventoryItem[];
  initialTransactions: Transaction[];
  initialRecentTransactions: Transaction[];
  initialPreOrders: PreOrder[];
}

export function DashboardClientContent({
  initialInventoryItems,
  initialTransactions,
  initialRecentTransactions,
  initialPreOrders,
}: DashboardClientContentProps) {
  const [inventoryItems, setInventoryItems] = React.useState<InventoryItem[]>(
    initialInventoryItems
  );
  const [transactions, setTransactions] = React.useState<Transaction[]>(initialTransactions);
  const [recentTransactions, setRecentTransactions] = React.useState<
    Transaction[]
  >(initialRecentTransactions);
  const [preOrders, setPreOrders] = React.useState<PreOrder[]>(initialPreOrders);
  const [selectedChartItem, setSelectedChartItem] =
    React.useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] =
    React.useState<Transaction | null>(null);
  const [isDetailsOpen, setDetailsOpen] = React.useState(false);
  const [greetingInfo, setGreetingInfo] = React.useState<GreetingInfo>({ text: "", icon: Sun });
  const [dailyQuote, setDailyQuote] = React.useState("");
  const router = useRouter();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const { user, loading: authLoading } = useAuth();
  const [showLogin, setShowLogin] = React.useState(false);
  const { language } = useTheme();
  const { playNotificationSound } = useAudio();

  const t = translations[language] || translations.en;

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
  const [chartType, setChartType] = React.useState<'bar' | 'line' | 'area'>('area');
  const [timePeriod, setTimePeriod] = React.useState<'monthly' | 'daily'>('daily');

  // Set up real-time listeners for data that needs to be fresh
  React.useEffect(() => {
    if (!db) return;

    const unsubs: (() => void)[] = [];

    // Only listen to inventory for real-time updates.
    // Transactions are handled by the notification hook for sounds.
    // The main list is passed as initial data.
    const qInventory = query(collection(db, "inventory"), orderBy("name"));
    unsubs.push(onSnapshot(qInventory, (snapshot) => {
      const items: InventoryItem[] = [];
      snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() } as InventoryItem));
      setInventoryItems(items);
    }));
    
    // We still need to listen to pre-orders to get the awaiting approval count
     const qPreOrders = query(collection(db, "pre-orders"), orderBy("orderDate", "desc"));
    unsubs.push(onSnapshot(qPreOrders, (snapshot) => {
        const orders: PreOrder[] = [];
        snapshot.forEach((doc) => orders.push({ id: doc.id, ...doc.data() } as PreOrder));
        setPreOrders(orders);
    }));

    // This listener is for the chart data, to keep it reasonably fresh
    const qTransactions = query(collection(db, "transactions"), orderBy("date", "desc"));
    unsubs.push(onSnapshot(qTransactions, (snapshot) => {
     const trans: Transaction[] = [];
     snapshot.forEach((doc) => trans.push({ id: doc.id, ...doc.data() } as Transaction));
     setTransactions(trans);
     setRecentTransactions(trans.slice(0, 5));
   }));

    return () => unsubs.forEach(unsub => unsub());
  }, []);


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
    const getUserDisplayName = () => {
        if (!user || !user.email) return '';
        const email = user.email;
        switch (email) {
            case 'devaadmin@gmail.com':
                return 'deva';
            case 'krezthrd@gmail.com':
                return 'HRD';
            case 'kreztservice@gmail.com':
                return 'service';
            case 'kreztuser@gmail.com':
                return 'user';
            default:
                const namePart = email.split('@')[0];
                return namePart.charAt(0).toUpperCase() + namePart.slice(1);
        }
    }

    const getGreeting = (): GreetingInfo => {
        const displayName = getUserDisplayName();
        const now = new Date();
        const utcOffset = now.getTimezoneOffset() * 60000;
        const wibOffset = 7 * 3600000;
        const wibTime = new Date(now.getTime() + utcOffset + wibOffset);
        const currentHour = wibTime.getHours();

        if (currentHour >= 1 && currentHour < 11) {
            return { text: t.goodMorning(displayName), icon: Sun };
        } else if (currentHour >= 11 && currentHour < 15) {
            return { text: t.goodAfternoon(displayName), icon: Sun };
        } else if (currentHour >= 15 && currentHour < 19) {
            return { text: t.goodEvening(displayName), icon: Sunset };
        } else {
            return { text: t.goodNight(displayName), icon: Moon };
        }
    };
    if (user) {
      setGreetingInfo(getGreeting());
    }

    // Set daily motivational quote
    const dayOfMonth = new Date().getDate();
    setDailyQuote(motivationalQuotes[language][dayOfMonth - 1]);
    
  }, [t, language, user]);

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
  
  React.useEffect(() => {
    setSelectedItemName(t.itemRequired);
  }, [t.itemRequired]);

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
      playNotificationSound();
      
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
        setSelectedItemName(t.itemRequired);
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
    
    playNotificationSound();

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
    setSelectedItemName(t.itemRequired);
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

  if (authLoading) {
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
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="p-4 md:p-6">
           <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-2 md:p-3 rounded-full shrink-0">
              <GreetingIcon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold">{greetingInfo.text}</h1>
              <p className="text-muted-foreground text-xs md:text-base">
                {dailyQuote}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-5 md:gap-4">
        <Card
          onClick={isStandardUser || isHrdUser ? undefined : () => router.push("/inventory")}
          className={cn(
            "text-white",
            !isStandardUser && !isHrdUser && "cursor-pointer hover:shadow-lg transition-shadow"
          )}
          style={{ backgroundColor: 'hsl(var(--stock-card-1))' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 md:p-6 md:pb-2">
            <CardTitle className="text-sm font-medium">{t.totalItems}</CardTitle>
            <Package className="h-4 w-4" />
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <div className="text-2xl font-bold">
              {totalItems.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card 
            className="text-white"
            style={{ backgroundColor: 'hsl(var(--stock-card-2))' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 md:p-6 md:pb-2">
            <CardTitle className="text-sm font-medium">{t.stockValue}</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <div className="text-lg md:text-2xl font-bold break-words">
              {formatCurrency(stockValue)}
            </div>
          </CardContent>
        </Card>
        <Card
          onClick={isStandardUser || isHrdUser ? undefined : handleShowLowStock}
          className={cn(
            "text-white",
            !isStandardUser && !isHrdUser && "cursor-pointer hover:shadow-lg transition-shadow"
          )}
           style={{ backgroundColor: 'hsl(var(--stock-card-3))' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 md:p-6 md:pb-2">
            <CardTitle className="text-sm font-medium">{t.lowStock}</CardTitle>
            <AlertCircle className="h-4 w-4" />
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <div className="text-2xl font-bold">{lowStockItems}</div>
          </CardContent>
        </Card>
        <Card
          onClick={isStandardUser || isHrdUser ? undefined : handleShowOutOfStock}
          className={cn(
            "text-white",
            !isStandardUser && !isHrdUser && "cursor-pointer hover:shadow-lg transition-shadow"
          )}
          style={{ backgroundColor: 'hsl(var(--stock-card-4))' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 md:p-6 md:pb-2">
            <CardTitle className="text-sm font-medium">{t.outOfStock}</CardTitle>
            <Ban className="h-4 w-4" />
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <div className="text-2xl font-bold">{outOfStockItems}</div>
          </CardContent>
        </Card>
        <Card
          onClick={isStandardUser ? undefined : () => router.push("/pre-orders")}
          className={cn(
            "col-span-2 md:col-span-1 text-white",
            !isStandardUser && "cursor-pointer hover:shadow-lg transition-shadow"
          )}
          style={{ backgroundColor: 'hsl(var(--stock-card-5))' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 md:p-6 md:pb-2">
            <CardTitle className="text-sm font-medium">
              {t.pendingApprovals}
            </CardTitle>
            <Clock className="h-4 w-4" />
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <div className="text-2xl font-bold">{awaitingApprovalCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
           <CardHeader className="flex flex-row items-center gap-3 p-4 md:p-6">
            <div className="bg-primary/10 p-2 rounded-full">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base md:text-xl">{t.quickActions}</CardTitle>
              <CardDescription className="text-xs md:text-sm">{t.commonTasks}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 p-4 pt-0 md:p-6 md:pt-0">
             <div className="col-span-2 grid grid-cols-2 gap-3 md:flex md:flex-col md:gap-3 md:space-y-0">
                <Button
                onClick={() => setAddOpen(true)}
                className="h-auto w-full justify-start text-left bg-gradient-to-r from-blue-400 to-cyan-400 text-white hover:from-blue-500 hover:to-cyan-500 gap-2 p-3 md:p-4"
                disabled={isHrdUser || isStandardUser}
                >
                <div className="bg-white/20 p-2 rounded-lg">
                    <Plus className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                    <p className="font-semibold text-xs md:text-base">{t.addItem}</p>
                    <p className="font-normal text-[10px] md:text-sm">
                    {t.addItemDesc}
                    </p>
                </div>
                </Button>
                <Button
                onClick={() => setStockInOpen(true)}
                className="h-auto w-full justify-start text-left bg-gradient-to-r from-green-400 to-emerald-400 text-white hover:from-green-500 hover:to-emerald-500 gap-2 p-3 md:p-4"
                disabled={isHrdUser || isStandardUser}
                >
                <div className="bg-white/20 p-2 rounded-lg">
                    <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                    <p className="font-semibold text-xs md:text-base">{t.stockIn}</p>
                    <p className="font-normal text-[10px] md:text-sm">{t.stockInDesc}</p>
                </div>
                </Button>
                <Button
                onClick={() => setStockOutOpen(true)}
                className="h-auto w-full justify-start text-left bg-gradient-to-r from-red-400 to-pink-400 text-white hover:from-red-500 hover:to-pink-500 gap-2 p-3 md:p-4"
                disabled={isHrdUser}
                >
                <div className="bg-white/20 p-2 rounded-lg">
                    <TrendingDown className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                    <p className="font-semibold text-xs md:text-base">{t.stockOut}</p>
                    <p className="font-normal text-[10px] md:text-sm">{t.stockOutDesc}</p>
                </div>
                </Button>
                <Button
                onClick={() => setCreatePoOpen(true)}
                className="h-auto w-full justify-start text-left bg-gradient-to-r from-purple-400 to-indigo-400 text-white hover:from-purple-500 hover:to-indigo-500 gap-2 p-3 md:p-4"
                disabled={isHrdUser || isStandardUser}
                >
                <div className="bg-white/20 p-2 rounded-lg">
                    <FileText className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                    <p className="font-semibold text-xs md:text-base">{t.createPO}</p>
                    <p className="font-normal text-[10px] md:text-sm">{t.createPODesc}</p>
                </div>
                </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-md">
                  <BarChart4 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base md:text-xl">{t.stockMovement}</CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    {timePeriod === 'monthly' ? t.last6Months : t.last7Days}
                  </CardDescription>
                </div>
              </div>
               <div className="flex flex-col md:flex-row w-full md:w-auto items-center gap-2">
                 <div className="flex w-full gap-2">
                    <ToggleGroup 
                      type="single" 
                      defaultValue={chartType}
                      variant="outline" 
                      className="w-full"
                      onValueChange={(value: 'bar' | 'line' | 'area') => value && setChartType(value)}
                    >
                      <ToggleGroupItem value="bar" aria-label="Bar chart" className="px-2 h-9 flex-1">
                        <BarChart4 className="h-4 w-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="line" aria-label="Line chart" className="px-2 h-9 flex-1">
                        <LineChartIcon className="h-4 w-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="area" aria-label="Area chart" className="px-2 h-9 flex-1">
                        <AreaChartIcon className="h-4 w-4" />
                      </ToggleGroupItem>
                    </ToggleGroup>
                    <ToggleGroup 
                      type="single" 
                      defaultValue={timePeriod}
                      variant="outline" 
                      className="w-full"
                      onValueChange={(value: 'daily' | 'monthly') => value && setTimePeriod(value)}
                    >
                      <ToggleGroupItem value="daily" aria-label="Daily view" className="text-xs h-9 flex-1">{t.daily}</ToggleGroupItem>
                      <ToggleGroupItem value="monthly" aria-label="Monthly view" className="text-xs h-9 flex-1">{t.monthly}</ToggleGroupItem>
                    </ToggleGroup>
                 </div>
                <Select
                  value={selectedChartItem}
                  onValueChange={setSelectedChartItem}
                >
                  <SelectTrigger className="w-full h-9 text-xs">
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
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <div className="h-[350px] flex justify-center items-end md:overflow-x-auto">
              <ChartContainer
                config={chartConfig}
                className="min-w-[300px] w-full h-[300px]"
              >
                {chartType === 'bar' && (
                  <BarChart accessibilityLayer data={chartData} margin={{ left: -20 }}>
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
                  <LineChart accessibilityLayer data={chartData} margin={{ left: -20 }}>
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
                  <AreaChart accessibilityLayer data={chartData} margin={{ left: -20 }}>
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
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-xl">{t.recentTransactions}</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            {t.recentTransactionsDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
          {recentTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.item}</TableHead>
                    <TableHead className="text-right">{t.qty}</TableHead>
                    <TableHead className="text-right">
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
                      <TableCell className="text-right">
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
                  <SelectValue placeholder={t.selectUnit} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(t.unitsFull).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
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
                placeholder={t.optionalPhotoUrl}
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
            setSelectedItemName(t.itemRequired);
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
                      <CommandInput placeholder={t.searchItem} />
                      <CommandList>
                        <CommandEmpty>{t.noItemFound}</CommandEmpty>
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
                placeholder={t.supplierNamePlaceholder}
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
            setSelectedItemName(t.itemRequired);
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
                      <CommandInput placeholder={t.searchItem} />
                      <CommandList>
                        <CommandEmpty>{t.noItemFound}</CommandEmpty>
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
                placeholder={t.customerDeptPlaceholder}
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
            setSelectedItemName(t.itemRequired);
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
                      <CommandInput placeholder={t.searchItem} />
                      <CommandList>
                        <CommandEmpty>{t.noItemFound}</CommandEmpty>
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
                  <SelectValue placeholder={t.selectUnit} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(t.unitsFull).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
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
