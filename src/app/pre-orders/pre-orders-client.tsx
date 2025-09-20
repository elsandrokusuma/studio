
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  writeBatch,
  query,
  orderBy,
  deleteDoc,
  runTransaction
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
import { PlusCircle, MoreHorizontal, Send, Calendar as CalendarIcon, X, FileDown, Trash2, Box, CalendarDays, Undo2, ChevronsUpDown, Check, Pencil, CheckCircle, FileText, Ban, Eye, ChevronDown } from "lucide-react";
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
import { id, enUS, es, fr, de, ja, ko, zhCN } from 'date-fns/locale';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { manageTransaction } from "@/lib/transactions";
import { useTheme } from "@/hooks/use-theme";


type GroupedPO = {
  poNumber: string;
  orders: PreOrder[];
  totalItems: number;
  totalValue: number;
  totalQuantity: number;
  status: PreOrder['status'];
  orderDate: string;
  expectedDate: string;
  approver?: string;
};

const dateLocales = { en: enUS, id, es, fr, de, ja, ko, 'zh-CN': zhCN };

const translations = {
    en: {
        title: "Pre-Order & Approval",
        description: "Manage all stationery pre-orders and approvals in one place.",
        allStatuses: "All Statuses",
        filterByDate: "Filter by date",
        addItemToPO: "Add Item to PO",
        createNewPO: "Create New PO",
        requestApproval: "Request Approval",
        export: "Export",
        selectAll: "Select all",
        units: "units",
        item: "Item",
        unit: "Unit",
        status: "Status",
        qty: "Qty",
        price: "Price",
        total: "Total",
        actions: "Actions",
        markAsApproved: "Mark as Approved",
        undo: "Undo",
        undoDecision: "Undo Decision",
        cancelOrder: "Cancel Order",
        delete: "Delete",
        edit: "Edit",
        approve: "Approve",
        reject: "Reject",
        markAsFulfilled: "Mark as Fulfilled",
        totalQuantity: "Total Quantity",
        expectedDelivery: "Expected Delivery",
        noPreOrdersTitle: "No pre-orders found",
        noPreOrdersDesc: "Create your first pre-order to get started.",
        areYouSure: "Are you sure?",
        deleteWarning: (po: string) => `This action cannot be undone. This will permanently delete the pre-order ${po} and all its items.`,
        cancelBtn: "Cancel",
        deleteBtn: "Delete",
        editItemTitle: (name: string) => `Edit Item: ${name}`,
        editItemDesc: "Update the quantity, unit, or price for this item.",
        saveChanges: "Save Changes",
        deleteItemTitle: "Delete this item?",
        deleteItemDesc: (name: string) => `This will permanently remove ${name} from this pre-order. This action cannot be undone.`,
        deleteItemBtn: "Delete Item",
        fulfillItemTitle: (name: string) => `Fulfill Item: ${name}`,
        fulfillItemDesc: "Confirm the quantity of items received to add them to your inventory.",
        quantityReceived: "Quantity Received",
        confirmAndAdd: "Confirm & Add to Stock",
        addItemTitle: (po: string) => `Add Item to ${po}`,
        createNewPOTitle: "Create New Pre-Order",
        addItemDesc: "Add another item to your pending pre-order.",
        createNewPODesc: "Fill in the details for the first item of your new pre-order.",
        poNumber: "PO Number",
        expectedDate: "Expected Date",
        addItemBtn: "Add Item",
        accessDenied: "Access Denied",
        accessDeniedDesc: "You do not have permission to view this page. Please contact an administrator if you believe this is an error.",
        firebaseNotConfigured: "Firebase Not Configured",
        firebaseNotConfiguredDesc: "Please configure your Firebase credentials to use this application.",
        selectItem: "Select an item...",
        searchItem: "Search item...",
        noItemFound: "No item found.",
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
            'Rejected': 'Rejected',
            'Fulfilled': 'Fulfilled',
            'Cancelled': 'Cancelled'
        },
        unitsFull: {
          "Pcs": "Pcs", "Pack": "Pack", "Box": "Box", "Roll": "Roll", "Rim": "Rim", "Tube": "Tube", "Bottle": "Bottle", "Can": "Can", "Sheet": "Sheet", "Cartridge": "Cartridge"
        }
    },
    id: {
        title: "Pra-Pesan & Persetujuan",
        description: "Kelola semua pra-pesan dan persetujuan alat tulis di satu tempat.",
        allStatuses: "Semua Status",
        filterByDate: "Saring berdasarkan tanggal",
        addItemToPO: "Tambah Item ke PO",
        createNewPO: "Buat PO Baru",
        requestApproval: "Minta Persetujuan",
        export: "Ekspor",
        selectAll: "Pilih semua",
        units: "unit",
        item: "Barang",
        unit: "Unit",
        status: "Status",
        qty: "Jml",
        price: "Harga",
        total: "Total",
        actions: "Aksi",
        markAsApproved: "Tandai Disetujui",
        undo: "Batalkan",
        undoDecision: "Batalkan Keputusan",
        cancelOrder: "Batalkan Pesanan",
        delete: "Hapus",
        edit: "Ubah",
        approve: "Setujui",
        reject: "Tolak",
        markAsFulfilled: "Tandai Terpenuhi",
        totalQuantity: "Total Kuantitas",
        expectedDelivery: "Perkiraan Pengiriman",
        noPreOrdersTitle: "Tidak ada pra-pesan ditemukan",
        noPreOrdersDesc: "Buat pra-pesan pertama Anda untuk memulai.",
        areYouSure: "Apakah Anda yakin?",
        deleteWarning: (po: string) => `Tindakan ini tidak dapat dibatalkan. Ini akan menghapus secara permanen pra-pesan ${po} dan semua itemnya.`,
        cancelBtn: "Batal",
        deleteBtn: "Hapus",
        editItemTitle: (name: string) => `Ubah Item: ${name}`,
        editItemDesc: "Perbarui jumlah, unit, atau harga untuk item ini.",
        saveChanges: "Simpan Perubahan",
        deleteItemTitle: "Hapus item ini?",
        deleteItemDesc: (name: string) => `Ini akan menghapus ${name} secara permanen dari pra-pesan ini. Tindakan ini tidak dapat dibatalkan.`,
        deleteItemBtn: "Hapus Item",
        fulfillItemTitle: (name: string) => `Penuhi Item: ${name}`,
        fulfillItemDesc: "Konfirmasi jumlah barang yang diterima untuk ditambahkan ke inventaris Anda.",
        quantityReceived: "Jumlah Diterima",
        confirmAndAdd: "Konfirmasi & Tambah ke Stok",
        addItemTitle: (po: string) => `Tambah Item ke ${po}`,
        createNewPOTitle: "Buat Pra-Pesan Baru",
        addItemDesc: "Tambahkan item lain ke pra-pesan Anda yang tertunda.",
        createNewPODesc: "Isi detail untuk item pertama dari pra-pesan baru Anda.",
        poNumber: "Nomor PO",
        expectedDate: "Tanggal Perkiraan",
        addItemBtn: "Tambah Item",
        accessDenied: "Akses Ditolak",
        accessDeniedDesc: "Anda tidak memiliki izin untuk melihat halaman ini. Silakan hubungi administrator jika Anda yakin ini adalah kesalahan.",
        firebaseNotConfigured: "Firebase Tidak Dikonfigurasi",
        firebaseNotConfiguredDesc: "Harap konfigurasikan kredensial Firebase Anda untuk menggunakan aplikasi ini.",
        selectItem: "Pilih item...",
        searchItem: "Cari item...",
        noItemFound: "Item tidak ditemukan.",
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
            'Rejected': 'Ditolak',
            'Fulfilled': 'Terpenuhi',
            'Cancelled': 'Dibatalkan'
        },
        unitsFull: {
            "Pcs": "Pcs", "Pack": "Pak", "Box": "Kotak", "Roll": "Gulungan", "Rim": "Rim", "Tube": "Tabung", "Bottle": "Botol", "Can": "Kaleng", "Sheet": "Lembar", "Cartridge": "Kartrid"
        }
    },
    es: {
        title: "Pre-Pedido y Aprobación",
        description: "Gestiona todos los pre-pedidos y aprobaciones de papelería en un solo lugar.",
        allStatuses: "Todos los Estados",
        filterByDate: "Filtrar por fecha",
        addItemToPO: "Añadir Artículo a la OC",
        createNewPO: "Crear Nueva OC",
        requestApproval: "Solicitar Aprobación",
        export: "Exportar",
        selectAll: "Seleccionar todo",
        units: "unidades",
        item: "Artículo",
        unit: "Unidad",
        status: "Estado",
        qty: "Cant",
        price: "Precio",
        total: "Total",
        actions: "Acciones",
        markAsApproved: "Marcar como Aprobado",
        undo: "Deshacer",
        undoDecision: "Deshacer Decisión",
        cancelOrder: "Cancelar Pedido",
        delete: "Eliminar",
        edit: "Editar",
        approve: "Aprobar",
        reject: "Rechazar",
        markAsFulfilled: "Marcar como Completado",
        totalQuantity: "Cantidad Total",
        expectedDelivery: "Entrega Prevista",
        noPreOrdersTitle: "No se encontraron pre-pedidos",
        noPreOrdersDesc: "Crea tu primer pre-pedido para empezar.",
        areYouSure: "¿Estás seguro?",
        deleteWarning: (po: string) => `Esta acción no se puede deshacer. Esto eliminará permanentemente el pre-pedido ${po} y todos sus artículos.`,
        cancelBtn: "Cancelar",
        deleteBtn: "Eliminar",
        editItemTitle: (name: string) => `Editar Artículo: ${name}`,
        editItemDesc: "Actualiza la cantidad, unidad o precio de este artículo.",
        saveChanges: "Guardar Cambios",
        deleteItemTitle: "¿Eliminar este artículo?",
        deleteItemDesc: (name: string) => `Esto eliminará permanentemente ${name} de este pre-pedido. Esta acción no se puede deshacer.`,
        deleteItemBtn: "Eliminar Artículo",
        fulfillItemTitle: (name: string) => `Completar Artículo: ${name}`,
        fulfillItemDesc: "Confirma la cantidad de artículos recibidos para añadirlos a tu inventario.",
        quantityReceived: "Cantidad Recibida",
        confirmAndAdd: "Confirmar y Añadir al Stock",
        addItemTitle: (po: string) => `Añadir Artículo a ${po}`,
        createNewPOTitle: "Crear Nuevo Pre-Pedido",
        addItemDesc: "Añade otro artículo a tu pre-pedido pendiente.",
        createNewPODesc: "Rellena los detalles del primer artículo de tu nuevo pre-pedido.",
        poNumber: "Número de OC",
        expectedDate: "Fecha Prevista",
        addItemBtn: "Añadir Artículo",
        accessDenied: "Acceso Denegado",
        accessDeniedDesc: "No tienes permiso para ver esta página. Por favor, contacta a un administrador si crees que esto es un error.",
        firebaseNotConfigured: "Firebase No Configurado",
        firebaseNotConfiguredDesc: "Por favor, configura tus credenciales de Firebase para usar esta aplicación.",
        selectItem: "Selecciona un artículo...",
        searchItem: "Buscar artículo...",
        noItemFound: "No se encontró ningún artículo.",
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
            'Rejected': 'Rechazado',
            'Fulfilled': 'Completado',
            'Cancelled': 'Cancelado'
        },
        unitsFull: {
            "Pcs": "Pcs", "Pack": "Paquete", "Box": "Caja", "Roll": "Rollo", "Rim": "Resma", "Tube": "Tubo", "Bottle": "Botella", "Can": "Lata", "Sheet": "Hoja", "Cartridge": "Cartucho"
        }
    },
    fr: {
        title: "Pré-Commande & Approbation",
        description: "Gérez toutes les pré-commandes et approbations de papeterie en un seul endroit.",
        allStatuses: "Tous les Statuts",
        filterByDate: "Filtrer par date",
        addItemToPO: "Ajouter un Article au BC",
        createNewPO: "Créer un Nouveau BC",
        requestApproval: "Demander l'Approbation",
        export: "Exporter",
        selectAll: "Tout sélectionner",
        units: "unités",
        item: "Article",
        unit: "Unité",
        status: "Statut",
        qty: "Qté",
        price: "Prix",
        total: "Total",
        actions: "Actions",
        markAsApproved: "Marquer comme Approuvé",
        undo: "Annuler",
        undoDecision: "Annuler la Décision",
        cancelOrder: "Annuler la Commande",
        delete: "Supprimer",
        edit: "Modifier",
        approve: "Approuver",
        reject: "Rejeter",
        markAsFulfilled: "Marquer comme Rempli",
        totalQuantity: "Quantité Totale",
        expectedDelivery: "Livraison Prévue",
        noPreOrdersTitle: "Aucune pré-commande trouvée",
        noPreOrdersDesc: "Créez votre première pré-commande pour commencer.",
        areYouSure: "Êtes-vous sûr ?",
        deleteWarning: (po: string) => `Cette action est irréversible. Elle supprimera définitivement la pré-commande ${po} et tous ses articles.`,
        cancelBtn: "Annuler",
        deleteBtn: "Supprimer",
        editItemTitle: (name: string) => `Modifier l'Article : ${name}`,
        editItemDesc: "Mettez à jour la quantité, l'unité ou le prix de cet article.",
        saveChanges: "Enregistrer les Modifications",
        deleteItemTitle: "Supprimer cet article ?",
        deleteItemDesc: (name: string) => `Cela supprimera définitivement ${name} de cette pré-commande. Cette action est irréversible.`,
        deleteItemBtn: "Supprimer l'Article",
        fulfillItemTitle: (name: string) => `Remplir l'Article : ${name}`,
        fulfillItemDesc: "Confirmez la quantité d'articles reçus pour les ajouter à votre inventaire.",
        quantityReceived: "Quantité Reçue",
        confirmAndAdd: "Confirmer & Ajouter au Stock",
        addItemTitle: (po: string) => `Ajouter un Article à ${po}`,
        createNewPOTitle: "Créer une Nouvelle Pré-Commande",
        addItemDesc: "Ajoutez un autre article à votre pré-commande en attente.",
        createNewPODesc: "Remplissez les détails du premier article de votre nouvelle pré-commande.",
        poNumber: "Numéro de BC",
        expectedDate: "Date Prévue",
        addItemBtn: "Ajouter un Article",
        accessDenied: "Accès Refusé",
        accessDeniedDesc: "Vous n'avez pas la permission de voir cette page. Veuillez contacter un administrateur si vous pensez que c'est une erreur.",
        firebaseNotConfigured: "Firebase Non Configuré",
        firebaseNotConfiguredDesc: "Veuillez configurer vos informations d'identification Firebase pour utiliser cette application.",
        selectItem: "Sélectionnez un article...",
        searchItem: "Rechercher un article...",
        noItemFound: "Aucun article trouvé.",
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
            'Rejected': 'Rejeté',
            'Fulfilled': 'Rempli',
            'Cancelled': 'Annulé'
        },
        unitsFull: {
            "Pcs": "Pcs", "Pack": "Paquet", "Box": "Boîte", "Roll": "Rouleau", "Rim": "Rame", "Tube": "Tube", "Bottle": "Bouteille", "Can": "Canette", "Sheet": "Feuille", "Cartridge": "Cartouche"
        }
    },
    de: {
        title: "Vorbestellung & Genehmigung",
        description: "Verwalten Sie alle Schreibwaren-Vorbestellungen und Genehmigungen an einem Ort.",
        allStatuses: "Alle Status",
        filterByDate: "Nach Datum filtern",
        addItemToPO: "Artikel zur Bestellung hinzufügen",
        createNewPO: "Neue Bestellung erstellen",
        requestApproval: "Genehmigung anfordern",
        export: "Exportieren",
        selectAll: "Alle auswählen",
        units: "Einheiten",
        item: "Artikel",
        unit: "Einheit",
        status: "Status",
        qty: "Menge",
        price: "Preis",
        total: "Gesamt",
        actions: "Aktionen",
        markAsApproved: "Als Genehmigt Markieren",
        undo: "Rückgängig",
        undoDecision: "Entscheidung Rückgängig Machen",
        cancelOrder: "Bestellung Stornieren",
        delete: "Löschen",
        edit: "Bearbeiten",
        approve: "Genehmigen",
        reject: "Ablehnen",
        markAsFulfilled: "Als Erfüllt Markieren",
        totalQuantity: "Gesamtmenge",
        expectedDelivery: "Voraussichtliche Lieferung",
        noPreOrdersTitle: "Keine Vorbestellungen gefunden",
        noPreOrdersDesc: "Erstellen Sie Ihre erste Vorbestellung, um loszulegen.",
        areYouSure: "Sind Sie sicher?",
        deleteWarning: (po: string) => `Diese Aktion kann nicht rückgängig gemacht werden. Dadurch wird die Vorbestellung ${po} und alle ihre Artikel dauerhaft gelöscht.`,
        cancelBtn: "Abbrechen",
        deleteBtn: "Löschen",
        editItemTitle: (name: string) => `Artikel Bearbeiten: ${name}`,
        editItemDesc: "Aktualisieren Sie die Menge, Einheit oder den Preis für diesen Artikel.",
        saveChanges: "Änderungen Speichern",
        deleteItemTitle: "Diesen Artikel löschen?",
        deleteItemDesc: (name: string) => `Dadurch wird ${name} dauerhaft aus dieser Vorbestellung entfernt. Diese Aktion kann nicht rückgängig gemacht werden.`,
        deleteItemBtn: "Artikel Löschen",
        fulfillItemTitle: (name: string) => `Artikel Erfüllen: ${name}`,
        fulfillItemDesc: "Bestätigen Sie die Menge der erhaltenen Artikel, um sie Ihrem Inventar hinzuzufügen.",
        quantityReceived: "Erhaltene Menge",
        confirmAndAdd: "Bestätigen & zum Lager Hinzufügen",
        addItemTitle: (po: string) => `Artikel zu ${po} Hinzufügen`,
        createNewPOTitle: "Neue Vorbestellung Erstellen",
        addItemDesc: "Fügen Sie einen weiteren Artikel zu Ihrer ausstehenden Vorbestellung hinzu.",
        createNewPODesc: "Füllen Sie die Details für den ersten Artikel Ihrer neuen Vorbestellung aus.",
        poNumber: "Bestellnummer",
        expectedDate: "Erwartetes Datum",
        addItemBtn: "Artikel Hinzufügen",
        accessDenied: "Zugriff Verweigert",
        accessDeniedDesc: "Sie haben keine Berechtigung, diese Seite anzuzeigen. Bitte kontaktieren Sie einen Administrator, wenn Sie glauben, dass dies ein Fehler ist.",
        firebaseNotConfigured: "Firebase Nicht Konfiguriert",
        firebaseNotConfiguredDesc: "Bitte konfigurieren Sie Ihre Firebase-Anmeldeinformationen, um diese Anwendung zu verwenden.",
        selectItem: "Artikel auswählen...",
        searchItem: "Artikel suchen...",
        noItemFound: "Kein Artikel gefunden.",
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
            'Rejected': 'Abgelehnt',
            'Fulfilled': 'Erfüllt',
            'Cancelled': 'Storniert'
        },
        unitsFull: {
            "Pcs": "Stk", "Pack": "Packung", "Box": "Kasten", "Roll": "Rolle", "Rim": "Ries", "Tube": "Tube", "Bottle": "Flasche", "Can": "Dose", "Sheet": "Blatt", "Cartridge": "Patrone"
        }
    },
    ja: {
        title: "予約注文と承認",
        description: "すべての文房具の予約注文と承認を1か所で管理します。",
        allStatuses: "すべてのステータス",
        filterByDate: "日付で絞り込む",
        addItemToPO: "POにアイテムを追加",
        createNewPO: "新しいPOを作成",
        requestApproval: "承認をリクエスト",
        export: "エクスポート",
        selectAll: "すべて選択",
        units: "ユニット",
        item: "アイテム",
        unit: "単位",
        status: "ステータス",
        qty: "数量",
        price: "価格",
        total: "合計",
        actions: "アクション",
        markAsApproved: "承認済みとしてマーク",
        undo: "元に戻す",
        undoDecision: "決定を取り消す",
        cancelOrder: "注文をキャンセル",
        delete: "削除",
        edit: "編集",
        approve: "承認",
        reject: "拒否",
        markAsFulfilled: "完了としてマーク",
        totalQuantity: "合計数量",
        expectedDelivery: "納期予定",
        noPreOrdersTitle: "予約注文が見つかりません",
        noPreOrdersDesc: "最初の予約注文を作成して始めましょう。",
        areYouSure: "よろしいですか？",
        deleteWarning: (po: string) => `この操作は元に戻せません。これにより、予約注文 ${po} とそのすべてのアイテムが完全に削除されます。`,
        cancelBtn: "キャンセル",
        deleteBtn: "削除",
        editItemTitle: (name: string) => `アイテムを編集: ${name}`,
        editItemDesc: "このアイテムの数量、単位、または価格を更新します。",
        saveChanges: "変更を保存",
        deleteItemTitle: "このアイテムを削除しますか？",
        deleteItemDesc: (name: string) => `これにより、${name} がこの予約注文から完全に削除されます。この操作は元に戻せません。`,
        deleteItemBtn: "アイテムを削除",
        fulfillItemTitle: (name: string) => `アイテムを完了: ${name}`,
        fulfillItemDesc: "受け取ったアイテムの数量を確認して、在庫に追加します。",
        quantityReceived: "受け取り数量",
        confirmAndAdd: "確認して在庫に追加",
        addItemTitle: (po: string) => `${po} にアイテムを追加`,
        createNewPOTitle: "新しい予約注文を作成",
        addItemDesc: "保留中の予約注文に別のアイテムを追加します。",
        createNewPODesc: "新しい予約注文の最初のアイテムの詳細を入力します。",
        poNumber: "PO番号",
        expectedDate: "納期予定",
        addItemBtn: "アイテムを追加",
        accessDenied: "アクセスが拒否されました",
        accessDeniedDesc: "このページを表示する権限がありません。エラーだと思われる場合は、管理者に連絡してください。",
        firebaseNotConfigured: "Firebaseが設定されていません",
        firebaseNotConfiguredDesc: "このアプリケーションを使用するには、Firebaseの認証情報を設定してください。",
        selectItem: "アイテムを選択...",
        searchItem: "アイテムを検索...",
        noItemFound: "アイテムが見つかりません。",
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
            'Rejected': '拒否',
            'Fulfilled': '完了',
            'Cancelled': 'キャンセル'
        },
        unitsFull: {
            "Pcs": "個", "Pack": "パック", "Box": "箱", "Roll": "ロール", "Rim": "連", "Tube": "チューブ", "Bottle": "ボトル", "Can": "缶", "Sheet": "枚", "Cartridge": "カートリッジ"
        }
    },
    ko: {
        title: "선주문 및 승인",
        description: "모든 문구류 선주문 및 승인을 한 곳에서 관리합니다。",
        allStatuses: "모든 상태",
        filterByDate: "날짜로 필터링",
        addItemToPO: "PO에 품목 추가",
        createNewPO: "새 PO 생성",
        requestApproval: "승인 요청",
        export: "내보내기",
        selectAll: "모두 선택",
        units: "개",
        item: "품목",
        unit: "단위",
        status: "상태",
        qty: "수량",
        price: "가격",
        total: "합계",
        actions: "작업",
        markAsApproved: "승인됨으로 표시",
        undo: "실행 취소",
        undoDecision: "결정 취소",
        cancelOrder: "주문 취소",
        delete: "삭제",
        edit: "편집",
        approve: "승인",
        reject: "거부",
        markAsFulfilled: "완료됨으로 표시",
        totalQuantity: "총 수량",
        expectedDelivery: "예상 배송일",
        noPreOrdersTitle: "선주문을 찾을 수 없음",
        noPreOrdersDesc: "첫 선주문을 생성하여 시작하세요.",
        areYouSure: "확실합니까?",
        deleteWarning: (po: string) => `이 작업은 되돌릴 수 없습니다. 선주문 ${po}와 모든 품목이 영구적으로 삭제됩니다.`,
        cancelBtn: "취소",
        deleteBtn: "삭제",
        editItemTitle: (name: string) => `품목 편집: ${name}`,
        editItemDesc: "이 품목의 수량, 단위 또는 가격을 업데이트합니다.",
        saveChanges: "변경 사항 저장",
        deleteItemTitle: "이 품목을 삭제하시겠습니까?",
        deleteItemDesc: (name: string) => `${name}이(가) 이 선주문에서 영구적으로 제거됩니다. 이 작업은 되돌릴 수 없습니다.`,
        deleteItemBtn: "품목 삭제",
        fulfillItemTitle: (name: string) => `품목 완료: ${name}`,
        fulfillItemDesc: "받은 품목의 수량을 확인하여 재고에 추가합니다.",
        quantityReceived: "받은 수량",
        confirmAndAdd: "확인 및 재고에 추가",
        addItemTitle: (po: string) => `${po}에 품목 추가`,
        createNewPOTitle: "새 선주문 생성",
        addItemDesc: "대기 중인 선주문에 다른 품목을 추가합니다.",
        createNewPODesc: "새 선주문의 첫 번째 품목에 대한 세부 정보를 입력합니다.",
        poNumber: "PO 번호",
        expectedDate: "예상 날짜",
        addItemBtn: "품목 추가",
        accessDenied: "접근 거부됨",
        accessDeniedDesc: "이 페이지를 볼 권한이 없습니다. 오류라고 생각되면 관리자에게 문의하십시오.",
        firebaseNotConfigured: "Firebase가 구성되지 않았습니다",
        firebaseNotConfiguredDesc: "이 애플리케이션을 사용하려면 Firebase 자격 증명을 구성하십시오.",
        selectItem: "품목 선택...",
        searchItem: "품목 검색...",
        noItemFound: "품목을 찾을 수 없습니다.",
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
            'Rejected': '거부됨',
            'Fulfilled': '완료됨',
            'Cancelled': '취소됨'
        },
        unitsFull: {
            "Pcs": "개", "Pack": "팩", "Box": "상자", "Roll": "롤", "Rim": "연", "Tube": "튜브", "Bottle": "병", "Can": "캔", "Sheet": "장", "Cartridge": "카트리지"
        }
    },
    'zh-CN': {
        title: "预购与审批",
        description: "在一个地方管理所有文具的预购和审批。",
        allStatuses: "所有状态",
        filterByDate: "按日期筛选",
        addItemToPO: "向采购订单添加项目",
        createNewPO: "创建新采购订单",
        requestApproval: "请求批准",
        export: "导出",
        selectAll: "全选",
        units: "单位",
        item: "项目",
        unit: "单位",
        status: "状态",
        qty: "数量",
        price: "价格",
        total: "总计",
        actions: "操作",
        markAsApproved: "标记为已批准",
        undo: "撤销",
        undoDecision: "撤销决定",
        cancelOrder: "取消订单",
        delete: "删除",
        edit: "编辑",
        approve: "批准",
        reject: "拒绝",
        markAsFulfilled: "标记为已完成",
        totalQuantity: "总数量",
        expectedDelivery: "预计交货日期",
        noPreOrdersTitle: "未找到预购单",
        noPreOrdersDesc: "创建您的第一份预购单以开始。",
        areYouSure: "您确定吗？",
        deleteWarning: (po: string) => `此操作无法撤销。这将永久删除预购单 ${po} 及其所有项目。`,
        cancelBtn: "取消",
        deleteBtn: "删除",
        editItemTitle: (name: string) => `编辑项目：${name}`,
        editItemDesc: "更新此项目的数量、单位或价格。",
        saveChanges: "保存更改",
        deleteItemTitle: "删除此项目？",
        deleteItemDesc: (name: string) => `这将从此预购单中永久删除 ${name}。此操作无法撤销。`,
        deleteItemBtn: "删除项目",
        fulfillItemTitle: (name: string) => `完成项目：${name}`,
        fulfillItemDesc: "确认收到的项目数量以将其添加到您的库存中。",
        quantityReceived: "收到数量",
        confirmAndAdd: "确认并添加到库存",
        addItemTitle: (po: string) => `向 ${po} 添加项目`,
        createNewPOTitle: "创建新预购单",
        addItemDesc: "向您待处理的预购单中添加另一个项目。",
        createNewPODesc: "填写新预购单第一个项目的详细信息。",
        poNumber: "采购订单号",
        expectedDate: "预计日期",
        addItemBtn: "添加项目",
        accessDenied: "访问被拒绝",
        accessDeniedDesc: "您无权查看此页面。如果您认为这是错误，请联系管理员。",
        firebaseNotConfigured: "Firebase 未配置",
        firebaseNotConfiguredDesc: "请配置您的 Firebase 憑據以使用此应用程序。",
        selectItem: "选择一个项目...",
        searchItem: "搜索项目...",
        noItemFound: "未找到项目。",
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
            'Rejected': '已拒绝',
            'Fulfilled': '已完成',
            'Cancelled': '已取消'
        },
        unitsFull: {
            "Pcs": "件", "Pack": "包", "Box": "盒", "Roll": "卷", "Rim": "令", "Tube": "管", "Bottle": "瓶", "Can": "罐", "Sheet": "张", "Cartridge": "墨盒"
        }
    },
};

export function PreOrdersClient({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const [preOrders, setPreOrders] = React.useState<PreOrder[]>([]);
  const [inventoryItems, setInventoryItems] = React.useState<InventoryItem[]>([]);
  const [isCreateOpen, setCreateOpen] = React.useState(false);
  const [isDeleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedPo, setSelectedPo] = React.useState<GroupedPO | null>(null);
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [dateFilter, setDateFilter] = React.useState<Date | undefined>(undefined);
  const router = useRouter();
  const [selectedUnit, setSelectedUnit] = React.useState<string | undefined>();
  const [poPrice, setPoPrice] = React.useState<number | string>("");
  const [activePoNumber, setActivePoNumber] = React.useState<string>("");
  const [isCreatingNewPo, setIsCreatingNewPo] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [openAccordion, setOpenAccordion] = React.useState<string | undefined>();
  const { user, loading: authLoading } = useAuth();
  const { language } = useTheme();
  
  const t = translations[language] || translations.en;
  const currentLocale = dateLocales[language] || enUS;

  // States for editing/deleting individual items
  const [isEditItemOpen, setEditItemOpen] = React.useState(false);
  const [isDeleteItemOpen, setDeleteItemOpen] = React.useState(false);
  const [selectedOrderItem, setSelectedOrderItem] = React.useState<PreOrder | null>(null);
  
  // States for fulfilling an order
  const [isFulfillOpen, setFulfillOpen] = React.useState(false);
  const [itemToFulfill, setItemToFulfill] = React.useState<PreOrder | null>(null);
  const [fulfillQuantity, setFulfillQuantity] = React.useState<number | string>('');

  // States for approval dialog
  const [isApprovalOpen, setApprovalOpen] = React.useState(false);
  const [poToApprove, setPoToApprove] = React.useState<GroupedPO | null>(null);
  const [approverName, setApproverName] = React.useState('');

  // State for viewing details
  const [isDetailsOpen, setDetailsOpen] = React.useState(false);


  // State for combobox
  const [comboPoOpen, setComboPoOpen] = React.useState(false);
  const [selectedItemId, setSelectedItemId] = React.useState<string | undefined>();
  const [selectedItemName, setSelectedItemName] = React.useState<string>(t.selectItem);
  
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
    const create = searchParams?.create;
    const itemId = searchParams?.itemId;

    if (create === 'true' && itemId) {
        setSelectedItemId(itemId as string);
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

  React.useEffect(() => {
    setSelectedItemName(t.selectItem);
  }, [t.selectItem]);

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
    
    addNotification({
      title: isCreatingNewPo ? "Pre-Order Created" : "Item Added to PO",
      description: `Item ${newPreOrderData.itemName} added to PO ${newPreOrderData.poNumber}.`,
      icon: PlusCircle,
    });
    setCreateOpen(false);
    setSelectedUnit(undefined);
    setSelectedItemId(undefined);
    setSelectedItemName(t.selectItem);
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

    addNotification({
      title: "Item Updated",
      description: `${selectedOrderItem.itemName} has been updated.`,
      icon: Pencil,
    });
    setEditItemOpen(false);
    setSelectedOrderItem(null);
    setSelectedUnit(undefined);
  };

  const handleDeleteOrderItem = async () => {
    if (!selectedOrderItem || !db) return;
    await deleteDoc(doc(db, "pre-orders", selectedOrderItem.id));
    addNotification({
      title: "Item Deleted",
      description: `${selectedOrderItem.itemName} removed from the pre-order.`,
      icon: Trash2,
    });
    setDeleteItemOpen(false);
    setSelectedOrderItem(null);
  };
  
  const handleFulfillItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!itemToFulfill || !db) return;

    const finalQuantity = Number(fulfillQuantity);
    if (isNaN(finalQuantity) || finalQuantity <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Quantity",
        description: "Please enter a valid number greater than 0.",
      });
      return;
    }

    try {
      await runTransaction(db, async (transaction) => {
        const inventoryItemRef = doc(db, "inventory", itemToFulfill.itemId);
        const inventoryItemDoc = await transaction.get(inventoryItemRef);

        if (!inventoryItemDoc.exists()) {
          throw new Error("Inventory item not found!");
        }

        const currentQuantity = inventoryItemDoc.data().quantity;
        const newQuantity = currentQuantity + finalQuantity;
        
        transaction.update(inventoryItemRef, { quantity: newQuantity });

        const preOrderItemRef = doc(db, "pre-orders", itemToFulfill.id);
        transaction.update(preOrderItemRef, { status: 'Fulfilled' });
        
        return;
      });

      await manageTransaction({
        itemId: itemToFulfill.itemId,
        itemName: itemToFulfill.itemName,
        type: 'in',
        quantity: finalQuantity,
        person: `From PO ${itemToFulfill.poNumber}`,
      });


      addNotification({
        title: "Item Fulfilled!",
        description: `${finalQuantity}x ${itemToFulfill.itemName} added to inventory.`,
        icon: CheckCircle,
      });

      setFulfillOpen(false);
      setItemToFulfill(null);
      setFulfillQuantity('');

    } catch (error) {
      console.error("Failed to fulfill item:", error);
      toast({
        variant: "destructive",
        title: "Fulfillment Failed",
        description: "Could not update inventory and pre-order status.",
      });
    }
  };


  const handleDeletePreOrder = async () => {
    if (!selectedPo || !db) return;
    
    const batch = writeBatch(db);
    selectedPo.orders.forEach(order => {
        const docRef = doc(db, "pre-orders", order.id);
        batch.delete(docRef);
    });
    await batch.commit();

    addNotification({
        title: "Pre-Order Deleted",
        description: `The pre-order ${selectedPo.poNumber} has been removed.`,
        icon: Trash2
    });
    setDeleteOpen(false);
    setSelectedPo(null);
  }

  const handleItemDecision = async (item: PreOrder, decision: 'Approved' | 'Rejected') => {
    if (!db) return;
    try {
        const itemRef = doc(db, "pre-orders", item.id);
        await updateDoc(itemRef, { status: decision });
        
        addNotification({
          title: `${decision}`,
          description: `Item ${item.itemName} has been ${decision.toLowerCase()}.`,
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
        poToApprove.orders.forEach(request => {
            if (request.status === 'Awaiting Approval' || request.status === 'Pending') {
                const docRef = doc(db, "pre-orders", request.id);
                batch.update(docRef, { status: 'Approved', approver: approverName });
            }
        });
        await batch.commit();
        addNotification({
            title: "PO Approved",
            description: `Request ${poToApprove.poNumber} has been marked as Approved.`,
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

  const updateStatus = async (po: GroupedPO, status: PreOrder['status']) => {
    if (!db) return;
    const batch = writeBatch(db);
    // When undoing, all items in the group should be updated.
    po.orders.forEach(order => {
        const orderRef = doc(db, "pre-orders", order.id);
        batch.update(orderRef, { status, approver: '' }); // Clear approver on undo
    });
    await batch.commit();
    addNotification({
      title: 'Status Updated',
      description: `PO ${po.poNumber} marked as ${status}.`,
      icon: CheckCircle,
    });
  };

  const handleOpenFulfillDialog = (orderItem: PreOrder) => {
    setItemToFulfill(orderItem);
    setFulfillQuantity(orderItem.quantity);
    setFulfillOpen(true);
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

      addNotification({
        title: 'Approval Requested',
        description: `${posToApprove.length} pre-order(s) sent for approval.`,
        icon: Send,
      });

      const phoneNumber = "628563866500";
      const poList = posToApprove.map(po => `- ${po.poNumber}`).join('\n');
      const message = encodeURIComponent(
        `Dengan hormat,\n\nMohon untuk ditinjau dan disetujui permintaan Pre-Order berikut:\n\n${poList}\n\nAnda dapat meninjaunya langsung melalui tautan di bawah ini:\nhttps://stationeryinventory-gwk.vercel.app/pre-orders\n\nTerima kasih.`
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
  
  const handleExportPdf = () => {
    if (selectedRows.length === 0) {
      toast({ variant: "destructive", title: "No items selected" });
      return;
    }
  
    const allItemsInSelectedPOs = groupedPreOrders
      .filter(po => selectedRows.includes(po.poNumber))
      .flatMap(po => po.orders);
  
    const itemsToExport = allItemsInSelectedPOs.filter(
      item => item.status === 'Approved' || item.status === 'Fulfilled' || item.status === 'Awaiting Approval'
    );
  
    if (itemsToExport.length === 0) {
      toast({
        variant: "destructive",
        title: "No exportable items found",
        description: "The selected POs do not contain any 'Approved', 'Fulfilled' or 'Awaiting Approval' items.",
      });
      return;
    }
  
    const ids = itemsToExport.map(item => item.id).join(',');
    router.push(`/surat-jalan?ids=${ids}`);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const selectableRows = groupedPreOrders
        .filter(po => po.status === 'Pending' || po.status === 'Approved' || po.status === 'Fulfilled' || po.status === 'Awaiting Approval')
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
      setSelectedItemName(t.selectItem)
      setSelectedItemId(undefined);
      setPoPrice("");
      setSelectedUnit(undefined);
    }
    setComboPoOpen(false);
  };

  const getStatusText = (status: PreOrder['status']) => {
    return t.statuses[status] || status;
  }
  
  const getUnitText = (unit: string) => {
    return t.unitsFull[unit as keyof typeof t.unitsFull] || unit;
  }

  const groupedPreOrders = React.useMemo(() => {
    const groups: { [key: string]: PreOrder[] } = {};
    preOrders.forEach(order => {
        if (!groups[order.poNumber]) {
            groups[order.poNumber] = [];
        }
        groups[order.poNumber].push(order);
    });

    return Object.entries(groups).map(([poNumber, orders]) => {
      const getOverallStatus = (): PreOrder['status'] => {
        if (orders.every(o => o.status === 'Fulfilled')) return 'Fulfilled';
        if (orders.every(o => o.status === 'Cancelled')) return 'Cancelled';
        if (orders.some(o => o.status === 'Awaiting Approval')) return 'Awaiting Approval';
        if (orders.some(o => o.status === 'Rejected')) return 'Rejected';
        if (orders.some(o => o.status === 'Pending')) return 'Pending';
        if (orders.every(o => ['Approved', 'Fulfilled'].includes(o.status))) return 'Approved';
        return 'Awaiting Approval';
      };

      return {
        poNumber,
        orders,
        totalItems: orders.length,
        totalValue: orders.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        totalQuantity: orders.reduce((sum, item) => sum + item.quantity, 0),
        status: getOverallStatus(),
        orderDate: orders[0]?.orderDate,
        expectedDate: orders[0]?.expectedDate,
        approver: orders.find(o => o.approver)?.approver,
      };
    }).filter(po => po.orders.length > 0);
  }, [preOrders]);

  const filteredPreOrders = React.useMemo(() => {
    return groupedPreOrders.filter(po => {
      if (openAccordion) return true;
      const statusMatch = statusFilter === 'all' || po.status === statusFilter;
      const dateMatch = !dateFilter || format(new Date(po.expectedDate), 'yyyy-MM-dd') === format(dateFilter, 'yyyy-MM-dd');
      return statusMatch && dateMatch;
    });
  }, [groupedPreOrders, statusFilter, dateFilter, openAccordion]);
  
  const selectableRowCount = filteredPreOrders.filter(po => po.status === 'Pending' || po.status === 'Approved' || po.status === 'Fulfilled' || po.status === 'Awaiting Approval').length;
  const isAllSelected = selectedRows.length > 0 && selectableRowCount > 0 && selectedRows.length === selectableRowCount;
  const canRequestApproval = selectedRows.some(poNumber => groupedPreOrders.find(po => po.poNumber === poNumber)?.status === 'Pending');
  const canExport = selectedRows.some(poNumber => {
    const po = groupedPreOrders.find(p => p.poNumber === poNumber);
    return po?.orders.some(item => item.status === 'Approved' || item.status === 'Fulfilled' || item.status === 'Awaiting Approval');
  });
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }
  const isAdminUser = user && user.email === 'devaadmin@gmail.com';
  const isHrdUser = user && user.email === 'krezthrd@gmail.com';
  const canApprove = isAdminUser || isHrdUser;
  const canPerformWriteActions = user && user.email !== 'krezthrd@gmail.com';
  
  if (loading || authLoading) {
    return <FullPageSpinner />;
  }

  if (user && user.email === 'kreztservice@gmail.com') {
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
    <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground">
            {t.description}
          </p>
        </div>
        <div className="flex w-full flex-col md:flex-row md:w-auto items-center gap-2">
          <div className="flex w-full items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t.allStatuses} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allStatuses}</SelectItem>
                <SelectItem value="Pending">{t.statuses.Pending}</SelectItem>
                <SelectItem value="Awaiting Approval">{t.statuses['Awaiting Approval']}</SelectItem>
                <SelectItem value="Approved">{t.statuses.Approved}</SelectItem>
                <SelectItem value="Rejected">{t.statuses.Rejected}</SelectItem>
                <SelectItem value="Fulfilled">{t.statuses.Fulfilled}</SelectItem>
                <SelectItem value="Cancelled">{t.statuses.Cancelled}</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className="w-auto justify-start text-left font-normal px-3">
                  <CalendarIcon className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">{dateFilter ? format(dateFilter, "PPP", { locale: currentLocale }) : <span>{t.filterByDate}</span>}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateFilter} onSelect={setDateFilter} initialFocus locale={currentLocale} />
              </PopoverContent>
            </Popover>
            {dateFilter && (
                <Button variant="ghost" size="icon" onClick={() => setDateFilter(undefined)} className='hidden md:inline-flex'>
                    <X className="h-4 w-4" />
                </Button>
            )}
            {canPerformWriteActions && (
              <Dialog open={isCreateOpen} onOpenChange={(isOpen) => { setCreateOpen(isOpen); if(!isOpen) {setSelectedItemId(undefined); setSelectedItemName(t.selectItem); setPoPrice("")} }}>
                  <DialogTrigger asChild>
                    <Button size="icon" className="md:hidden w-auto px-3 h-10">
                      <PlusCircle className="h-4 w-4" />
                  </Button>
                  </DialogTrigger>
                  <DialogContent>
                  <DialogHeader>
                      <DialogTitle>{isCreatingNewPo ? t.createNewPOTitle : t.addItemTitle(activePoNumber)}</DialogTitle>
                      <DialogDescription>
                      {isCreatingNewPo ? t.createNewPODesc : t.addItemDesc}
                      </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreatePreOrder} className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="poNumber" className="text-right">{t.poNumber}</Label>
                      <Input id="poNumber" name="poNumber" className="col-span-3" value={activePoNumber} readOnly disabled />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="item" className="text-right">{t.item}</Label>
                      <div className="col-span-3">
                          <Popover open={comboPoOpen} onOpenChange={setComboPoOpen}>
                          <PopoverTrigger asChild>
                              <Button variant="outline" role="combobox" aria-expanded={comboPoOpen} className="w-full justify-between">
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
                                      <CommandItem key={item.id} value={item.name} onSelect={() => handleItemSelectForPo(item.id)}>
                                      <Check className={cn("mr-2 h-4 w-4", selectedItemId === item.id ? "opacity-100" : "opacity-0")} />
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
                      <Label htmlFor="price" className="text-right">{t.price}</Label>
                      <Input id="price" name="price" type="number" min="0" className="col-span-3" required value={poPrice} onChange={(e) => setPoPrice(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="unit" className="text-right">{t.unit}</Label>
                      <Select name="unit" required onValueChange={setSelectedUnit} value={selectedUnit}>
                          <SelectTrigger className="col-span-3"> <SelectValue placeholder="Select a unit" /> </SelectTrigger>
                          <SelectContent>
                            {Object.entries(t.unitsFull).map(([key, value]) => (
                              <SelectItem key={key} value={key}>{value}</SelectItem>
                            ))}
                          </SelectContent>
                      </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="quantity" className="text-right">{t.qty}</Label>
                      <Input id="quantity" name="quantity" type="number" min="1" className="col-span-3" required />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="expectedDate" className="text-right">{t.expectedDate}</Label>
                      <Input id="expectedDate" name="expectedDate" type="date" className="col-span-3" required />
                      </div>
                      <DialogFooter>
                      <Button type="submit">{t.addItemBtn}</Button>
                      </DialogFooter>
                  </form>
                  </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="flex w-full md:w-auto items-center justify-end gap-2">
            {selectedRows.length > 0 && (
              <div className="flex items-center gap-2">
                {canPerformWriteActions && (
                  <Button onClick={handleRequestApproval} disabled={!canRequestApproval}>
                    <Send className="mr-2 h-4 w-4" />
                    <span className="hidden md:inline">{t.requestApproval}</span>
                  </Button>
                )}
                {(canExport || isHrdUser) && (
                  <Button variant="outline" onClick={handleExportPdf}>
                    <FileDown className="mr-2 h-4 w-4" />
                    <span className="hidden md:inline">{t.export}</span>
                  </Button>
                )}
              </div>
            )}

            {canPerformWriteActions && (
              <Dialog open={isCreateOpen} onOpenChange={(isOpen) => { setCreateOpen(isOpen); if(!isOpen) {setSelectedItemId(undefined); setSelectedItemName(t.selectItem); setPoPrice("")} }}>
                  <DialogTrigger asChild>
                  <Button className={cn("hidden md:inline-flex", selectedRows.length > 0 && "flex-1 md:flex-initial")}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      {isCreatingNewPo ? t.createNewPO : t.addItemToPO}
                  </Button>
                  </DialogTrigger>
                  <DialogContent>
                  <DialogHeader>
                      <DialogTitle>{isCreatingNewPo ? t.createNewPOTitle : t.addItemTitle(activePoNumber)}</DialogTitle>
                      <DialogDescription>
                      {isCreatingNewPo ? t.createNewPODesc : t.addItemDesc}
                      </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreatePreOrder} className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="poNumber" className="text-right">{t.poNumber}</Label>
                      <Input id="poNumber" name="poNumber" className="col-span-3" value={activePoNumber} readOnly disabled />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="item" className="text-right">{t.item}</Label>
                      <div className="col-span-3">
                          <Popover open={comboPoOpen} onOpenChange={setComboPoOpen}>
                          <PopoverTrigger asChild>
                              <Button variant="outline" role="combobox" aria-expanded={comboPoOpen} className="w-full justify-between">
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
                                      <CommandItem key={item.id} value={item.name} onSelect={() => handleItemSelectForPo(item.id)}>
                                      <Check className={cn("mr-2 h-4 w-4", selectedItemId === item.id ? "opacity-100" : "opacity-0")} />
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
                      <Label htmlFor="price" className="text-right">{t.price}</Label>
                      <Input id="price" name="price" type="number" min="0" className="col-span-3" required value={poPrice} onChange={(e) => setPoPrice(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="unit" className="text-right">{t.unit}</Label>
                      <Select name="unit" required onValueChange={setSelectedUnit} value={selectedUnit}>
                          <SelectTrigger className="col-span-3"> <SelectValue placeholder="Select a unit" /> </SelectTrigger>
                          <SelectContent>
                            {Object.entries(t.unitsFull).map(([key, value]) => (
                              <SelectItem key={key} value={key}>{value}</SelectItem>
                            ))}
                          </SelectContent>
                      </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="quantity" className="text-right">{t.qty}</Label>
                      <Input id="quantity" name="quantity" type="number" min="1" className="col-span-3" required />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="expectedDate" className="text-right">{t.expectedDate}</Label>
                      <Input id="expectedDate" name="expectedDate" type="date" className="col-span-3" required />
                      </div>
                      <DialogFooter>
                      <Button type="submit">{t.addItemBtn}</Button>
                      </DialogFooter>
                  </form>
                  </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </header>
      
      <div className="space-y-4">
        <div className="px-4 hidden sm:flex">
            <Checkbox checked={isAllSelected} onCheckedChange={(checked) => handleSelectAll(Boolean(checked))} aria-label="Select all" disabled={selectableRowCount === 0} className="mr-4" />
            <span className="text-sm text-muted-foreground">{t.selectAll}</span>
        </div>
        {filteredPreOrders.length > 0 ? (
          <Accordion type="single" collapsible value={openAccordion} onOpenChange={setOpenAccordion}>
            {filteredPreOrders.map((po) => {
               const itemsToDisplay = openAccordion === po.poNumber && statusFilter !== "all" ? po.orders.filter((order) => order.status === statusFilter) : po.orders;
               const statusColor = {'Pending': 'bg-yellow-500', 'Awaiting Approval': 'bg-yellow-500', 'Approved': 'bg-green-500', 'Fulfilled': 'bg-blue-500', 'Rejected': 'bg-red-500', 'Cancelled': 'bg-red-500'}[po.status] || 'bg-gray-500';

              return (
                <AccordionItem key={po.poNumber} value={po.poNumber} className="border-0">
                   <Card data-state={selectedRows.includes(po.poNumber) ? "selected" : "unselected"} className="data-[state=selected]:ring-2 ring-primary relative overflow-hidden">
                     <div className={cn("absolute left-0 top-0 h-full w-1.5", statusColor)}></div>
                      <CardHeader className="p-4 pl-8">
                      <div className="flex flex-wrap items-start justify-between gap-y-2">
                          <div className="flex items-center gap-4 flex-grow">
                            <Checkbox checked={selectedRows.includes(po.poNumber)} onCheckedChange={() => handleSelectRow(po.poNumber)} aria-label="Select PO" disabled={!['Pending', 'Approved', 'Fulfilled', 'Awaiting Approval'].includes(po.status)} />
                            <div className="p-2 bg-primary/10 rounded-lg"> <FileText className="h-5 w-5 text-primary" /> </div>
                            <div className="flex-grow">
                                <h3 className="font-semibold text-base">{po.poNumber}</h3>
                                <div className="flex items-center flex-wrap gap-2 text-sm text-muted-foreground">
                                    <Badge variant={ {'Approved': 'default', 'Fulfilled': 'default', 'Rejected': 'destructive', 'Cancelled': 'destructive', 'Pending': 'warning', 'Awaiting Approval': 'warning'}[po.status] as any || 'outline'} className={ {'Approved': 'bg-green-100 text-green-800', 'Fulfilled': 'bg-blue-100 text-blue-800', 'Rejected': 'bg-red-100 text-red-800', 'Cancelled': 'bg-red-100 text-red-800', 'Pending': 'bg-yellow-100 text-yellow-800', 'Awaiting Approval': 'bg-yellow-100 text-yellow-800'}[po.status] }>
                                        {getStatusText(po.status)}
                                    </Badge>
                                    <span>• {po.totalQuantity} {t.units}</span>
                                    {po.approver && <span className='hidden sm:inline'>• {t.approvedBy(po.approver)}</span>}
                                </div>
                            </div>
                          </div>
                          <div className="w-full sm:w-auto flex items-start justify-between">
                            <div className="text-left sm:text-right text-sm whitespace-nowrap sm:ml-4">
                                <div className="font-medium">{format(new Date(po.orderDate), "MMMM dd, yyyy", { locale: currentLocale })}</div>
                                <div className="font-semibold">{formatCurrency(po.totalValue)}</div>
                            </div>
                            <div className="flex items-center ml-auto">
                              <AccordionTrigger>
                                <div className="p-2 hover:bg-muted rounded-md [&[data-state=open]>svg]:rotate-180">
                                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                                </div>
                              </AccordionTrigger>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>{t.actions}</DropdownMenuLabel>
                                      {canApprove && po.status === 'Awaiting Approval' && (
                                        <DropdownMenuItem onSelect={() => { setPoToApprove(po); setApprovalOpen(true); }}>
                                          <Check className="mr-2 h-4 w-4" />{t.markAsApproved}
                                        </DropdownMenuItem>
                                      )}
                                      
                                      {po.status === 'Fulfilled' && (
                                        <DropdownMenuItem onSelect={() => updateStatus(po, 'Approved')}>
                                          <Undo2 className="mr-2 h-4 w-4" /> {t.undo}
                                        </DropdownMenuItem>
                                      )}
                                      {(po.status === 'Approved' || po.status === 'Rejected') && (
                                        <DropdownMenuItem onSelect={() => updateStatus(po, 'Awaiting Approval')}>
                                          <Undo2 className="mr-2 h-4 w-4" /> {t.undoDecision}
                                        </DropdownMenuItem>
                                      )}
                                      {(po.status === 'Awaiting Approval' || po.status === 'Cancelled') && (
                                        <DropdownMenuItem onSelect={() => updateStatus(po, 'Pending')}>
                                          <Undo2 className="mr-2 h-4 w-4" /> {t.undo}
                                        </DropdownMenuItem>
                                      )}

                                      {canPerformWriteActions && po.status === 'Pending' && <DropdownMenuItem onSelect={() => updateStatus(po, 'Cancelled')}>{t.cancelOrder}</DropdownMenuItem>}

                                      <DropdownMenuSeparator />
                                      {canPerformWriteActions && po.status !== 'Fulfilled' && <DropdownMenuItem className="text-red-600 focus:text-red-700" onSelect={() => { setSelectedPo(po); setDeleteOpen(true); }}> <Trash2 className="mr-2 h-4 w-4" /> {t.delete} </DropdownMenuItem>}
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
                              <TableHead>{t.item}</TableHead> <TableHead>{t.unit}</TableHead> <TableHead>{t.status}</TableHead> <TableHead className="text-right">{t.qty}</TableHead> <TableHead className="text-right">{t.price}</TableHead> <TableHead className="text-right">{t.total}</TableHead> <TableHead><span className="sr-only">{t.actions}</span></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {itemsToDisplay.map(order => (
                              <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.itemName}</TableCell> <TableCell>{getUnitText(order.unit)}</TableCell>
                                <TableCell> <Badge variant={ {'Approved': 'default', 'Fulfilled': 'default', 'Rejected': 'destructive', 'Cancelled': 'destructive', 'Pending': 'warning', 'Awaiting Approval': 'warning'}[order.status] as any || 'outline'} className={ {'Approved': 'bg-green-100 text-green-800', 'Fulfilled': 'bg-blue-100 text-blue-800', 'Rejected': 'bg-red-100 text-red-800', 'Cancelled': 'bg-red-100 text-red-800', 'Pending': 'bg-yellow-100 text-yellow-800', 'Awaiting Approval': 'bg-yellow-100 text-yellow-800'}[order.status] }> {getStatusText(order.status)} </Badge> </TableCell>
                                <TableCell className="text-right">{order.quantity}</TableCell> <TableCell className="text-right">{formatCurrency(order.price)}</TableCell> <TableCell className="text-right font-medium">{formatCurrency(order.quantity * order.price)}</TableCell>
                                <TableCell className="text-right">
                                  {order.status !== 'Fulfilled' && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost">
                                          <MoreHorizontal className="h-4 w-4" />
                                          <span className="sr-only">Item Actions</span>
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        {order.status === 'Pending' && canPerformWriteActions && (
                                          <>
                                            <DropdownMenuItem onSelect={() => { setSelectedOrderItem(order); setEditItemOpen(true); }}>
                                              <Pencil className="mr-2 h-4 w-4" /> {t.edit}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-500" onSelect={() => { setSelectedOrderItem(order); setDeleteItemOpen(true); }}>
                                              <Trash2 className="mr-2 h-4 w-4" /> {t.delete}
                                            </DropdownMenuItem>
                                          </>
                                        )}
                                        {order.status === 'Awaiting Approval' && canApprove && (
                                          <>
                                            <DropdownMenuItem onSelect={() => { setSelectedOrderItem(order); setEditItemOpen(true); }}>
                                              <Pencil className="mr-2 h-4 w-4" /> {t.edit}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-green-600" onSelect={() => handleItemDecision(order, 'Approved')}>
                                              <Check className="mr-2 h-4 w-4" /> {t.approve}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600" onSelect={() => handleItemDecision(order, 'Rejected')}>
                                              <X className="mr-2 h-4 w-4" /> {t.reject}
                                            </DropdownMenuItem>
                                          </>
                                        )}
                                        {order.status === 'Approved' && canPerformWriteActions && (
                                            <DropdownMenuItem onSelect={() => handleOpenFulfillDialog(order)}>
                                                <CheckCircle className="mr-2 h-4 w-4" /> {t.markAsFulfilled}
                                            </DropdownMenuItem>
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                      <CardFooter className="p-4 pt-2 bg-muted/30 flex-wrap gap-4 justify-between text-sm">
                           <div className="flex items-center gap-2"> <Box className="h-4 w-4 text-muted-foreground" /> <div> <p className="text-muted-foreground text-xs">{t.totalQuantity}</p> <p className="font-medium">{po.totalQuantity} {t.units}</p> </div> </div>
                           <div className="flex items-center gap-2"> <CalendarDays className="h-4 w-4 text-muted-foreground" /> <div> <p className="text-muted-foreground text-xs">{t.expectedDelivery}</p> <p className="font-medium">{format(new Date(po.expectedDate), "MMM d, yyyy", { locale: currentLocale })}</p> </div> </div>
                      </CardFooter>
                    </AccordionContent>
                   </Card>
                </AccordionItem>
              )})}
          </Accordion>
        ) : (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-24">
              <div className="flex flex-col items-center gap-1 text-center">
                <h3 className="text-2xl font-bold tracking-tight"> {t.noPreOrdersTitle} </h3>
                <p className="text-sm text-muted-foreground"> {t.noPreOrdersDesc} </p>
              </div>
            </div>
        )}
      </div>

        <AlertDialog open={isDeleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader> <AlertDialogTitle>{t.areYouSure}</AlertDialogTitle> <AlertDialogDescription> {t.deleteWarning(selectedPo?.poNumber || '')} </AlertDialogDescription> </AlertDialogHeader>
            <AlertDialogFooter> <AlertDialogCancel onClick={() => setSelectedPo(null)}>{t.cancelBtn}</AlertDialogCancel> <AlertDialogAction onClick={handleDeletePreOrder}> {t.deleteBtn} </AlertDialogAction> </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isEditItemOpen} onOpenChange={setEditItemOpen}>
          <DialogContent>
            <DialogHeader> <DialogTitle>{t.editItemTitle(selectedOrderItem?.itemName || '')}</DialogTitle> <DialogDescription> {t.editItemDesc} </DialogDescription> </DialogHeader>
            <form onSubmit={handleEditOrderItem} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4"> <Label htmlFor="price" className="text-right">{t.price}</Label> <Input id="price" name="price" type="number" min="0" className="col-span-3" defaultValue={selectedOrderItem?.price} required /> </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unit" className="text-right">{t.unit}</Label>
                <Select name="unit" required onValueChange={setSelectedUnit} defaultValue={selectedOrderItem?.unit}>
                  <SelectTrigger className="col-span-3"> <SelectValue placeholder="Select a unit" /> </SelectTrigger>
                   <SelectContent>
                      {Object.entries(t.unitsFull).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4"> <Label htmlFor="quantity" className="text-right">{t.qty}</Label> <Input id="quantity" name="quantity" type="number" min="1" className="col-span-3" defaultValue={selectedOrderItem?.quantity} required /> </div>
              <DialogFooter> <Button type="submit">{t.saveChanges}</Button> </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteItemOpen} onOpenChange={setDeleteItemOpen}>
          <AlertDialogContent>
            <AlertDialogHeader> <AlertDialogTitle>{t.deleteItemTitle}</AlertDialogTitle> <AlertDialogDescription> {t.deleteItemDesc(selectedOrderItem?.itemName || '')} </AlertDialogDescription> </AlertDialogHeader>
            <AlertDialogFooter> <AlertDialogCancel onClick={() => setSelectedOrderItem(null)}>{t.cancelBtn}</AlertDialogCancel> <AlertDialogAction onClick={handleDeleteOrderItem}> {t.deleteItemBtn} </AlertDialogAction> </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isFulfillOpen} onOpenChange={setFulfillOpen}>
          <DialogContent>
              <DialogHeader> <DialogTitle>{t.fulfillItemTitle(itemToFulfill?.itemName || '')}</DialogTitle> <DialogDescription> {t.fulfillItemDesc} </DialogDescription> </DialogHeader>
              <form onSubmit={handleFulfillItem}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4"> <Label htmlFor="fulfill-quantity" className="text-right"> {t.quantityReceived} </Label> <Input id="fulfill-quantity" name="fulfill-quantity" type="number" min="1" className="col-span-3" value={fulfillQuantity} onChange={(e) => setFulfillQuantity(e.target.value)} required /> </div>
                </div>
                <DialogFooter> <Button type="button" variant="outline" onClick={() => setFulfillOpen(false)}>{t.cancelBtn}</Button> <Button type="submit">{t.confirmAndAdd}</Button> </DialogFooter>
              </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isApprovalOpen} onOpenChange={setApprovalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t.approveConfirmation}</DialogTitle>
                    <DialogDescription>{t.approveConfirmationDesc(poToApprove?.poNumber || '')}</DialogDescription>
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
                        <Button type="button" variant="outline" onClick={() => setApprovalOpen(false)}>{t.cancelBtn}</Button>
                        <Button type="submit">{t.confirmApproval}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

    </div>
  );
}
