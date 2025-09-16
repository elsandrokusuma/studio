
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
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Papa from "papaparse";

import {
  Card,
  CardContent,
  CardDescription,
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
    Send,
    Undo2,
    ChevronDown,
    Ban,
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
import { id, enUS, es, fr, de, ja, ko, zhCN } from 'date-fns/locale';
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
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { useTheme } from "@/hooks/use-theme";


type GroupedRequest = {
  requestNumber: string;
  requests: SparepartRequest[];
  totalItems: number;
  totalQuantity: number;
  status: SparepartRequest['status'];
  requester: string;
  requestDate: string;
  location: string;
  approver?: string;
};

type POItem = {
  id: number;
  itemName: string;
  company: string;
  quantity: number | string;
};

const dateLocales = { en: enUS, id, es, fr, de, ja, ko, 'zh-CN': zhCN };

const translations = {
    en: {
        title: "Sparepart Approval",
        description: (count: number, items: number) => `${count} PO groups • ${items} line items`,
        requestApproval: "Request Approval",
        export: "Export",
        exportCsv: "Export as CSV",
        exportPdf: "Export as PDF",
        createRequest: "Create Request",
        createRequestTitle: "Create Sparepart Request",
        createRequestDesc: "Fill in the details to create a new sparepart request. You can also import items from a CSV file.",
        requesterName: "Requester Name",
        location: "Location",
        jakarta: "Jakarta",
        surabaya: "Surabaya",
        items: "Items",
        importFromFile: "Import from File",
        itemNamePlaceholder: "Item Name",
        companyPlaceholder: "Company",
        qtyPlaceholder: "Qty",
        addItem: "Add Item",
        cancel: "Cancel",
        totalPOs: "Total POs",
        lineItems: "Line Items",
        pending: "Pending",
        searchPlaceholder: "Search PO or item...",
        allStatus: "All Status",
        allTime: "All Time",
        pickDate: "Pick date",
        selectAll: "Select All",
        clearFilters: "Clear Filters",
        noApprovalsTitle: "No pending approvals found",
        noApprovalsDesc: "There are currently no sparepart requests matching your filters.",
        units: "units",
        requesterLabel: "Req",
        actions: "Actions",
        markAsApproved: "Mark as Approved",
        undoDecision: "Undo Decision",
        delete: "Delete",
        itemName: "Item Name",
        company: "Company",
        qtyRequest: "Qty Request",
        revisedQty: "Revised Qty",
        status: "Status",
        edit: "Edit",
        approve: "Approve",
        reject: "Reject",
        editQtyTitle: (name: string) => `Edit Quantity: ${name}`,
        editQtyDesc: "Revise the quantity for this item. The original request will be preserved.",
        revisedQtyLabel: "Revised Quantity",
        saveChanges: "Save Changes",
        areYouSure: "Are you sure?",
        deleteWarning: (po: string) => `This action cannot be undone. This will permanently delete the request ${po} and all its items.`,
        accessDenied: "Access Denied",
        accessDeniedDesc: "You do not have permission to view this page. Please contact an administrator if you believe this is an error.",
        firebaseNotConfigured: "Firebase Not Configured",
        firebaseNotConfiguredDesc: "Please configure your Firebase credentials in the environment variables to use this application.",
        approveConfirmation: "Approve Confirmation",
        approveConfirmationDesc: (po: string) => `Please enter your name to confirm the approval of PO ${po}.`,
        approverName: "Approver's Name",
        approverNamePlaceholder: "e.g. John Doe",
        confirmApproval: "Confirm Approval",
        approvedBy: (name: string) => `Approved by ${name}`,
        statuses: {
            'Pending': 'Pending',
            'Awaiting Approval': 'Awaiting Approval',
            'Approved': 'Approved',
            'Rejected': 'Rejected'
        }
    },
    id: {
        title: "Persetujuan Sparepart",
        description: (count: number, items: number) => `${count} grup PO • ${items} baris item`,
        requestApproval: "Minta Persetujuan",
        export: "Ekspor",
        exportCsv: "Ekspor sebagai CSV",
        exportPdf: "Ekspor sebagai PDF",
        createRequest: "Buat Permintaan",
        createRequestTitle: "Buat Permintaan Sparepart",
        createRequestDesc: "Isi detail untuk membuat permintaan sparepart baru. Anda juga dapat mengimpor item dari file CSV.",
        requesterName: "Nama Pemohon",
        location: "Lokasi",
        jakarta: "Jakarta",
        surabaya: "Surabaya",
        items: "Item",
        importFromFile: "Impor dari File",
        itemNamePlaceholder: "Nama Item",
        companyPlaceholder: "Perusahaan",
        qtyPlaceholder: "Jml",
        addItem: "Tambah Item",
        cancel: "Batal",
        totalPOs: "Total PO",
        lineItems: "Total Item",
        pending: "Tertunda",
        searchPlaceholder: "Cari PO atau item...",
        allStatus: "Semua Status",
        allTime: "Semua Waktu",
        pickDate: "Pilih tanggal",
        selectAll: "Pilih Semua",
        clearFilters: "Hapus Filter",
        noApprovalsTitle: "Tidak ada persetujuan yang ditemukan",
        noApprovalsDesc: "Saat ini tidak ada permintaan sparepart yang cocok dengan filter Anda.",
        units: "unit",
        requesterLabel: "Pemohon",
        actions: "Aksi",
        markAsApproved: "Tandai Disetujui",
        undoDecision: "Batalkan Keputusan",
        delete: "Hapus",
        itemName: "Nama Item",
        company: "Perusahaan",
        qtyRequest: "Jml Diminta",
        revisedQty: "Jml Direvisi",
        status: "Status",
        edit: "Ubah",
        approve: "Setujui",
        reject: "Tolak",
        editQtyTitle: (name: string) => `Ubah Jumlah: ${name}`,
        editQtyDesc: "Revisi jumlah untuk item ini. Permintaan asli akan tetap tersimpan.",
        revisedQtyLabel: "Jumlah Revisi",
        saveChanges: "Simpan Perubahan",
        areYouSure: "Apakah Anda yakin?",
        deleteWarning: (po: string) => `Tindakan ini tidak dapat dibatalkan. Ini akan menghapus secara permanen permintaan ${po} dan semua itemnya.`,
        accessDenied: "Akses Ditolak",
        accessDeniedDesc: "Anda tidak memiliki izin untuk melihat halaman ini. Silakan hubungi administrator jika Anda yakin ini adalah kesalahan.",
        firebaseNotConfigured: "Firebase Tidak Dikonfigurasi",
        firebaseNotConfiguredDesc: "Harap konfigurasikan kredensial Firebase Anda di variabel lingkungan untuk menggunakan aplikasi ini.",
        approveConfirmation: "Konfirmasi Persetujuan",
        approveConfirmationDesc: (po: string) => `Silakan masukkan nama Anda untuk mengonfirmasi persetujuan PO ${po}.`,
        approverName: "Nama Penyetuju",
        approverNamePlaceholder: "contoh: Budi",
        confirmApproval: "Konfirmasi Persetujuan",
        approvedBy: (name: string) => `Disetujui oleh ${name}`,
        statuses: {
            'Pending': 'Tertunda',
            'Awaiting Approval': 'Menunggu Persetujuan',
            'Approved': 'Disetujui',
            'Rejected': 'Ditolak'
        }
    },
    es: {
        title: "Aprobación de Repuestos",
        description: (count: number, items: number) => `${count} grupos de OC • ${items} líneas de artículos`,
        requestApproval: "Solicitar Aprobación",
        export: "Exportar",
        exportCsv: "Exportar como CSV",
        exportPdf: "Exportar como PDF",
        createRequest: "Crear Solicitud",
        createRequestTitle: "Crear Solicitud de Repuestos",
        createRequestDesc: "Complete los detalles para crear una nueva solicitud de repuestos. También puede importar artículos desde un archivo CSV.",
        requesterName: "Nombre del Solicitante",
        location: "Ubicación",
        jakarta: "Yakarta",
        surabaya: "Surabaya",
        items: "Artículos",
        importFromFile: "Importar desde Archivo",
        itemNamePlaceholder: "Nombre del Artículo",
        companyPlaceholder: "Empresa",
        qtyPlaceholder: "Cant",
        addItem: "Añadir Artículo",
        cancel: "Cancelar",
        totalPOs: "Total de OCs",
        lineItems: "Líneas de Artículos",
        pending: "Pendiente",
        searchPlaceholder: "Buscar OC o artículo...",
        allStatus: "Todos los Estados",
        allTime: "Todo el Tiempo",
        pickDate: "Seleccionar fecha",
        selectAll: "Seleccionar Todo",
        clearFilters: "Limpiar Filtros",
        noApprovalsTitle: "No se encontraron aprobaciones pendientes",
        noApprovalsDesc: "Actualmente no hay solicitudes de repuestos que coincidan con sus filtros.",
        units: "unidades",
        requesterLabel: "Sol",
        actions: "Acciones",
        markAsApproved: "Marcar como Aprobado",
        undoDecision: "Deshacer Decisión",
        delete: "Eliminar",
        itemName: "Nombre del Artículo",
        company: "Empresa",
        qtyRequest: "Cant Solicitada",
        revisedQty: "Cant Revisada",
        status: "Estado",
        edit: "Editar",
        approve: "Aprobar",
        reject: "Rechazar",
        editQtyTitle: (name: string) => `Editar Cantidad: ${name}`,
        editQtyDesc: "Revise la cantidad para este artículo. La solicitud original se conservará.",
        revisedQtyLabel: "Cantidad Revisada",
        saveChanges: "Guardar Cambios",
        areYouSure: "¿Está seguro?",
        deleteWarning: (po: string) => `Esta acción no se puede deshacer. Esto eliminará permanentemente la solicitud ${po} y todos sus artículos.`,
        accessDenied: "Acceso Denegado",
        accessDeniedDesc: "No tiene permiso para ver esta página. Póngase en contacto con un administrador si cree que esto es un error.",
        firebaseNotConfigured: "Firebase No Configurado",
        firebaseNotConfiguredDesc: "Configure sus credenciales de Firebase en las variables de entorno para usar esta aplicación.",
        approveConfirmation: "Confirmación de Aprobación",
        approveConfirmationDesc: (po: string) => `Por favor, introduce tu nombre para confirmar la aprobación de la OC ${po}.`,
        approverName: "Nombre del Aprobador",
        approverNamePlaceholder: "ej. Juan Pérez",
        confirmApproval: "Confirmar Aprobación",
        approvedBy: (name: string) => `Aprobado por ${name}`,
        statuses: {
            'Pending': 'Pendiente',
            'Awaiting Approval': 'Esperando Aprobación',
            'Approved': 'Aprobado',
            'Rejected': 'Rechazado'
        }
    },
    fr: {
        title: "Approbation des Pièces de Rechange",
        description: (count: number, items: number) => `${count} groupes de BC • ${items} lignes d'articles`,
        requestApproval: "Demander l'Approbation",
        export: "Exporter",
        exportCsv: "Exporter en CSV",
        exportPdf: "Exporter en PDF",
        createRequest: "Créer une Demande",
        createRequestTitle: "Créer une Demande de Pièces de Rechange",
        createRequestDesc: "Remplissez les détails pour créer une nouvelle demande de pièces de rechange. Vous pouvez également importer des articles à partir d'un fichier CSV.",
        requesterName: "Nom du Demandeur",
        location: "Emplacement",
        jakarta: "Jakarta",
        surabaya: "Surabaya",
        items: "Articles",
        importFromFile: "Importer depuis un Fichier",
        itemNamePlaceholder: "Nom de l'Article",
        companyPlaceholder: "Entreprise",
        qtyPlaceholder: "Qté",
        addItem: "Ajouter un Article",
        cancel: "Annuler",
        totalPOs: "Total des BC",
        lineItems: "Lignes d'Articles",
        pending: "En attente",
        searchPlaceholder: "Rechercher BC ou article...",
        allStatus: "Tous les Statuts",
        allTime: "Toute la Période",
        pickDate: "Choisir une date",
        selectAll: "Tout Sélectionner",
        clearFilters: "Effacer les Filtres",
        noApprovalsTitle: "Aucune approbation en attente trouvée",
        noApprovalsDesc: "Il n'y a actuellement aucune demande de pièces de rechange correspondant à vos filtres.",
        units: "unités",
        requesterLabel: "Dem",
        actions: "Actions",
        markAsApproved: "Marquer comme Approuvé",
        undoDecision: "Annuler la Décision",
        delete: "Supprimer",
        itemName: "Nom de l'Article",
        company: "Entreprise",
        qtyRequest: "Qté Demandée",
        revisedQty: "Qté Révisée",
        status: "Statut",
        edit: "Modifier",
        approve: "Approuver",
        reject: "Rejeter",
        editQtyTitle: (name: string) => `Modifier la Quantité : ${name}`,
        editQtyDesc: "Révisez la quantité pour cet article. La demande originale sera conservée.",
        revisedQtyLabel: "Quantité Révisée",
        saveChanges: "Enregistrer les Modifications",
        areYouSure: "Êtes-vous sûr ?",
        deleteWarning: (po: string) => `Cette action est irréversible. Elle supprimera définitivement la demande ${po} et tous ses articles.`,
        accessDenied: "Accès Refusé",
        accessDeniedDesc: "Vous n'avez pas la permission de voir cette page. Veuillez contacter un administrateur si vous pensez que c'est une erreur.",
        firebaseNotConfigured: "Firebase Non Configuré",
        firebaseNotConfiguredDesc: "Veuillez configurer vos informations d'identification Firebase dans les variables d'environnement pour utiliser cette application.",
        approveConfirmation: "Confirmation d'Approbation",
        approveConfirmationDesc: (po: string) => `Veuillez saisir votre nom pour confirmer l'approbation du BC ${po}.`,
        approverName: "Nom de l'Approbateur",
        approverNamePlaceholder: "ex. Jean Dupont",
        confirmApproval: "Confirmer l'Approbation",
        approvedBy: (name: string) => `Approuvé par ${name}`,
        statuses: {
            'Pending': 'En attente',
            'Awaiting Approval': "En Attente d'Approbation",
            'Approved': 'Approuvé',
            'Rejected': 'Rejeté'
        }
    },
    de: {
        title: "Ersatzteil-Genehmigung",
        description: (count: number, items: number) => `${count} PO-Gruppen • ${items} Artikelpositionen`,
        requestApproval: "Genehmigung Anfordern",
        export: "Exportieren",
        exportCsv: "Als CSV Exportieren",
        exportPdf: "Als PDF Exportieren",
        createRequest: "Anfrage Erstellen",
        createRequestTitle: "Ersatzteil-Anfrage Erstellen",
        createRequestDesc: "Füllen Sie die Details aus, um eine neue Ersatzteil-Anfrage zu erstellen. Sie können auch Artikel aus einer CSV-Datei importieren.",
        requesterName: "Name des Anforderers",
        location: "Standort",
        jakarta: "Jakarta",
        surabaya: "Surabaya",
        items: "Artikel",
        importFromFile: "Aus Datei Importieren",
        itemNamePlaceholder: "Artikelname",
        companyPlaceholder: "Firma",
        qtyPlaceholder: "Menge",
        addItem: "Artikel Hinzufügen",
        cancel: "Abbrechen",
        totalPOs: "Gesamt-POs",
        lineItems: "Artikelpositionen",
        pending: "Ausstehend",
        searchPlaceholder: "PO oder Artikel suchen...",
        allStatus: "Alle Status",
        allTime: "Gesamter Zeitraum",
        pickDate: "Datum auswählen",
        selectAll: "Alle Auswählen",
        clearFilters: "Filter Löschen",
        noApprovalsTitle: "Keine ausstehenden Genehmigungen gefunden",
        noApprovalsDesc: "Derzeit gibt es keine Ersatzteil-Anfragen, die Ihren Filtern entsprechen.",
        units: "Einheiten",
        requesterLabel: "Anf",
        actions: "Aktionen",
        markAsApproved: "Als Genehmigt Markieren",
        undoDecision: "Entscheidung Rückgängig Machen",
        delete: "Löschen",
        itemName: "Artikelname",
        company: "Firma",
        qtyRequest: "Angeforderte Menge",
        revisedQty: "Überarbeitete Menge",
        status: "Status",
        edit: "Bearbeiten",
        approve: "Genehmigen",
        reject: "Ablehnen",
        editQtyTitle: (name: string) => `Menge Bearbeiten: ${name}`,
        editQtyDesc: "Überarbeiten Sie die Menge für diesen Artikel. Die ursprüngliche Anfrage bleibt erhalten.",
        revisedQtyLabel: "Überarbeitete Menge",
        saveChanges: "Änderungen Speichern",
        areYouSure: "Sind Sie sicher?",
        deleteWarning: (po: string) => `Diese Aktion kann nicht rückgängig gemacht werden. Dadurch wird die Anfrage ${po} und alle ihre Artikel dauerhaft gelöscht.`,
        accessDenied: "Zugriff Verweigert",
        accessDeniedDesc: "Sie haben keine Berechtigung, diese Seite anzuzeigen. Bitte kontaktieren Sie einen Administrator, wenn Sie glauben, dass dies ein Fehler ist.",
        firebaseNotConfigured: "Firebase Nicht Konfiguriert",
        firebaseNotConfiguredDesc: "Bitte konfigurieren Sie Ihre Firebase-Anmeldeinformationen in den Umgebungsvariablen, um diese Anwendung zu verwenden.",
        approveConfirmation: "Genehmigungsbestätigung",
        approveConfirmationDesc: (po: string) => `Bitte geben Sie Ihren Namen ein, um die Genehmigung der Bestellung ${po} zu bestätigen.`,
        approverName: "Name des Genehmigenden",
        approverNamePlaceholder: "z.B. Max Mustermann",
        confirmApproval: "Genehmigung Bestätigen",
        approvedBy: (name: string) => `Genehmigt von ${name}`,
        statuses: {
            'Pending': 'Ausstehend',
            'Awaiting Approval': 'Wartet auf Genehmigung',
            'Approved': 'Genehmigt',
            'Rejected': 'Abgelehnt'
        }
    },
    ja: {
        title: "スペアパーツ承認",
        description: (count: number, items: number) => `${count} POグループ • ${items} 品目`,
        requestApproval: "承認をリクエスト",
        export: "エクスポート",
        exportCsv: "CSVとしてエクスポート",
        exportPdf: "PDFとしてエクスポート",
        createRequest: "リクエストを作成",
        createRequestTitle: "スペアパーツリクエストを作成",
        createRequestDesc: "詳細を記入して、新しいスペアパーツリクエストを作成します。CSVファイルから品目をインポートすることもできます。",
        requesterName: "リクエスター名",
        location: "場所",
        jakarta: "ジャカルタ",
        surabaya: "スラバヤ",
        items: "品目",
        importFromFile: "ファイルからインポート",
        itemNamePlaceholder: "品目名",
        companyPlaceholder: "会社",
        qtyPlaceholder: "数量",
        addItem: "品目を追加",
        cancel: "キャンセル",
        totalPOs: "合計PO",
        lineItems: "品目数",
        pending: "保留中",
        searchPlaceholder: "POまたは品目を検索...",
        allStatus: "すべてのステータス",
        allTime: "すべての期間",
        pickDate: "日付を選択",
        selectAll: "すべて選択",
        clearFilters: "フィルターをクリア",
        noApprovalsTitle: "保留中の承認が見つかりません",
        noApprovalsDesc: "現在、フィルターに一致するスペアパーツリクエストはありません。",
        units: "ユニット",
        requesterLabel: "リクエスター",
        actions: "アクション",
        markAsApproved: "承認済みとしてマーク",
        undoDecision: "決定を取り消す",
        delete: "削除",
        itemName: "品目名",
        company: "会社",
        qtyRequest: "リクエスト数量",
        revisedQty: "修正数量",
        status: "ステータス",
        edit: "編集",
        approve: "承認",
        reject: "拒否",
        editQtyTitle: (name: string) => `数量を編集: ${name}`,
        editQtyDesc: "この品目の数量を修正します。元のリクエストは保持されます。",
        revisedQtyLabel: "修正数量",
        saveChanges: "変更を保存",
        areYouSure: "よろしいですか？",
        deleteWarning: (po: string) => `この操作は元に戻せません。これにより、リクエスト ${po} とそのすべての品目が完全に削除されます。`,
        accessDenied: "アクセスが拒否されました",
        accessDeniedDesc: "このページを表示する権限がありません。これがエラーであると思われる場合は、管理者に連絡してください。",
        firebaseNotConfigured: "Firebaseが設定されていません",
        firebaseNotConfiguredDesc: "このアプリケーションを使用するには、環境変数でFirebaseの認証情報を設定してください。",
        approveConfirmation: "承認の確認",
        approveConfirmationDesc: (po: string) => `PO ${po} の承認を確認するには、お名前を入力してください。`,
        approverName: "承認者名",
        approverNamePlaceholder: "例：山田太郎",
        confirmApproval: "承認を確定",
        approvedBy: (name: string) => `${name}によって承認されました`,
        statuses: {
            'Pending': '保留中',
            'Awaiting Approval': '承認待ち',
            'Approved': '承認済み',
            'Rejected': '拒否'
        }
    },
    ko: {
        title: "부품 승인",
        description: (count: number, items: number) => `${count} PO 그룹 • ${items} 라인 아이템`,
        requestApproval: "승인 요청",
        export: "내보내기",
        exportCsv: "CSV로 내보내기",
        exportPdf: "PDF로 내보내기",
        createRequest: "요청 생성",
        createRequestTitle: "부품 요청 생성",
        createRequestDesc: "세부 정보를 입력하여 새 부품 요청을 생성합니다. CSV 파일에서 항목을 가져올 수도 있습니다.",
        requesterName: "요청자 이름",
        location: "위치",
        jakarta: "자카르타",
        surabaya: "수라바야",
        items: "항목",
        importFromFile: "파일에서 가져오기",
        itemNamePlaceholder: "항목 이름",
        companyPlaceholder: "회사",
        qtyPlaceholder: "수량",
        addItem: "항목 추가",
        cancel: "취소",
        totalPOs: "총 PO",
        lineItems: "라인 아이템",
        pending: "대기 중",
        searchPlaceholder: "PO 또는 항목 검색...",
        allStatus: "모든 상태",
        allTime: "모든 시간",
        pickDate: "날짜 선택",
        selectAll: "모두 선택",
        clearFilters: "필터 지우기",
        noApprovalsTitle: "대기 중인 승인 없음",
        noApprovalsDesc: "현재 필터와 일치하는 부품 요청이 없습니다.",
        units: "단위",
        requesterLabel: "요청자",
        actions: "작업",
        markAsApproved: "승인됨으로 표시",
        undoDecision: "결정 취소",
        delete: "삭제",
        itemName: "항목 이름",
        company: "회사",
        qtyRequest: "요청 수량",
        revisedQty: "수정된 수량",
        status: "상태",
        edit: "편집",
        approve: "승인",
        reject: "거부",
        editQtyTitle: (name: string) => `수량 편집: ${name}`,
        editQtyDesc: "이 항목의 수량을 수정합니다. 원래 요청은 보존됩니다.",
        revisedQtyLabel: "수정된 수량",
        saveChanges: "변경 사항 저장",
        areYouSure: "확실합니까?",
        deleteWarning: (po: string) => `이 작업은 되돌릴 수 없습니다. 요청 ${po}와 모든 항목이 영구적으로 삭제됩니다.`,
        accessDenied: "접근 거부됨",
        accessDeniedDesc: "이 페이지를 볼 권한이 없습니다. 오류라고 생각되면 관리자에게 문의하십시오.",
        firebaseNotConfigured: "Firebase가 구성되지 않음",
        firebaseNotConfiguredDesc: "이 응용 프로그램을 사용하려면 환경 변수에서 Firebase 자격 증명을 구성하십시오.",
        approveConfirmation: "승인 확인",
        approveConfirmationDesc: (po: string) => `PO ${po}의 승인을 확인하려면 이름을 입력하십시오.`,
        approverName: "승인자 이름",
        approverNamePlaceholder: "예: 홍길동",
        confirmApproval: "승인 확인",
        approvedBy: (name: string) => `${name}에 의해 승인됨`,
        statuses: {
            'Pending': '대기 중',
            'Awaiting Approval': '승인 대기 중',
            'Approved': '승인됨',
            'Rejected': '거부됨'
        }
    },
    'zh-CN': {
        title: "备件批准",
        description: (count: number, items: number) => `${count} 个采购订单组 • ${items} 个行项目`,
        requestApproval: "请求批准",
        export: "导出",
        exportCsv: "导出为 CSV",
        exportPdf: "导出为 PDF",
        createRequest: "创建请求",
        createRequestTitle: "创建备件请求",
        createRequestDesc: "填写详细信息以创建新的备件请求。您还可以从 CSV 文件导入项目。",
        requesterName: "请求者姓名",
        location: "地点",
        jakarta: "雅加达",
        surabaya: "泗水",
        items: "项目",
        importFromFile: "从文件导入",
        itemNamePlaceholder: "项目名称",
        companyPlaceholder: "公司",
        qtyPlaceholder: "数量",
        addItem: "添加项目",
        cancel: "取消",
        totalPOs: "总采购订单",
        lineItems: "行项目",
        pending: "待处理",
        searchPlaceholder: "搜索采购订单或项目...",
        allStatus: "所有状态",
        allTime: "所有时间",
        pickDate: "选择日期",
        selectAll: "全选",
        clearFilters: "清除筛选",
        noApprovalsTitle: "未找到待批准的请求",
        noApprovalsDesc: "当前没有与您的筛选匹配的备件请求。",
        units: "单位",
        requesterLabel: "请求者",
        actions: "操作",
        markAsApproved: "标记为已批准",
        undoDecision: "撤销决定",
        delete: "删除",
        itemName: "项目名称",
        company: "公司",
        qtyRequest: "请求数量",
        revisedQty: "修订数量",
        status: "状态",
        edit: "编辑",
        approve: "批准",
        reject: "拒绝",
        editQtyTitle: (name: string) => `编辑数量：${name}`,
        editQtyDesc: "修改此项目的数量。原始请求将被保留。",
        revisedQtyLabel: "修订数量",
        saveChanges: "保存更改",
        areYouSure: "您确定吗？",
        deleteWarning: (po: string) => `此操作无法撤销。这将永久删除请求 ${po} 及其所有项目。`,
        accessDenied: "访问被拒绝",
        accessDeniedDesc: "您无权查看此页面。如果您认为这是错误，请联系管理员。",
        firebaseNotConfigured: "Firebase 未配置",
        firebaseNotConfiguredDesc: "请在环境变量中配置您的 Firebase 凭据以使用此应用程序。",
        approveConfirmation: "批准确认",
        approveConfirmationDesc: (po: string) => `请输入您的姓名以确认批准采购订单 ${po}。`,
        approverName: "批准人姓名",
        approverNamePlaceholder: "例如：张三",
        confirmApproval: "确认批准",
        approvedBy: (name: string) => `由 ${name} 批准`,
        statuses: {
            'Pending': '待处理',
            'Awaiting Approval': '等待批准',
            'Approved': '已批准',
            'Rejected': '已拒绝'
        }
    }
};


export default function ApprovalSparepartPage() {
  const [allRequests, setAllRequests] = React.useState<SparepartRequest[]>([]);
  const [isCreatePoOpen, setCreatePoOpen] = React.useState(false);
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { language } = useTheme();

  const t = translations[language] || translations.en;
  const currentLocale = dateLocales[language] || enUS;

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

  // States for approval dialog
  const [isApprovalOpen, setApprovalOpen] = React.useState(false);
  const [poToApprove, setPoToApprove] = React.useState<GroupedRequest | null>(null);
  const [approverName, setApproverName] = React.useState('');

  const getStatusText = (status: SparepartRequest['status'] | SparepartRequest['itemStatus']) => {
    return t.statuses[status as keyof typeof t.statuses] || status;
  }

  React.useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    
    const qAll = query(collection(db, "sparepart-requests"), orderBy("requestDate", "desc"));
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
        
        addNotification({
          title: `Item ${decision}`,
          description: `Item ${item.itemName} has been ${decision}.`,
          icon: decision === "Approved" ? Check : X,
        });

    } catch(error) {
        console.error("Failed to update item status", error);
        toast({
            variant: "destructive",
            title: "Error updating item status",
        });
    }
  };

  const handleMarkAsApproved = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!poToApprove || !db) return;

    if (!approverName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Approver name required',
      });
      return;
    }

    try {
        const batch = writeBatch(db);
        poToApprove.requests.forEach(request => {
            const docRef = doc(db, "sparepart-requests", request.id);
            batch.update(docRef, { status: 'Approved', itemStatus: 'Approved', approver: approverName });
        });
        await batch.commit();
        addNotification({
            title: "PO Approved",
            description: `Request ${poToApprove.requestNumber} has been marked as Approved.`,
            icon: Check,
        });
    } catch (error) {
        console.error("Error marking PO as approved:", error);
        toast({
            variant: "destructive",
            title: "Failed to approve PO."
        });
    } finally {
      setApprovalOpen(false);
      setPoToApprove(null);
      setApproverName('');
    }
  };
  
   const handleRequestApproval = async () => {
    if (!db) return;
    const posToRequest = groupedRequests.filter(po => selectedRows.includes(po.requestNumber) && po.status === 'Pending');

    if (posToRequest.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No items to send',
        description: 'Please select pending requests to send for approval.',
      });
      return;
    }
    
    try {
      const batch = writeBatch(db);
      posToRequest.forEach(po => {
        po.requests.forEach(order => {
            const orderRef = doc(db, 'sparepart-requests', order.id);
            batch.update(orderRef, { status: 'Awaiting Approval' });
        });
      });

      await batch.commit();

      addNotification({
        title: 'Approval Requested',
        description: `${posToRequest.length} request(s) have been sent for approval.`,
        icon: Send,
      });
      
      // Send WhatsApp Notification
      const phoneNumber = "6281210418699"; // Indonesian country code + number
      const poList = posToRequest.map(po => `- ${po.requestNumber}`).join('\n');
      const message = encodeURIComponent(
        `Dengan hormat,\n\nMohon untuk ditinjau dan disetujui permintaan Sparepart berikut:\n\n${poList}\n\nAnda dapat meninjaunya langsung melalui tautan di bawah ini:\nhttps://stationeryinventory-gwk.vercel.app/approval-sparepart\n\nTerima kasih.`
      );
      
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
      
      setSelectedRows([]);
    } catch (error) {
       console.error("Error requesting approval: ", error);
      toast({
        variant: 'destructive',
        title: 'Failed to request approvals',
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
      
      addNotification({ title: "Quantity Revised", description: `Quantity for ${selectedOrderItem.itemName} updated.`, icon: Pencil });
      setEditItemOpen(false);
      setSelectedOrderItem(null);
      setRevisedQuantity('');
    } catch (error) {
      console.error("Failed to revise quantity", error);
      toast({ variant: "destructive", title: "Error revising quantity" });
    }
  };

  const updateStatus = async (po: GroupedRequest, status: SparepartRequest['status']) => {
    if (!db) return;
    const batch = writeBatch(db);
    po.requests.forEach(request => {
        const docRef = doc(db, "sparepart-requests", request.id);
        batch.update(docRef, { status, approver: '' }); // Clear approver on undo
    });
    await batch.commit();
    addNotification({
      title: 'Status Updated',
      description: `PO ${po.requestNumber} marked as ${status}.`,
      icon: Undo2,
    });
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
      
      addNotification({ title: "Request Created", description: `Request ${formattedReqNum} has been submitted.`, icon: PlusCircle });
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

        addNotification({
          title: 'Import Successful',
          description: `${newItems.length} items have been loaded into the form.`,
          icon: Upload,
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

      addNotification({
        title: "Request Deleted",
        description: `Request ${selectedPo.requestNumber} has been deleted.`,
        icon: Trash2,
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
      // The overall status is determined by the status field of the first item in the group.
      // This enforces the new workflow where status is changed for the whole group.
      const overallStatus = requests[0]?.status || 'Pending';

      const requester = requests[0]?.requester || '';
      const location = requests[0]?.location || 'Unknown';
      const approver = requests.find(o => o.approver)?.approver

      return {
          requestNumber,
          requests,
          totalItems: requests.length,
          totalQuantity: requests.reduce((sum, item) => sum + (item.revisedQuantity ?? item.quantity), 0),
          status: overallStatus,
          requester,
          requestDate: requests[0].requestDate,
          location: location,
          approver: approver
      }
    }).filter(req => req.requests.length > 0)
    .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
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
        toast({ variant: 'destructive', title: 'No POs selected to export' });
        return;
    }

    const allItemsToExport = filteredRequests
        .filter(po => selectedRows.includes(po.requestNumber) && po.status === 'Approved')
        .flatMap(po => po.requests);

    if (allItemsToExport.length === 0) {
        toast({
            variant: 'destructive',
            title: 'No approved items in selected POs',
            description: "Please select POs that have been marked as 'Approved' to export.",
        });
        return;
    }

    const ids = allItemsToExport.map(item => item.id).join(',');
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
  
  const canRequestApproval = selectedRows.some(poNumber => groupedRequests.find(po => po.requestNumber === poNumber)?.status === 'Pending');
  const isHrdUser = user && user.email === 'krezthrd@gmail.com';
  const showClearOptions = searchQuery || statusFilter !== 'all' || dateFilter;


  if (loading || authLoading) {
    return <FullPageSpinner />;
  }
  
  if (isHrdUser) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] text-center">
        <div className="p-4 bg-destructive/10 rounded-full mb-4">
            <Ban className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">{t.accessDenied}</h1>
        <p className="text-muted-foreground max-w-sm">
            {t.accessDeniedDesc}
        </p>
      </div>
    );
  }

  if (!db) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>{t.firebaseNotConfigured}</AlertTitle>
          <AlertDescription>
            {t.firebaseNotConfiguredDesc}
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
            {t.title}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t.description(totalRequestsCount, totalLineItems)}
          </p>
        </div>
        <div className="flex items-center gap-2">
            {selectedRows.length > 0 && (
                <>
                <Button onClick={handleRequestApproval} disabled={!canRequestApproval}>
                    <Send className="mr-2 h-4 w-4" />
                    {t.requestApproval}
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <FileDown className="mr-2 h-4 w-4" />
                        {t.export}
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                    <DropdownMenuItem onSelect={handleExportCsv}>{t.exportCsv}</DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleExportPdf}>{t.exportPdf}</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                </>
            )}
            <Dialog open={isCreatePoOpen} onOpenChange={setCreatePoOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t.createRequest}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>{t.createRequestTitle}</DialogTitle>
                    <DialogDescription>
                      {t.createRequestDesc}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateRequest}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 py-4">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="requesterName">{t.requesterName}</Label>
                                <Input id="requesterName" placeholder="e.g. John Doe" value={requesterName} onChange={(e) => setRequesterName(e.target.value)} />
                            </div>
                            <div>
                                <Label>{t.location}</Label>
                                 <RadioGroup defaultValue="Jakarta" className="flex items-center gap-4 pt-2" value={location} onValueChange={setLocation}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Jakarta" id="jakarta" />
                                        <Label htmlFor="jakarta">{t.jakarta}</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Surabaya" id="surabaya" />
                                        <Label htmlFor="surabaya">{t.surabaya}</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                        <div className="space-y-2">
                             <div className="flex justify-between items-center">
                                <Label>{t.items}</Label>
                                 <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                  >
                                    <Upload className="mr-2 h-4 w-4" />
                                    {t.importFromFile}
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
                                            <Input placeholder={t.itemNamePlaceholder} value={item.itemName} onChange={(e) => handleItemChange(item.id, 'itemName', e.target.value)} />
                                            <Input placeholder={t.companyPlaceholder} value={item.company} onChange={(e) => handleItemChange(item.id, 'company', e.target.value)} />
                                            <Input type="number" min="1" className="w-24" placeholder={t.qtyPlaceholder} value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)} disabled={poItems.length === 1}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                            <Button type="button" variant="outline" className="w-full" onClick={handleAddItem}>
                                <PlusCircle className="mr-2 h-4 w-4" /> {t.addItem}
                            </Button>
                        </div>
                    </div>
                     <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => { setCreatePoOpen(false); resetPoForm(); }}>{t.cancel}</Button>
                        <Button type="submit">{t.createRequest}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Card className="text-white" style={{ backgroundColor: 'hsl(var(--summary-card-1))' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalPOs}</CardTitle>
            <Folder className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalRequestsCount}</div>
          </CardContent>
        </Card>
        <Card className="text-white" style={{ backgroundColor: 'hsl(var(--summary-card-2))' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.lineItems}</CardTitle>
            <Boxes className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalLineItems}</div>
          </CardContent>
        </Card>
        <Card className="col-span-2 lg:col-span-1 text-white" style={{ backgroundColor: 'hsl(var(--summary-card-3))' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.pending}</CardTitle>
            <FileText className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
      </div>
      
       <Card>
        <CardContent className="p-4 flex flex-col gap-4">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t.searchPlaceholder}
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2 md:flex md:items-center md:gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t.allStatus} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allStatus}</SelectItem>
                  <SelectItem value="Pending">{t.statuses.Pending}</SelectItem>
                  <SelectItem value="Awaiting Approval">{t.statuses['Awaiting Approval']}</SelectItem>
                  <SelectItem value="Approved">{t.statuses.Approved}</SelectItem>
                  <SelectItem value="Rejected">{t.statuses.Rejected}</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t.allTime} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-time">{t.allTime}</SelectItem>
                </SelectContent>
              </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className="w-full md:w-auto md:min-w-[200px] justify-start text-left font-normal">
                  <CalendarIcon className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">
                    {dateFilter ? format(dateFilter, "PPP", { locale: currentLocale }) : <span>{t.pickDate}</span>}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateFilter} onSelect={setDateFilter} initialFocus locale={currentLocale} />
              </PopoverContent>
            </Popover>

             {showClearOptions && (
              <div className="col-span-3 flex items-center justify-between md:ml-auto md:w-auto md:justify-start md:gap-4">
                  <div className="flex items-center space-x-2">
                      <Checkbox id="select-all" checked={isAllSelected} onCheckedChange={(checked) => handleSelectAll(Boolean(checked))} />
                      <Label htmlFor="select-all" className="whitespace-nowrap">{t.selectAll}</Label>
                  </div>
                  <Button variant="ghost" onClick={() => { setSearchQuery(""); setStatusFilter("all"); setDateFilter(undefined); setSelectedRows([]); }}>{t.clearFilters}</Button>
              </div>
            )}
          </div>
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
                        req.status === 'Awaiting Approval' ? 'bg-orange-500' :
                        'bg-yellow-500'
                    )}></div>
                    <CardHeader className="p-4 pl-8">
                      <div className="flex flex-wrap items-start justify-between gap-y-2">
                          <div className="flex items-center gap-4 flex-grow">
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
                                  <div className="flex items-center flex-wrap gap-2 text-sm text-muted-foreground">
                                      <Badge
                                        variant={
                                            req.status === 'Approved' ? 'default' :
                                            req.status === 'Rejected' ? 'destructive' :
                                            req.status === 'Pending' || req.status === 'Awaiting Approval' ? 'warning' : 'secondary'
                                        }
                                        className={
                                            req.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                            req.status === 'Pending' || req.status === 'Awaiting Approval' ? 'bg-yellow-100 text-yellow-800' : ''
                                        }
                                      >
                                          {getStatusText(req.status)}
                                      </Badge>
                                      <span>• {req.totalQuantity} {t.units}</span>
                                      <span className="hidden sm:inline-flex items-center"><MapPin className="h-3 w-3 mr-1"/>{req.location}</span>
                                      {req.approver && <span className='hidden sm:inline'>• {t.approvedBy(req.approver)}</span>}
                                  </div>
                              </div>
                          </div>
                          <div className="w-full sm:w-auto flex items-start justify-between">
                            <div className="text-left sm:text-right text-sm whitespace-nowrap sm:ml-4">
                                <div className="font-medium">{format(new Date(req.requestDate), "MMMM dd, yyyy", { locale: currentLocale })}</div>
                                <div className="text-muted-foreground">{t.requesterLabel}: {req.requester}</div>
                            </div>
                            <div className="flex items-center ml-auto">
                                <AccordionTrigger className="p-2 hover:bg-muted rounded-md">
                                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                                </AccordionTrigger>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>{t.actions}</DropdownMenuLabel>
                                        {req.status === 'Awaiting Approval' && (
                                            <>
                                            <DropdownMenuItem onSelect={() => { setPoToApprove(req); setApprovalOpen(true); }}>
                                                <Check className="mr-2 h-4 w-4" />
                                                {t.markAsApproved}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => updateStatus(req, 'Pending')}>
                                                <Undo2 className="mr-2 h-4 w-4" />
                                                {t.undoDecision}
                                            </DropdownMenuItem>
                                            </>
                                        )}
                                        {req.status === 'Approved' && (
                                            <DropdownMenuItem onSelect={() => updateStatus(req, 'Awaiting Approval')}>
                                                <Undo2 className="mr-2 h-4 w-4" />
                                                {t.undoDecision}
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-red-600 focus:text-red-700"
                                            onSelect={() => {
                                            setSelectedPo(req);
                                            setDeleteOpen(true);
                                            }}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            {t.delete}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                          </div>
                      </div>
                    </CardHeader>
                    <AccordionContent>
                        <CardContent className="p-4 pt-0 pl-8">
                             <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>{t.itemName}</TableHead>
                                    <TableHead>{t.company}</TableHead>
                                    <TableHead>{t.qtyRequest}</TableHead>
                                    <TableHead>{t.revisedQty}</TableHead>
                                    <TableHead>{t.status}</TableHead>
                                    <TableHead className="w-[50px]"><span className="sr-only">{t.actions}</span></TableHead>
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
                                        <Badge
                                            variant={
                                                item.itemStatus === 'Approved' ? 'default' :
                                                item.itemStatus === 'Rejected' ? 'destructive' :
                                                'warning'
                                            }
                                            className={
                                                item.itemStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                                                item.itemStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''
                                            }
                                        >
                                            {getStatusText(item.itemStatus || 'Pending')}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        {req.status === 'Awaiting Approval' && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditItem(item)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> {t.edit}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-green-600 focus:text-green-700" onClick={() => handleItemDecision(item, "Approved")}>
                                                    <Check className="mr-2 h-4 w-4" /> {t.approve}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600 focus:text-red-700" onClick={() => handleItemDecision(item, "Rejected")}>
                                                    <X className="mr-2 h-4 w-4" /> {t.reject}
                                                </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
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
              {t.noApprovalsTitle}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {t.noApprovalsDesc}
            </p>
          </div>
        </div>
      )}

      {/* Edit Item Dialog */}
      <Dialog open={isEditItemOpen} onOpenChange={setEditItemOpen}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>{t.editQtyTitle(selectedOrderItem?.itemName || '')}</DialogTitle>
            <DialogDescription>
                {t.editQtyDesc}
            </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveRevisedQuantity}>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="revised-quantity" className="text-right">
                    {t.revisedQtyLabel}
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
                <Button type="button" variant="outline" onClick={() => setEditItemOpen(false)}>{t.cancel}</Button>
                <Button type="submit">{t.saveChanges}</Button>
            </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.areYouSure}</AlertDialogTitle>
            <AlertDialogDescription>
                {t.deleteWarning(selectedPo?.requestNumber || '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedPo(null)}>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRequest}>{t.delete}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approval Confirmation Dialog */}
       <Dialog open={isApprovalOpen} onOpenChange={setApprovalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t.approveConfirmation}</DialogTitle>
                    <DialogDescription>{t.approveConfirmationDesc(poToApprove?.requestNumber || '')}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleMarkAsApproved}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="approver-name" className="text-right">{t.approverName}</Label>
                            <Input
                                id="approver-name"
                                value={approverName}
                                onChange={(e) => setApproverName(e.target.value)}
                                className="col-span-3"
                                placeholder={t.approverNamePlaceholder}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setApprovalOpen(false)}>{t.cancel}</Button>
                        <Button type="submit">{t.confirmApproval}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

    </div>
  );
}
