
"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Papa from "papaparse";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlusCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  MoreHorizontal,
  Search,
  Trash2,
  Pencil,
  Camera,
  SwitchCamera,
  ShoppingCart,
  Upload,
  ChevronDown,
  Download,
  Database,
  Check,
  ChevronsUpDown,
  List,
  LayoutGrid,
  Loader2,
  Ban,
} from "lucide-react";
import type { InventoryItem, Transaction } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getGoogleDriveImageSrc } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { manageTransaction } from "@/lib/transactions";
import { useTheme } from "@/hooks/use-theme";


const seedData = [
  { name: "Amplop ( Merpati 229x110mm )", quantity: 173, photoUrl: "https://drive.google.com/file/d/1ZFM-JZFQTmA67N05tVBI1V7K-yjOARmN/view?usp=drivesdk", unit: "Pcs", price: 20000 },
  { name: "Amplop Surat", quantity: 458, photoUrl: "https://drive.google.com/file/d/1Z0f54G41F1rlNTwUx0y--j0UR_e9YcGe/view?usp=drivesdk", unit: "Pcs", price: 0 },
  { name: "Bantex ( 1446-10 70mm Black )", quantity: 7, photoUrl: "https://drive.google.com/file/d/1M_Pg55iL6nXyIOrPEdEcFnj5zJ10QW87/view?usp=drivesdk", unit: "Pcs", price: 25000 },
  { name: "Bantex Folio/Box File", quantity: 4, photoUrl: "https://drive.google.com/file/d/1WOl_gD0-oBe_ncqUHInHipXxe7wZBNNh/view?usp=drivesdk", unit: "Pcs", price: 50000 },
  { name: "Baterai ( ABC 9 Volt )", quantity: 16, photoUrl: "https://drive.google.com/file/d/1IAq3wLRF5dq-26u6Lh3mOXcSkkiyUBtT/view?usp=drivesdk", unit: "Pcs", price: 17000 },
  { name: "Baterai ( ABC A2 )", quantity: 176, photoUrl: "https://drive.google.com/file/d/15b0pY_PQtv8ZIvWLv6ODiFn7JWa0CG8K/view?usp=drivesdk", unit: "Pcs", price: 60000 },
  { name: "Baterai ( Alkaline A3 )", quantity: 10, photoUrl: "https://drive.google.com/file/d/17zY4y4CUuMXUeL0b5KUoL4w3VykC4yi5/view?usp=drivesdk", unit: "Pcs", price: 23000 },
  { name: "Baterai jam ( Maxell 3V )", quantity: 0, photoUrl: "https://drive.google.com/file/d/1R_8rl31bT4kACr_5lRCKc57kuCBnjeu2/view?usp=drivesdk", unit: "Pcs", price: 2000 },
  { name: "BIG Folio ( ART.7003 )", quantity: 2, photoUrl: "https://drive.google.com/file/d/1JJz2H5H9Kwln8103_uUocwBdX0zKCs9V/view?usp=drivesdk", unit: "Pcs", price: 0 },
  { name: "Binder Clip ( BIG 32mm )", quantity: 55, photoUrl: "https://drive.google.com/file/d/14q2w69IHyqn1ZmcXHFB7Azs6Td75xv_s/view?usp=drivesdk", unit: "Pcs", price: 3000 },
  { name: "Bindex A5", quantity: 1, photoUrl: "", unit: "Pcs", price: 0 },
  { name: "Buku Gelatik Kembar ( Batik )", quantity: 6, photoUrl: "https://drive.google.com/file/d/176dKDuiICP1NZMcwQ0r_b5dzBszavG53/view?usp=drivesdk", unit: "Pcs", price: 5000 },
  { name: "Buku Tulis ( SIDU )", quantity: 7, photoUrl: "https://drive.google.com/file/d/1Usff5qXxGggaK5upwSplb07xkSvchX_D/view?usp=drivesdk", unit: "Pcs", price: 3500 },
  { name: "Busa cuci piring", quantity: 0, photoUrl: "https://drive.google.com/file/d/1ehc4dFdrlst5JkTQJzsHH8FHkiS3qe6l/view?usp=drivesdk", unit: "Pcs", price: 0 },
  { name: "Business File A4", quantity: 23, photoUrl: "https://drive.google.com/file/d/1D3pUp20MiaHeRKcl6iU9GKKbchnCjgPt/view?usp=drivesdk", unit: "Pcs", price: 2000 },
  { name: "Correction Tape Cair", quantity: 5, photoUrl: "", unit: "Pcs", price: 2500 },
  { name: "Correction Tape Kertas", quantity: 0, photoUrl: "https://drive.google.com/file/d/1lLKCEhj1WHe_PmGF4entHos9cmSB4csW/view?usp=drivesdk", unit: "Pcs", price: 7000 },
  { name: "Cutter Besar ( ZRM L-500 )", quantity: 2, photoUrl: "https://drive.google.com/file/d/1KREDh4CeabqSatooZPNRf1wzKpYD6EOq/view?usp=drivesdk", unit: "Pcs", price: 14000 },
  { name: "Cutter Kecil ( KENKO A-300 )", quantity: 1, photoUrl: "https://drive.google.com/file/d/1OtlFcmWfFUlh31PJLRuyF_5lAFkCPZ9i/view?usp=drivesdk", unit: "Pcs", price: 5000 },
  { name: "Dispenser Tape", quantity: 6, photoUrl: "https://drive.google.com/file/d/1Etz9KLOOzA0O036NAjyxgGBwj4Gol7UC/view?usp=drivesdk", unit: "Pcs", price: 20000 },
  { name: "Double Tape 12mm", quantity: 37, photoUrl: "https://drive.google.com/file/d/1_2k0a1es82saFoGBPu7b8-DbchktPZGp/view?usp=drivesdk", unit: "Roll", price: 3000 },
  { name: "Double Tape Foam ( BEERYTAPE 24mm )", quantity: 8, photoUrl: "https://drive.google.com/file/d/1UznuOH97LB1wN4JEDewnkRB78TmU23W8/view?usp=drivesdk", unit: "Roll", price: 6500 },
  { name: "Elemen Solder", quantity: 0, photoUrl: "", unit: "Pcs", price: 25000 },
  { name: "Gembok", quantity: 0, photoUrl: "https://drive.google.com/file/d/1e4KJVv2zp1-6XavX50Ee44YBcemkrn53/view?usp=drivesdk", unit: "Pcs", price: 0 },
  { name: "Gunting Besar ( Ideal 8.5' )", quantity: 2, photoUrl: "https://drive.google.com/file/d/1TpOLDdp6zV6PNAiuNepFa7BTGVrFM4my/view?usp=drivesdk", unit: "Pcs", price: 10000 },
  { name: "Gunting Kecil ( Ideal 4.5' )", quantity: 0, photoUrl: "https://drive.google.com/file/d/1x-lSgsKwFyPk2OP3xlSagQ_pRMD_1vQ8/view?usp=drivesdk", unit: "Pcs", price: 4000 },
  { name: "ID Card ( BIG )", quantity: 9, photoUrl: "https://drive.google.com/file/d/1rr35HuoT8pvcx1DLU1T1G7DNkuR2dmcv/view?usp=drivesdk", unit: "Pcs", price: 0 },
  { name: "Isi Cutter Besar ( KENKO L-150 )", quantity: 23, photoUrl: "https://drive.google.com/file/d/1tDXoS5soYikHw21xsf7WlQcNZRX2hYL0/view?usp=drivesdk", unit: "Pcs", price: 40000 },
  { name: "Isi Cutter Kecil ( KENKO A-100 )", quantity: 129, photoUrl: "https://drive.google.com/file/d/1aGyYg5Tqb03V7er3LyplgDV037nsPrhv/view?usp=drivesdk", unit: "Pcs", price: 30000 },
  { name: "Isi Pensil Mekanik ( JOYKO 2B 60mm )", quantity: 8, photoUrl: "https://drive.google.com/file/d/19Qd5mBJPlU_miSYNcF0Amdhrt_imISJG/view?usp=drivesdk", unit: "Pcs", price: 0 },
  { name: "Isi Staples Besar ( SDI NO.3 )", quantity: 13, photoUrl: "https://drive.google.com/file/d/1nZHastdTPuzZTKvmAMi6KnsR5qnh28LP/view?usp=drivesdk", unit: "Pcs", price: 4000 },
  { name: "Isi Staples Kecil ( SDI NO.10 )", quantity: 26, photoUrl: "https://drive.google.com/file/d/1dFPbBbcye--8gvc6JtXRDulqcf5piHgV/view?usp=drivesdk", unit: "Pcs", price: 3000 },
  { name: "Isi Tinta Spidol ( Refill Permanent Marking INK )", quantity: 5, photoUrl: "https://drive.google.com/file/d/1hZWRcU5ikTHQHv6UVkdUDlRdS1GO2Y2S/view?usp=drivesdk", unit: "Pcs", price: 12000 },
  { name: "Isolasi Kecil ( Nachi 1/2x25 )", quantity: 46, photoUrl: "https://drive.google.com/file/d/12oBTiBFJikgzumpfW98Q3Q-M8LHxKYO2/view?usp=drivesdk", unit: "Roll", price: 2600 },
  { name: "Isolasi Kertas ( Masking Tape Nachi 24mm )", quantity: 38, photoUrl: "https://drive.google.com/file/d/1IEhKvBh_uYIe0YttieePBfoP69HUNef7/view?usp=drivesdk", unit: "Roll", price: 5000 },
  { name: "Isolasi Listrik Hitam ( National )", quantity: 9, photoUrl: "https://drive.google.com/file/d/1T68k7rGlPa3lsGTU5m-jbALxKRHojQNm/view?usp=drivesdk", unit: "Roll", price: 3000 },
  { name: "Kabel Twist tie ( 100m )", quantity: 1, photoUrl: "https://drive.google.com/file/d/1oiGY5iH6Yq5D8W_AT4dcRaeSwCwNPjgU/view?usp=drivesdk", unit: "Roll", price: 32000 },
  { name: "Kalkulator ( Citizen CT-555GB )", quantity: 1, photoUrl: "https://drive.google.com/file/d/1no4rMNIoMaAGFS6czGwdDltJNBSxWxR9/view?usp=drivesdk", unit: "Pcs", price: 150000 },
  { name: "Kertas A4 (100 GSM)", quantity: 0, photoUrl: "https://drive.google.com/file/d/1ojHl2EqB55XK7YMsE_Sd_N6bVLNGxilb/view?usp=drivesdk", unit: "Rim", price: 70000 },
  { name: "Kertas A4 (70 GSM)", quantity: 0, photoUrl: "", unit: "Rim", price: 45000 },
  { name: "Kertas A4 (80 GSM)", quantity: 0, photoUrl: "", unit: "Rim", price: 55000 },
  { name: "Kertas Buram F4", quantity: 1, photoUrl: "https://drive.google.com/file/d/1z6wZXDbcphsNZLzXVyZwgAZFk-VKu5Sr/view?usp=drivesdk", unit: "Rim", price: 30000 },
  { name: "Kertas F4", quantity: 2, photoUrl: "https://drive.google.com/file/d/1i1LHxZTVMM8HT3NjbVOQBSGscRPIYCmD/view?usp=drivesdk", unit: "Rim", price: 50000 },
  { name: "Kertas Foto", quantity: 1, photoUrl: "", unit: "Rim", price: 0 },
  { name: "Kertas Letter 2 ply", quantity: 0, photoUrl: "", unit: "Rim", price: 0 },
  { name: "Kertas Letter 3 Ply", quantity: 0, photoUrl: "", unit: "Rim", price: 0 },
  { name: "Kertas Letter 4 Ply", quantity: 4, photoUrl: "https://drive.google.com/file/d/1IwdIuiymArbYIr380GxbxV8J0O6WaIx5/view?usp=drivesdk", unit: "Rim", price: 0 },
  { name: "Kertas Print 3ply ( 9'5\"x11\")", quantity: 2, photoUrl: "https://drive.google.com/file/d/1zKJ2Guf3EfJmhwLtDgnc-vhYk_R86KhB/view?usp=drivesdk", unit: "Rim", price: 0 },
  { name: "Kertas Print 4ply ( 9'5\"x11\")", quantity: 0, photoUrl: "https://drive.google.com/file/d/1lPDgxL8aVOgpSWFH9oEZ1_5qg9J8ZxAg/view?usp=drivesdk", unit: "Rim", price: 0 },
  { name: "Kertas Sticker ( E-print A4 135gsm )", quantity: 15, photoUrl: "https://drive.google.com/file/d/1o-x7BIbY-g0KfYXcCxD_Adi2dhRLAc47/view?usp=drivesdk", unit: "Rim", price: 36000 },
  { name: "Lakban Bening Besar ( Faster )", quantity: 0, photoUrl: "https://drive.google.com/file/d/1ddz8ZgggHaqZn1PnOE9nwWy0F0loN7Ur/view?usp=drivesdk", unit: "Roll", price: 0 },
  { name: "Lakban Bening Kecil ( Nachi 12mm )", quantity: 0, photoUrl: "https://drive.google.com/file/d/1Mrca7bN8yhBmMJDyN5i--4ZWt6PvdUVI/view?usp=drivesdk", unit: "Roll", price: 2000 },
  { name: "Lem Fox Besar ( 600g )", quantity: 0, photoUrl: "https://drive.google.com/file/d/1elbl2tNbY6sj-pQe_D9KG_nwndVR7Gg-/view?usp=drivesdk", unit: "Can", price: 55000 },
  { name: "Lem Fox Kecil ( 70g )", quantity: 7, photoUrl: "https://drive.google.com/file/d/1bIdRo3_6qa7Eus9bXcXbCFr6P511hJtW/view?usp=drivesdk", unit: "Can", price: 15000 },
  { name: "Lem Fox Sedang ( 185g )", quantity: 0, photoUrl: "https://drive.google.com/file/d/1L_kM_mOlKaqIT4pFDvZGrBq56HhC6zjN/view?usp=drivesdk", unit: "Can", price: 22000 },
  { name: "Lem Kertas", quantity: 1, photoUrl: "https://drive.google.com/file/d/1RTmJaMQgiyyVAPkeU7gkXg-0jPTm67CO/view?usp=drivesdk", unit: "Pcs", price: 5000 },
  { name: "Lem Power Glue", quantity: 0, photoUrl: "", unit: "Pcs", price: 6000 },
  { name: "Map Plastik Kancing ( BIG Art.8111 )", quantity: 23, photoUrl: "https://drive.google.com/file/d/1EWyuskJqFSLVmRlwRN2q3Zp5lE1nfIV4/view?usp=drivesdk", unit: "Pcs", price: 3000 },
  { name: "Map Plastik Tali ( BIG Art.8112 )", quantity: 11, photoUrl: "https://drive.google.com/file/d/1yetRMIjZb86JsAZ_HXoHCl6VISPhXcdA/view?usp=drivesdk", unit: "Pcs", price: 3000 },
  { name: "Mata Solder", quantity: 2, photoUrl: "https://drive.google.com/file/d/15kQ4_M5tIwtkYZglH2HlYbPqk1ugKWdR/view?usp=drivesdk", unit: "Pcs", price: 13000 },
  { name: "Paper Clip ( ZRM NO.3 )", quantity: 6, photoUrl: "https://drive.google.com/file/d/1gxMoQNGkHvjQeN9NFMVTJDrfVaWxftYy/view?usp=drivesdk", unit: "Pcs", price: 2000 },
  { name: "Paper Clip ( ZRM NO.5 )", quantity: 8, photoUrl: "https://drive.google.com/file/d/1Mjr-8ZvIfFUou_r7NxdC_oZYSGpcK-wW/view?usp=drivesdk", unit: "Pcs", price: 2000 },
  { name: "Penggaris Besi ( Butterfly 30cm )", quantity: 3, photoUrl: "https://drive.google.com/file/d/1vLmfhv5ZnySvU3xjNnFqSc6g-8pv59wb/view?usp=drivesdk", unit: "Pcs", price: 5000 },
  { name: "Penghapus Pensil ( BIG )", quantity: 3, photoUrl: "https://drive.google.com/file/d/1y98GUwYU8rXncauCz85l8lAm7r8OJqH1/view?usp=drivesdk", unit: "Pcs", price: 0 },
  { name: "Pengharum Ruangan", quantity: 0, photoUrl: "", unit: "Pcs", price: 10000 },
  { name: "Pensil ( Faber Castell 2B )", quantity: 8, photoUrl: "", unit: "Pcs", price: 45000 },
  { name: "Pines ( COMBO Push Pins )", quantity: 29, photoUrl: "", unit: "Pcs", price: 3000 },
  { name: "Plastik Clip ( 16x25 )", quantity: 0, photoUrl: "", unit: "Pack", price: 24000 },
  { name: "Plastik Clip ( 30x40 )", quantity: 0, photoUrl: "", unit: "Pack", price: 40000 },
  { name: "Plastik Clip ( 8X12)", quantity: 0, photoUrl: "", unit: "Pack", price: 5000 },
  { name: "Plastik Sampah Besar", quantity: 0, photoUrl: "https://drive.google.com/file/d/1vUKuYmaTvZJkUPm-dANFap2OR9rUzi3p/view?usp=drivesdk", unit: "Pack", price: 30000 },
  { name: "Plastik Sampah Kecil", quantity: 0, photoUrl: "https://drive.google.com/file/d/11yW7zoV9jPgzOjrmwIfOIC4RCQt53LWg/view?usp=drivesdk", unit: "Pack", price: 10000 },
  { name: "Plastik Sampah Sedang", quantity: 3, photoUrl: "", unit: "Pack", price: 20000 },
  { name: "Pulpen Faster", quantity: 0, photoUrl: "https://drive.google.com/file/d/1I2aRfyHJYpvtJtUj-Dc1M6G5MLUfzhIm/view?usp=drivesdk", unit: "Pcs", price: 30000 },
  { name: "Pulpen Gel ( Zhixin-212 )", quantity: 16, photoUrl: "https://drive.google.com/file/d/1rc3XBEj3Ft6TSLiwbiCleouiamLad89w/view?usp=drivesdk", unit: "Pcs", price: 20000 },
  { name: "Pulpen Hitam ( Standart AE7 0.5 )", quantity: 0, photoUrl: "", unit: "Pcs", price: 20000 },
  { name: "Pulpen Merah ( Standart AE7 0.5 )", quantity: 8, photoUrl: "", unit: "Pcs", price: 20000 },
  { name: "Rautan Pencil ( BIG )", quantity: 2, photoUrl: "https://drive.google.com/file/d/10sMIOuwJdHVrnFxpULYieZVBVHGuKu5c/view?usp=drivesdk", unit: "Pcs", price: 2000 },
  { name: "Sapu Lantai", quantity: 0, photoUrl: "https://drive.google.com/file/d/1sHI7FgcNeeGglKEvIe5xDWXNCOQ9wvp-/view?usp=drivesdk", unit: "Pcs", price: 15000 },
  { name: "Sapu Lindi", quantity: 0, photoUrl: "https://drive.google.com/file/d/1Fs4zIdX5oL4Qn_pkZaTJ-bwrTbHC_dhb/view?usp=drivesdk", unit: "Pcs", price: 15000 },
  { name: "Sheet Protector ( BIG Art-5010 F4 )", quantity: 0, photoUrl: "https://drive.google.com/file/d/1vwRTFxibyrqYlJw4uaTGQTq8sVoTJ6SZ/view?usp=drivesdk", unit: "Pack", price: 7000 },
  { name: "Solasi Fragile", quantity: 10, photoUrl: "", unit: "Roll", price: 5000 },
  { name: "Spidol Hitam ( Snowman Marker Permanent Black )", quantity: 0, photoUrl: "https://drive.google.com/file/d/1oDZFoiVVc73EGg6byQBvjCbmZSyxyYkA/view?usp=drivesdk", unit: "Pcs", price: 6000 },
  { name: "Spidol Merah ( Snowman Marker Permanent Red )", quantity: 10, photoUrl: "https://drive.google.com/file/d/10gHXrEQjXCteoZfYl6SOZz0ZAkFpaF5Z/view?usp=drivesdk", unit: "Pcs", price: 6000 },
  { name: "Spidol Putih ( Snowman Marker Permanent White )", quantity: 0, photoUrl: "", unit: "Pcs", price: 6000 },
  { name: "Stabilo ( KENKO HL-100 )", quantity: 6, photoUrl: "https://drive.google.com/file/d/1KNJyEqbXIunPgeq5nnW0eth6AdEOlbt7/view?usp=drivesdk", unit: "Pcs", price: 10000 },
  { name: "Staples Besar ( KENKO HD-50 )", quantity: 5, photoUrl: "", unit: "Pcs", price: 25000 },
  { name: "Staples Kecil ( SDI NO.10 )", quantity: 5, photoUrl: "https://drive.google.com/file/d/1Z6t5yfhpWIEE8ooLS8wdzYQAzsoW0euS/view?usp=drivesdk", unit: "Pcs", price: 10000 },
  { name: "Sticker Barcode ( 50x20mm )", quantity: 5, photoUrl: "", unit: "Roll", price: 0 },
  { name: "Sticker Bulat Hijau ( T&J No 114 )", quantity: 1, photoUrl: "", unit: "Pack", price: 0 },
  { name: "Sticker Bulat Hijau ( T&J No 97 )", quantity: 10, photoUrl: "https://drive.google.com/file/d/1sHGQtPacT2SbDgPi3_GS4RhoLK-ts5Ve/view?usp=drivesdk", unit: "Pack", price: 10000 },
  { name: "Sticker Bulat Kuning ( T&J No 97 )", quantity: 2, photoUrl: "https://drive.google.com/file/d/1Rk45GGVDL3_P5ZcwQuvD6zk-egrMnDmj/view?usp=drivesdk", unit: "Pack", price: 10000 },
  { name: "Sticker Bulat Putih ( T&J No 97 )", quantity: 0, photoUrl: "https://drive.google.com/file/d/1PVNA_HtxqDGd2V4VCQwZSgVU3xSrGcmi/view?usp=drivesdk", unit: "Pack", price: 10000 },
  { name: "Sticker Kotak Label Putih ( T&J No 102 )", quantity: 51, photoUrl: "https://drive.google.com/file/d/1tyMq5yY7vM7jFkrVXabvOpjvIpi42S2B/view?usp=drivesdk", unit: "Pack", price: 0 },
  { name: "Sticky Note ( BIG 76x101mm )", quantity: 9, photoUrl: "https://drive.google.com/file/d/1fcGN3JEUa6N7MrJcs78lS3JtuOSTIBbf/view?usp=drivesdk", unit: "Pack", price: 5000 },
  { name: "Tape Cutter ( JOYKO TD-2S )", quantity: 2, photoUrl: "https://drive.google.com/file/d/1tWIvFbE5Cux_oVREF4POv80Cl_92DIqr/view?usp=drivesdk", unit: "Pcs", price: 20000 },
  { name: "Tempat Pensil", quantity: 3, photoUrl: "https://drive.google.com/file/d/1J2RrspoWhK1B10RdU3AONZOJlXOc7EIG/view?usp=drivesdk", unit: "Pcs", price: 15000 },
  { name: "Tinta Brother BT-5000 (Cyan)", quantity: 2, photoUrl: "https://drive.google.com/file/d/1oAeQJhIJozE_4PYoymkZont1HuHa1WQe/view?usp=drivesdk", unit: "Bottle", price: 95000 },
  { name: "Tinta Brother BT-5000 (Magenta)", quantity: 2, photoUrl: "https://drive.google.com/file/d/1WP7iCfI0N8zlpEqubzqKYa6RXbUohF0R/view?usp=drivesdk", unit: "Bottle", price: 95000 },
  { name: "Tinta Brother BT-5000 (Yellow)", quantity: 2, photoUrl: "https://drive.google.com/file/d/1QpC6TNV9nRPAXQqYOjQ2tal2XmKiTBem/view?usp=drivesdk", unit: "Bottle", price: 95000 },
  { name: "Tinta Brother BT-D60 (Black)", quantity: 2, photoUrl: "https://drive.google.com/file/d/1Z_L9ypLTIvISWySjQmT1REH9JEEEGa1U/view?usp=drivesdk", unit: "Bottle", price: 95000 },
  { name: "Tinta Epson 003 (Black)", quantity: 2, photoUrl: "https://drive.google.com/file/d/1LzFblIkcJqgORYBpx2OvARk1btJVuggp/view?usp=drivesdk", unit: "Bottle", price: 30000 },
  { name: "Tinta Epson 003 (Cyan)", quantity: 3, photoUrl: "https://drive.google.com/file/d/1lz_gXe9def5aimkKdrCjDAVBJa4vRb74/view?usp=drivesdk", unit: "Bottle", price: 30000 },
  { name: "Tinta Epson 003 (Magenta)", quantity: 2, photoUrl: "https://drive.google.com/file/d/1g0C4yPi29iQ8Y6zbioWYhreDj0cMby4Y/view?usp=drivesdk", unit: "Bottle", price: 30000 },
  { name: "Tinta Epson 003 (Yellow)", quantity: 2, photoUrl: "https://drive.google.com/file/d/1FOH4sln1iuv0dcIifWig-v4pNJYxN8LV/view?usp=drivesdk", unit: "Bottle", price: 30000 },
  { name: "Tinta Epson 664 (Black)", quantity: 1, photoUrl: "https://drive.google.com/file/d/1IcS5KHKeW4uyjrszld1h9Dr3y3ZADP1W/view?usp=drivesdk", unit: "Bottle", price: 20000 },
  { name: "Tinta Epson 664 (Cyan)", quantity: 1, photoUrl: "https://drive.google.com/file/d/1wPMSBwE0oXv3WIFRpYZxj8qnfTTvKtI-/view?usp=drivesdk", unit: "Bottle", price: 20000 },
  { name: "Tinta Epson 664 (Magenta)", quantity: 1, photoUrl: "https://drive.google.com/file/d/1cXDHhf-TX7wRrCvm4VIAs46Pe7iJTj9T/view?usp=drivesdk", unit: "Bottle", price: 20000 },
  { name: "Tinta Epson 664 (Yellow)", quantity: 1, photoUrl: "https://drive.google.com/file/d/1xjLw7lvW1DyjkbJ7FLe1-cqHBX4fkQuD/view?usp=drivesdk", unit: "Bottle", price: 20000 },
  { name: "Tinta Epson Lx 310", quantity: 3, photoUrl: "https://drive.google.com/file/d/1tMSKSnN4-su5N2yafTmVRPkRJG607QLa/view?usp=drivesdk", unit: "Cartridge", price: 35000 },
  { name: "Tinta Ribbon ( 110x300m )", quantity: 0, photoUrl: "https://drive.google.com/file/d/1eezKsZEp8ybfZ39g1JSExpC7oMXWdE0o/view?usp=drivesdk", unit: "Roll", price: 35000 },
  { name: "Tissu", quantity: 8, photoUrl: "https://drive.google.com/file/d/1cHpRReJwJaM5amKU6-0fQP4eQneCN_-W/view?usp=drivesdk", unit: "Roll", price: 7500 },
  { name: "Tissue Toilet ( Nice )", quantity: 18, photoUrl: "", unit: "Roll", price: 3000 },
  { name: "WD-40 (120 mL)", quantity: 1, photoUrl: "https://drive.google.com/file/d/1gN3wn9o7XVruTHDGYCenFIBvwMAv3LCZ/view?usp=drivesdk", unit: "Can", price: 45000 },
  { name: "WD-40 (191 mL)", quantity: 0, photoUrl: "", unit: "Can", price: 55000 },
];

const translations = {
    en: {
        title: "Inventory",
        description: "Manage your products and their stock levels.",
        searchPlaceholder: "Search by item name...",
        actions: "Actions",
        importFromCsv: "Import from CSV",
        exportToCsv: "Export to CSV",
        seedDatabase: "Seed Database",
        addItem: "Add Item",
        addNewItem: "Add New Inventory Item",
        addNewItemDesc: "Fill in the details below to add a new product.",
        name: "Name",
        price: "Price",
        unit: "Unit",
        quantity: "Quantity",
        photoUrl: "Photo",
        pasteGdrive: "Or paste https://drive.google.com/...",
        takePhoto: "Take Photo",
        saveItem: "Save Item",
        photo: "Photo",
        status: "Status",
        inStock: "In Stock",
        lowStock: "Low Stock",
        outOfStock: "Out of Stock",
        createPreOrder: "Create Pre-Order",
        edit: "Edit",
        stockIn: "Stock In",
        stockOut: "Stock Out",
        deleteItem: "Delete Item",
        itemPhoto: "Item Photo",
        itemPhotoDesc: "A larger view of the inventory item's photo.",
        editItemTitle: (name: string) => `Edit Item: ${name}`,
        editItemDesc: "Update the details for this item. Changes to quantity will be logged as a transaction.",
        saveChanges: "Save Changes",
        recordStockIn: "Record Stock In",
        recordStockInDesc: "Add new stock received for this item.",
        item: "Item",
        selectItem: "Select an item...",
        from: "From",
        supplierName: "e.g., Supplier Name",
        addStock: "Add Stock",
        recordStockOut: "Record Stock Out",
        recordStockOutDesc: "Record stock that has been sold or used.",
        to: "To",
        customerDept: "e.g., Customer, Department",
        removeStock: "Remove Stock",
        areYouSure: "Are you sure?",
        deleteWarning: (name: string) => `This action cannot be undone. This will permanently delete the item ${name} from your inventory.`,
        cancel: "Cancel",
        delete: "Delete",
        areYouSureSeed: "Are you absolutely sure?",
        seedWarning: "This action cannot be undone. This will permanently delete all current items in your inventory and replace them with the new data set.",
        confirmSeed: "Yes, replace my data",
        cameraTitle: "Take a Photo",
        cameraDesc: "Point your camera at the item and click 'Capture'.",
        capture: "Capture",
        retake: "Retake",
        savePhoto: "Save Photo",
        switchCamera: "Switch Camera",
        importTitle: "Import from CSV",
        importDesc: "Upload a CSV file to add items to the inventory in bulk. The file must have columns: `name`, `price`, `unit`, `quantity`, and optionally `photoUrl`.",
        csvFile: "CSV File",
        importData: "Import Data",
        importing: "Importing...",
        unitRequired: "Unit is required",
        unitRequiredDesc: "Please select a unit for the item.",
        fieldRequired: "Field Required",
        fieldRequiredDesc: "This field cannot be empty.",
        negativeStock: "Stock cannot be negative.",
        accessDenied: "Access Denied",
        accessDeniedDesc: "You do not have permission to view this page. Please contact an administrator if you believe this is an error.",
        firebaseNotConfigured: "Firebase Not Configured",
        firebaseNotConfiguredDesc: "Please configure your Firebase credentials in the environment variables to use this application.",
        unitsFull: {
          "Pcs": "Pcs", "Pack": "Pack", "Box": "Box", "Roll": "Roll", "Rim": "Rim", "Tube": "Tube", "Bottle": "Bottle", "Can": "Can", "Sheet": "Sheet", "Cartridge": "Cartridge"
        }
    },
    id: {
        title: "Inventaris",
        description: "Kelola produk dan tingkat stok Anda.",
        searchPlaceholder: "Cari berdasarkan nama barang...",
        actions: "Aksi",
        importFromCsv: "Impor dari CSV",
        exportToCsv: "Ekspor ke CSV",
        seedDatabase: "Isi Database",
        addItem: "Tambah Barang",
        addNewItem: "Tambah Barang Inventaris Baru",
        addNewItemDesc: "Isi detail di bawah untuk menambahkan produk baru.",
        name: "Nama",
        price: "Harga",
        unit: "Unit",
        quantity: "Jumlah",
        photoUrl: "Foto",
        pasteGdrive: "Atau tempel https://drive.google.com/...",
        takePhoto: "Ambil Foto",
        saveItem: "Simpan Barang",
        photo: "Foto",
        status: "Status",
        inStock: "Stok Tersedia",
        lowStock: "Stok Rendah",
        outOfStock: "Stok Habis",
        createPreOrder: "Buat Pra-Pesan",
        edit: "Ubah",
        stockIn: "Stok Masuk",
        stockOut: "Stok Keluar",
        deleteItem: "Hapus Barang",
        itemPhoto: "Foto Barang",
        itemPhotoDesc: "Tampilan lebih besar dari foto barang inventaris.",
        editItemTitle: (name: string) => `Ubah Barang: ${name}`,
        editItemDesc: "Perbarui detail untuk barang ini. Perubahan jumlah akan dicatat sebagai transaksi.",
        saveChanges: "Simpan Perubahan",
        recordStockIn: "Catat Stok Masuk",
        recordStockInDesc: "Tambahkan stok baru yang diterima untuk suatu barang.",
        item: "Barang",
        selectItem: "Pilih barang...",
        from: "Dari",
        supplierName: "contoh: Nama Pemasok",
        addStock: "Tambah Stok",
        recordStockOut: "Catat Stok Keluar",
        recordStockOutDesc: "Catat stok yang telah terjual atau digunakan.",
        to: "Ke",
        customerDept: "contoh: Pelanggan, Departemen",
        removeStock: "Keluarkan Stok",
        areYouSure: "Apakah Anda yakin?",
        deleteWarning: (name: string) => `Tindakan ini tidak dapat dibatalkan. Ini akan menghapus secara permanen barang ${name} dari inventaris Anda.`,
        cancel: "Batal",
        delete: "Hapus",
        areYouSureSeed: "Apakah Anda benar-benar yakin?",
        seedWarning: "Tindakan ini tidak dapat dibatalkan. Ini akan menghapus secara permanen semua barang saat ini di inventaris Anda dan menggantinya dengan kumpulan data baru.",
        confirmSeed: "Ya, ganti data saya",
        cameraTitle: "Ambil Foto",
        cameraDesc: "Arahkan kamera Anda ke barang dan klik 'Ambil'.",
        capture: "Ambil",
        retake: "Ulangi",
        savePhoto: "Simpan Foto",
        switchCamera: "Ganti Kamera",
        importTitle: "Impor dari CSV",
        importDesc: "Unggah file CSV untuk menambahkan barang ke inventaris secara massal. File harus memiliki kolom: `name`, `price`, `unit`, `quantity`, dan opsional `photoUrl`.",
        csvFile: "File CSV",
        importData: "Impor Data",
        importing: "Mengimpor...",
        unitRequired: "Unit diperlukan",
        unitRequiredDesc: "Silakan pilih unit untuk barang tersebut.",
        fieldRequired: "Kolom Diperlukan",
        fieldRequiredDesc: "Kolom ini tidak boleh kosong.",
        negativeStock: "Stok tidak boleh negatif.",
        accessDenied: "Akses Ditolak",
        accessDeniedDesc: "Anda tidak memiliki izin untuk melihat halaman ini. Silakan hubungi administrator jika Anda yakin ini adalah kesalahan.",
        firebaseNotConfigured: "Firebase Tidak Dikonfigurasi",
        firebaseNotConfiguredDesc: "Harap konfigurasikan kredensial Firebase Anda di variabel lingkungan untuk menggunakan aplikasi ini.",
        unitsFull: {
            "Pcs": "Pcs", "Pack": "Pak", "Box": "Kotak", "Roll": "Gulungan", "Rim": "Rim", "Tube": "Tabung", "Bottle": "Botol", "Can": "Kaleng", "Sheet": "Lembar", "Cartridge": "Kartrid"
        }
    },
    es: {
        title: "Inventario",
        description: "Gestiona tus productos y sus niveles de stock.",
        searchPlaceholder: "Buscar por nombre de artículo...",
        actions: "Acciones",
        importFromCsv: "Importar desde CSV",
        exportToCsv: "Exportar a CSV",
        seedDatabase: "Poblar Base de Datos",
        addItem: "Añadir Artículo",
        addNewItem: "Añadir Nuevo Artículo de Inventario",
        addNewItemDesc: "Rellena los detalles a continuación para añadir un nuevo producto.",
        name: "Nombre",
        price: "Precio",
        unit: "Unidad",
        quantity: "Cantidad",
        photoUrl: "Foto",
        pasteGdrive: "O pega https://drive.google.com/...",
        takePhoto: "Tomar Foto",
        saveItem: "Guardar Artículo",
        photo: "Foto",
        status: "Estado",
        inStock: "En Stock",
        lowStock: "Stock Bajo",
        outOfStock: "Sin Stock",
        createPreOrder: "Crear Pre-Pedido",
        edit: "Editar",
        stockIn: "Entrada de Stock",
        stockOut: "Salida de Stock",
        deleteItem: "Eliminar Artículo",
        itemPhoto: "Foto del Artículo",
        itemPhotoDesc: "Una vista más grande de la foto del artículo de inventario.",
        editItemTitle: (name: string) => `Editar Artículo: ${name}`,
        editItemDesc: "Actualiza los detalles de este artículo. Los cambios en la cantidad se registrarán como una transacción.",
        saveChanges: "Guardar Cambios",
        recordStockIn: "Registrar Entrada de Stock",
        recordStockInDesc: "Añade nuevo stock recibido para este artículo.",
        item: "Artículo",
        selectItem: "Selecciona un artículo...",
        from: "De",
        supplierName: "ej., Nombre del Proveedor",
        addStock: "Añadir Stock",
        recordStockOut: "Registrar Salida de Stock",
        recordStockOutDesc: "Registra el stock que ha sido vendido o utilizado.",
        to: "A",
        customerDept: "ej., Cliente, Departamento",
        removeStock: "Retirar Stock",
        areYouSure: "¿Estás seguro?",
        deleteWarning: (name: string) => `Esta acción no se puede deshacer. Esto eliminará permanentemente el artículo ${name} de tu inventario.`,
        cancel: "Cancelar",
        delete: "Eliminar",
        areYouSureSeed: "¿Estás absolutamente seguro?",
        seedWarning: "Esta acción no se puede deshacer. Esto eliminará permanentemente todos los artículos actuales de tu inventario y los reemplazará con el nuevo conjunto de datos.",
        confirmSeed: "Sí, reemplazar mis datos",
        cameraTitle: "Tomar una Foto",
        cameraDesc: "Apunta tu cámara al artículo y haz clic en 'Capturar'.",
        capture: "Capturar",
        retake: "Retomar",
        savePhoto: "Guardar Foto",
        switchCamera: "Cambiar Cámara",
        importTitle: "Importar desde CSV",
        importDesc: "Sube un archivo CSV para añadir artículos al inventario de forma masiva. El archivo debe tener las columnas: `name`, `price`, `unit`, `quantity`, y opcionalmente `photoUrl`.",
        csvFile: "Archivo CSV",
        importData: "Importar Datos",
        importing: "Importando...",
        unitRequired: "La unidad es requerida",
        unitRequiredDesc: "Por favor, selecciona una unidad para el artículo.",
        fieldRequired: "Campo Requerido",
        fieldRequiredDesc: "Este campo no puede estar vacío.",
        negativeStock: "El stock no puede ser negativo.",
        accessDenied: "Acceso Denegado",
        accessDeniedDesc: "No tienes permiso para ver esta página. Por favor, contacta a un administrador si crees que esto es un error.",
        firebaseNotConfigured: "Firebase No Configurado",
        firebaseNotConfiguredDesc: "Por favor, configura tus credenciales de Firebase en las variables de entorno para usar esta aplicación.",
        unitsFull: {
            "Pcs": "Pzs", "Pack": "Paquete", "Box": "Caja", "Roll": "Rollo", "Rim": "Resma", "Tube": "Tubo", "Bottle": "Botella", "Can": "Lata", "Sheet": "Hoja", "Cartridge": "Cartucho"
        }
    },
    fr: {
        title: "Inventaire",
        description: "Gérez vos produits et leurs niveaux de stock.",
        searchPlaceholder: "Rechercher par nom d'article...",
        actions: "Actions",
        importFromCsv: "Importer depuis CSV",
        exportToCsv: "Exporter vers CSV",
        seedDatabase: "Remplir la Base de Données",
        addItem: "Ajouter un Article",
        addNewItem: "Ajouter un Nouvel Article à l'Inventaire",
        addNewItemDesc: "Remplissez les détails ci-dessous pour ajouter un nouveau produit.",
        name: "Nom",
        price: "Prix",
        unit: "Unité",
        quantity: "Quantité",
        photoUrl: "Photo",
        pasteGdrive: "Ou collez https://drive.google.com/...",
        takePhoto: "Prendre une Photo",
        saveItem: "Enregistrer l'Article",
        photo: "Photo",
        status: "Statut",
        inStock: "En Stock",
        lowStock: "Stock Faible",
        outOfStock: "En Rupture de Stock",
        createPreOrder: "Créer une Pré-Commande",
        edit: "Modifier",
        stockIn: "Entrée de Stock",
        stockOut: "Sortie de Stock",
        deleteItem: "Supprimer l'Article",
        itemPhoto: "Photo de l'Article",
        itemPhotoDesc: "Une vue agrandie de la photo de l'article d'inventaire.",
        editItemTitle: (name: string) => `Modifier l'Article : ${name}`,
        editItemDesc: "Mettez à jour les détails de cet article. Les changements de quantité seront enregistrés comme une transaction.",
        saveChanges: "Enregistrer les Modifications",
        recordStockIn: "Enregistrer une Entrée de Stock",
        recordStockInDesc: "Ajoutez le nouveau stock reçu pour cet article.",
        item: "Article",
        selectItem: "Sélectionnez un article...",
        from: "De",
        supplierName: "ex., Nom du Fournisseur",
        addStock: "Ajouter du Stock",
        recordStockOut: "Enregistrer une Sortie de Stock",
        recordStockOutDesc: "Enregistrez le stock vendu ou utilisé.",
        to: "À",
        customerDept: "ex., Client, Département",
        removeStock: "Retirer du Stock",
        areYouSure: "Êtes-vous sûr ?",
        deleteWarning: (name: string) => `Cette action est irréversible. Elle supprimera définitivement l'article ${name} de votre inventaire.`,
        cancel: "Annuler",
        delete: "Supprimer",
        areYouSureSeed: "Êtes-vous absolutely sûr ?",
        seedWarning: "Cette action est irréversible. Elle supprimera définitivement tous les articles actuels de votre inventaire et les remplacera par le nouvel ensemble de données.",
        confirmSeed: "Oui, remplacer mes données",
        cameraTitle: "Prendre une Photo",
        cameraDesc: "Dirigez votre appareil photo vers l'article et cliquez sur 'Capturer'.",
        capture: "Capturer",
        retake: "Reprendre",
        savePhoto: "Enregistrer la Photo",
        switchCamera: "Changer de Caméra",
        importTitle: "Importer depuis CSV",
        importDesc: "Téléchargez un fichier CSV pour ajouter des articles à l'inventaire en masse. Le fichier doit avoir les colonnes : `name`, `price`, `unit`, `quantity`, et éventuellement `photoUrl`.",
        csvFile: "Fichier CSV",
        importData: "Importer les Données",
        importing: "Importation...",
        unitRequired: "L'unité est requise",
        unitRequiredDesc: "Veuillez sélectionner une unité pour l'article.",
        fieldRequired: "Champ Requis",
        fieldRequiredDesc: "Ce champ ne peut pas être vide.",
        negativeStock: "Le stock ne peut pas être négatif.",
        accessDenied: "Accès Refusé",
        accessDeniedDesc: "Vous n'avez pas la permission de voir cette page. Veuillez contacter un administrateur si vous pensez que c'est une erreur.",
        firebaseNotConfigured: "Firebase Non Configuré",
        firebaseNotConfiguredDesc: "Veuillez configurer vos informations d'identification Firebase dans les variables d'environnement pour utiliser cette application.",
        unitsFull: {
            "Pcs": "Pcs", "Pack": "Paquet", "Box": "Boîte", "Roll": "Rouleau", "Rim": "Rame", "Tube": "Tube", "Bottle": "Bouteille", "Can": "Canette", "Sheet": "Feuille", "Cartridge": "Cartouche"
        }
    },
    de: {
        title: "Inventar",
        description: "Verwalten Sie Ihre Produkte und deren Lagerbestände.",
        searchPlaceholder: "Nach Artikelnamen suchen...",
        actions: "Aktionen",
        importFromCsv: "Aus CSV Importieren",
        exportToCsv: "Nach CSV Exportieren",
        seedDatabase: "Datenbank Befüllen",
        addItem: "Artikel Hinzufügen",
        addNewItem: "Neuen Inventarartikel Hinzufügen",
        addNewItemDesc: "Füllen Sie die folgenden Details aus, um ein neues Produkt hinzuzufügen.",
        name: "Name",
        price: "Preis",
        unit: "Einheit",
        quantity: "Menge",
        photoUrl: "Foto",
        pasteGdrive: "Oder fügen Sie https://drive.google.com/... ein",
        takePhoto: "Foto Machen",
        saveItem: "Artikel Speichern",
        photo: "Foto",
        status: "Status",
        inStock: "Auf Lager",
        lowStock: "Wenig Lagerbestand",
        outOfStock: "Nicht Vorrätig",
        createPreOrder: "Vorbestellung Erstellen",
        edit: "Bearbeiten",
        stockIn: "Wareneingang",
        stockOut: "Warenausgang",
        deleteItem: "Artikel Löschen",
        itemPhoto: "Artikelfoto",
        itemPhotoDesc: "Eine größere Ansicht des Fotos des Inventarartikels.",
        editItemTitle: (name: string) => `Artikel Bearbeiten: ${name}`,
        editItemDesc: "Aktualisieren Sie die Details für diesen Artikel. Mengenänderungen werden als Transaktion protokolliert.",
        saveChanges: "Änderungen Speichern",
        recordStockIn: "Wareneingang Erfassen",
        recordStockInDesc: "Fügen Sie neuen erhaltenen Bestand für diesen Artikel hinzu.",
        item: "Artikel",
        selectItem: "Wählen Sie einen Artikel aus...",
        from: "Von",
        supplierName: "z.B., Lieferantenname",
        addStock: "Bestand Hinzufügen",
        recordStockOut: "Warenausgang Erfassen",
        recordStockOutDesc: "Erfassen Sie verkauften oder verbrauchten Bestand.",
        to: "An",
        customerDept: "z.B., Kunde, Abteilung",
        removeStock: "Bestand Entfernen",
        areYouSure: "Sind Sie sicher?",
        deleteWarning: (name: string) => `Diese Aktion kann nicht rückgängig gemacht werden. Dadurch wird der Artikel ${name} dauerhaft aus Ihrem Inventar gelöscht.`,
        cancel: "Abbrechen",
        delete: "Löschen",
        areYouSureSeed: "Sind Sie absolut sicher?",
        seedWarning: "Diese Aktion kann nicht rückgängig gemacht werden. Dadurch werden alle aktuellen Artikel in Ihrem Inventar dauerhaft gelöscht und durch den neuen Datensatz ersetzt.",
        confirmSeed: "Ja, meine Daten ersetzen",
        cameraTitle: "Ein Foto Machen",
        cameraDesc: "Richten Sie Ihre Kamera auf den Artikel und klicken Sie auf 'Aufnehmen'.",
        capture: "Aufnehmen",
        retake: "Wiederholen",
        savePhoto: "Foto Speichern",
        switchCamera: "Kamera Wechseln",
        importTitle: "Aus CSV Importieren",
        importDesc: "Laden Sie eine CSV-Datei hoch, um Artikel in großen Mengen zum Inventar hinzuzufügen. Die Datei muss die Spalten `name`, `price`, `unit`, `quantity` und optional `photoUrl` enthalten.",
        csvFile: "CSV-Datei",
        importData: "Daten Importieren",
        importing: "Importieren...",
        unitRequired: "Einheit ist erforderlich",
        unitRequiredDesc: "Bitte wählen Sie eine Einheit für den Artikel.",
        fieldRequired: "Feld Erforderlich",
        fieldRequiredDesc: "Dieses Feld darf nicht leer sein.",
        negativeStock: "Der Lagerbestand darf nicht negativ sein.",
        accessDenied: "Zugriff Verweigert",
        accessDeniedDesc: "Sie haben keine Berechtigung, diese Seite anzuzeigen. Bitte kontaktieren Sie einen Administrator, wenn Sie glauben, dass dies ein Fehler ist.",
        firebaseNotConfigured: "Firebase Nicht Konfiguriert",
        firebaseNotConfiguredDesc: "Bitte konfigurieren Sie Ihre Firebase-Anmeldeinformationen in den Umgebungsvariablen, um diese Anwendung zu verwenden.",
        unitsFull: {
            "Pcs": "Stk", "Pack": "Packung", "Box": "Kasten", "Roll": "Rolle", "Rim": "Ries", "Tube": "Tube", "Bottle": "Flasche", "Can": "Dose", "Sheet": "Blatt", "Cartridge": "Patrone"
        }
    },
    ja: {
        title: "在庫",
        description: "製品と在庫レベルを管理します。",
        searchPlaceholder: "品名で検索...",
        actions: "アクション",
        importFromCsv: "CSVからインポート",
        exportToCsv: "CSVへエクスポート",
        seedDatabase: "データベースにデータを投入",
        addItem: "品目を追加",
        addNewItem: "新しい在庫品目を追加",
        addNewItemDesc: "新しい製品を追加するには、以下の詳細を入力してください。",
        name: "名前",
        price: "価格",
        unit: "単位",
        quantity: "数量",
        photoUrl: "写真",
        pasteGdrive: "または https://drive.google.com/... を貼り付け",
        takePhoto: "写真を撮る",
        saveItem: "品目を保存",
        photo: "写真",
        status: "ステータス",
        inStock: "在庫あり",
        lowStock: "在庫僅少",
        outOfStock: "在庫切れ",
        createPreOrder: "予約注文を作成",
        edit: "編集",
        stockIn: "入荷",
        stockOut: "出庫",
        deleteItem: "品目を削除",
        itemPhoto: "品目写真",
        itemPhotoDesc: "在庫品目の写真の拡大表示。",
        editItemTitle: (name: string) => `品目を編集: ${name}`,
        editItemDesc: "この品目の詳細を更新します。数量の変更は取引として記録されます。",
        saveChanges: "変更を保存",
        recordStockIn: "入荷を記録",
        recordStockInDesc: "この品目の新しい入荷を記録します。",
        item: "品目",
        selectItem: "品目を選択...",
        from: "から",
        supplierName: "例：サプライヤー名",
        addStock: "在庫を追加",
        recordStockOut: "出庫を記録",
        recordStockOutDesc: "販売または使用された在庫を記録します。",
        to: "へ",
        customerDept: "例：顧客、部門",
        removeStock: "在庫を削除",
        areYouSure: "よろしいですか？",
        deleteWarning: (name: string) => `この操作は元に戻せません。これにより、品目 ${name} が在庫から完全に削除されます。`,
        cancel: "キャンセル",
        delete: "削除",
        areYouSureSeed: "本当によろしいですか？",
        seedWarning: "この操作は元に戻せません。これにより、現在の在庫のすべての品目が完全に削除され、新しいデータセットに置き換えられます。",
        confirmSeed: "はい、データを置き換えます",
        cameraTitle: "写真を撮る",
        cameraDesc: "カメラを品目に向けて「キャプチャ」をクリックしてください。",
        capture: "キャプチャ",
        retake: "再撮影",
        savePhoto: "写真を保存",
        switchCamera: "カメラを切り替え",
        importTitle: "CSVからインポート",
        importDesc: "CSVファイルをアップロードして、在庫に一括で品目を追加します。ファイルには `name`、`price`、`unit`、`quantity`、およびオプションで `photoUrl` の列が必要です。",
        csvFile: "CSVファイル",
        importData: "データをインポート",
        importing: "インポート中...",
        unitRequired: "単位は必須です",
        unitRequiredDesc: "品目の単位を選択してください。",
        fieldRequired: "必須フィールド",
        fieldRequiredDesc: "このフィールドは空にできません。",
        negativeStock: "在庫はマイナスにできません。",
        accessDenied: "アクセスが拒否されました",
        accessDeniedDesc: "このページを表示する権限がありません。エラーだと思われる場合は、管理者に連絡してください。",
        firebaseNotConfigured: "Firebaseが設定されていません",
        firebaseNotConfiguredDesc: "このアプリケーションを使用するには、環境変数でFirebaseの認証情報を設定してください。",
        unitsFull: {
            "Pcs": "個", "Pack": "パック", "Box": "箱", "Roll": "ロール", "Rim": "連", "Tube": "チューブ", "Bottle": "ボトル", "Can": "缶", "Sheet": "枚", "Cartridge": "カートリッジ"
        }
    },
    ko: {
        title: "재고",
        description: "제품 및 재고 수준을 관리합니다.",
        searchPlaceholder: "품목 이름으로 검색...",
        actions: "작업",
        importFromCsv: "CSV에서 가져오기",
        exportToCsv: "CSV로 내보내기",
        seedDatabase: "데이터베이스 채우기",
        addItem: "품목 추가",
        addNewItem: "새 재고 품목 추가",
        addNewItemDesc: "새 제품을 추가하려면 아래 세부 정보를 입력하세요.",
        name: "이름",
        price: "가격",
        unit: "단위",
        quantity: "수량",
        photoUrl: "사진",
        pasteGdrive: "또는 https://drive.google.com/... 붙여넣기",
        takePhoto: "사진 찍기",
        saveItem: "품목 저장",
        photo: "사진",
        status: "상태",
        inStock: "재고 있음",
        lowStock: "재고 부족",
        outOfStock: "재고 없음",
        createPreOrder: "선주문 생성",
        edit: "편집",
        stockIn: "입고",
        stockOut: "출고",
        deleteItem: "품목 삭제",
        itemPhoto: "품목 사진",
        itemPhotoDesc: "재고 품목 사진의 확대 보기입니다.",
        editItemTitle: (name: string) => `품목 편집: ${name}`,
        editItemDesc: "이 품목의 세부 정보를 업데이트합니다. 수량 변경은 거래로 기록됩니다.",
        saveChanges: "변경 사항 저장",
        recordStockIn: "입고 기록",
        recordStockInDesc: "이 품목에 대해 새로 입고된 재고를 추가합니다.",
        item: "품목",
        selectItem: "품목 선택...",
        from: "보낸 사람",
        supplierName: "예: 공급업체 이름",
        addStock: "재고 추가",
        recordStockOut: "출고 기록",
        recordStockOutDesc: "판매되거나 사용된 재고를 기록합니다.",
        to: "받는 사람",
        customerDept: "예: 고객, 부서",
        removeStock: "재고 제거",
        areYouSure: "확실합니까?",
        deleteWarning: (name: string) => `이 작업은 되돌릴 수 없습니다. 이 작업은 재고에서 품목 ${name}을(를) 영구적으로 삭제합니다.`,
        cancel: "취소",
        delete: "삭제",
        areYouSureSeed: "정말로 확실합니까?",
        seedWarning: "이 작업은 되돌릴 수 없습니다. 이 작업은 현재 재고의 모든 품목을 영구적으로 삭제하고 새 데이터 세트로 교체합니다.",
        confirmSeed: "예, 데이터를 교체합니다",
        cameraTitle: "사진 찍기",
        cameraDesc: "카메라를 품목에 맞추고 '캡처'를 클릭하세요.",
        capture: "캡처",
        retake: "다시 찍기",
        savePhoto: "사진 저장",
        switchCamera: "카메라 전환",
        importTitle: "CSV에서 가져오기",
        importDesc: "CSV 파일을 업로드하여 재고에 품목을 대량으로 추가합니다. 파일에는 `name`, `price`, `unit`, `quantity` 열과 선택적으로 `photoUrl` 열이 있어야 합니다.",
        csvFile: "CSV 파일",
        importData: "데이터 가져오기",
        importing: "가져오는 중...",
        unitRequired: "단위는 필수입니다",
        unitRequiredDesc: "품목의 단위를 선택하세요.",
        fieldRequired: "필수 필드",
        fieldRequiredDesc: "이 필드는 비워 둘 수 없습니다.",
        negativeStock: "재고는 음수가 될 수 없습니다.",
        accessDenied: "접근 거부됨",
        accessDeniedDesc: "이 페이지를 볼 권한이 없습니다. 오류라고 생각되면 관리자에게 문의하십시오.",
        firebaseNotConfigured: "Firebase가 구성되지 않았습니다",
        firebaseNotConfiguredDesc: "이 애플리케이션을 사용하려면 환경 변수에서 Firebase 자격 증명을 구성하세요.",
        unitsFull: {
            "Pcs": "개", "Pack": "팩", "Box": "상자", "Roll": "롤", "Rim": "연", "Tube": "튜브", "Bottle": "병", "Can": "캔", "Sheet": "장", "Cartridge": "카트리지"
        }
    },
    'zh-CN': {
        title: "库存",
        description: "管理您的产品及其库存水平。",
        searchPlaceholder: "按物品名称搜索...",
        actions: "操作",
        importFromCsv: "从CSV导入",
        exportToCsv: "导出为CSV",
        seedDatabase: "填充数据库",
        addItem: "添加物品",
        addNewItem: "添加新库存物品",
        addNewItemDesc: "填写以下详细信息以添加新产品。",
        name: "名称",
        price: "价格",
        unit: "单位",
        quantity: "数量",
        photoUrl: "照片",
        pasteGdrive: "或粘贴 https://drive.google.com/...",
        takePhoto: "拍照",
        saveItem: "保存物品",
        photo: "照片",
        status: "状态",
        inStock: "有货",
        lowStock: "低库存",
        outOfStock: "缺货",
        createPreOrder: "创建预购单",
        edit: "编辑",
        stockIn: "入库",
        stockOut: "出库",
        deleteItem: "删除物品",
        itemPhoto: "物品照片",
        itemPhotoDesc: "库存物品照片的放大视图。",
        editItemTitle: (name: string) => `编辑物品：${name}`,
        editItemDesc: "更新此物品的详细信息。数量的更改将作为交易记录。",
        saveChanges: "保存更改",
        recordStockIn: "记录入库",
        recordStockInDesc: "为此物品添加入库的新库存。",
        item: "物品",
        selectItem: "选择一个物品...",
        from: "从",
        supplierName: "例如，供应商名称",
        addStock: "添加入库",
        recordStockOut: "记录出库",
        recordStockOutDesc: "记录已售出或已使用的库存。",
        to: "至",
        customerDept: "例如，客户、部门",
        removeStock: "移除库存",
        areYouSure: "您确定吗？",
        deleteWarning: (name: string) => `此操作无法撤销。这将永久删除您库存中的物品 ${name}。`,
        cancel: "取消",
        delete: "删除",
        areYouSureSeed: "您确定要这样做吗？",
        seedWarning: "此操作无法撤销。这将永久删除您库存中的所有当前物品，并用新的数据集替换它们。",
        confirmSeed: "是的，替换我的数据",
        cameraTitle: "拍照",
        cameraDesc: "将您的相机对准物品，然后单击“拍摄”。",
        capture: "拍摄",
        retake: "重拍",
        savePhoto: "保存照片",
        switchCamera: "切换相机",
        importTitle: "从CSV导入",
        importDesc: "上传CSV文件以批量向库存中添加物品。文件必须包含列：`name`、`price`、`unit`、`quantity`，以及可选的`photoUrl`。",
        csvFile: "CSV文件",
        importData: "导入数据",
        importing: "正在导入...",
        unitRequired: "单位是必需的",
        unitRequiredDesc: "请为物品选择一个单位。",
        fieldRequired: "必填字段",
        fieldRequiredDesc: "此字段不能为空。",
        negativeStock: "库存不能为负。",
        accessDenied: "访问被拒绝",
        accessDeniedDesc: "您无权查看此页面。如果您认为这是错误，请联系管理员。",
        firebaseNotConfigured: "Firebase未配置",
        firebaseNotConfiguredDesc: "请在环境变量中配置您的Firebase凭据以使用此应用程序。",
        unitsFull: {
            "Pcs": "件", "Pack": "包", "Box": "盒", "Roll": "卷", "Rim": "令", "Tube": "管", "Bottle": "瓶", "Can": "罐", "Sheet": "张", "Cartridge": "墨盒"
        }
    }
};


export default function InventoryPage() {
  const [items, setItems] = React.useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isAddOpen, setAddOpen] = React.useState(false);
  const [isImportOpen, setImportOpen] = React.useState(false);
  const [isStockInOpen, setStockInOpen] = React.useState(false);
  const [isStockOutOpen, setStockOutOpen] = React.useState(false);
  const [isEditItemOpen, setEditItemOpen] = React.useState(false);
  const [isDeleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<InventoryItem | null>(null);
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [selectedUnit, setSelectedUnit] = React.useState<string | undefined>();
  const [isPhotoOpen, setPhotoOpen] = React.useState(false);
  const [photoToShow, setPhotoToShow] = React.useState<string | null>(null);
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [layout, setLayout] = React.useState<'list' | 'grid'>('list');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { user, loading: authLoading } = useAuth();
  const { language } = useTheme();

  const t = translations[language] || translations.en;

  const getUnitText = (unit: string) => {
    return t.unitsFull[unit as keyof typeof t.unitsFull] || unit;
  }

  // States for camera functionality
  const [isCameraOpen, setCameraOpen] = React.useState(false);
  const [hasCameraPermission, setHasCameraPermission] = React.useState(true);
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = React.useState("");
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [videoDevices, setVideoDevices] = React.useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = React.useState<string | undefined>(undefined);
  
  // State for CSV import
  const [csvFile, setCsvFile] = React.useState<File | null>(null);
  const [isImporting, setIsImporting] = React.useState(false);
  
  // State for seeding
  const [isSeedConfirmOpen, setSeedConfirmOpen] = React.useState(false);
  const [isSeeding, setIsSeeding] = React.useState(false);
  
  // State for combobox
  const [comboOpen, setComboOpen] = React.useState(false)
  const [comboOutOpen, setComboOutOpen] = React.useState(false)
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);
  const [selectedItemName, setSelectedItemName] = React.useState<string>(t.selectItem);


  React.useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, "inventory"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const inventoryItems: InventoryItem[] = [];
      querySnapshot.forEach((doc) => {
        inventoryItems.push({ id: doc.id, ...doc.data() } as InventoryItem);
      });
      setItems(inventoryItems);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching inventory:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch inventory items.",
      });
      setLoading(false);
    });

    return () => {
      unsubscribe();
    }
  }, [toast]);
  
  React.useEffect(() => {
    if(isEditItemOpen && selectedItem) {
      setPhotoUrl(selectedItem.photoUrl || "");
    } else {
      setPhotoUrl("");
    }
  }, [isEditItemOpen, selectedItem]);
  
   React.useEffect(() => {
    setSelectedItemName(t.selectItem);
  }, [t.selectItem]);
  

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db) return;
    const formData = new FormData(e.currentTarget);
    const newItemData = {
      name: formData.get("name") as string,
      price: Number(formData.get("price")),
      unit: selectedUnit,
      quantity: Number(formData.get("quantity")),
      photoUrl: photoUrl || undefined,
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
        type: 'add',
        quantity: newItemData.quantity,
    });

    addNotification({
      title: "Item Added",
      description: `${newItemData.name} has been added to inventory.`,
      icon: PlusCircle,
    });

    setAddOpen(false);
    setSelectedUnit(undefined);
    setPhotoUrl("");
    (e.target as HTMLFormElement).reset();
  };
  
   const handleEditItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedItem || !db) return;

    const formData = new FormData(e.currentTarget);
    const updatedQuantity = Number(formData.get("quantity"));
    const originalQuantity = selectedItem.quantity;
    
    const updatedItemData = {
      name: formData.get("name") as string,
      price: Number(formData.get("price")),
      unit: selectedUnit || selectedItem.unit,
      photoUrl: photoUrl || selectedItem.photoUrl,
      quantity: updatedQuantity,
    };

    if (updatedQuantity < 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: t.negativeStock,
      });
      return;
    }

    const itemRef = doc(db, "inventory", selectedItem.id);
    await updateDoc(itemRef, updatedItemData);

    if (originalQuantity !== updatedQuantity) {
        manageTransaction({
          itemId: selectedItem.id,
          itemName: updatedItemData.name,
          type: 'edit',
          quantity: updatedQuantity,
        });
    }

    addNotification({
      title: "Item Updated",
      description: `${updatedItemData.name} has been updated.`,
      icon: Pencil,
    });
    setEditItemOpen(false);
    setSelectedItem(null);
    setSelectedUnit(undefined);
    setPhotoUrl("");
  };

  const handleStockUpdate = (type: "in" | "out") => async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!db || isSubmitting) return;

      setIsSubmitting(true);
      
      try {
        const selectedItemToUpdate = items.find(i => i.id === selectedItemId);
        if (!selectedItemToUpdate) {
          toast({ variant: "destructive", title: "Please select an item." });
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

        const itemRef = doc(db, "inventory", selectedItemToUpdate.id);
        const newQuantity = type === "in" ? selectedItemToUpdate.quantity + quantity : selectedItemToUpdate.quantity - quantity;

        if (newQuantity < 0) {
          toast({
            variant: "destructive",
            title: "Error",
            description: t.negativeStock,
          });
          return;
        }
        
        await updateDoc(itemRef, { quantity: newQuantity });
        await manageTransaction({ itemId: selectedItemToUpdate.id, itemName: selectedItemToUpdate.name, type, quantity, person });
        
        addNotification({
          title: "Stock Updated",
          description: `Quantity for ${selectedItemToUpdate.name} updated.`,
          icon: type === "in" ? ArrowDownCircle : ArrowUpCircle,
        });
        
        if (type === 'in') setStockInOpen(false);
        else setStockOutOpen(false);
        
        setSelectedItemId(null);
        setSelectedItemName(t.selectItem);
      } catch (error) {
        console.error("Error updating stock:", error);
        toast({ variant: "destructive", title: "Failed to update stock" });
      } finally {
        setIsSubmitting(false);
      }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem || !db) return;

    await deleteDoc(doc(db, "inventory", selectedItem.id));
    
    manageTransaction({
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        type: 'delete',
        quantity: selectedItem.quantity,
    });

    addNotification({
        title: "Item Deleted",
        description: `${selectedItem.name} has been removed from inventory.`,
        icon: Trash2,
    });
    setDeleteOpen(false);
    setSelectedItem(null);
  }
  
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
            const newItems = results.data as (Omit<InventoryItem, 'id'> & { price: string, quantity: string })[];

            if (!newItems || newItems.length === 0) {
                toast({ variant: "destructive", title: "CSV is empty or invalid" });
                setIsImporting(false);
                return;
            }

            try {
                const batch = writeBatch(db);
                newItems.forEach(item => {
                    if (typeof item !== 'object' || item === null || !item.name) {
                      return; // Skip empty or invalid rows
                    }
                    const docRef = doc(collection(db, "inventory"));
                    
                    const newItemData = {
                        name: item.name || "",
                        price: Number(item.price) || 0,
                        unit: item.unit || "Pcs",
                        quantity: Number(item.quantity) || 0,
                        photoUrl: item.photoUrl || undefined,
                    };

                    batch.set(docRef, newItemData);
                });

                await batch.commit();

                addNotification({
                    title: "Import Successful",
                    description: `${newItems.filter(item => typeof item === 'object' && item !== null && item.name).length} items have been added.`,
                    icon: Upload,
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

  const handleExportCsv = () => {
    if (items.length === 0) {
        toast({ variant: "destructive", title: "No items to export" });
        return;
    }

    const dataToExport = items.map(({ id, ...rest }) => rest);
    const csv = Papa.unparse(dataToExport);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "inventory-export.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };


  const handleCreatePreOrder = (item: InventoryItem) => {
    router.push(`/pre-orders?create=true&itemId=${item.id}`);
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getDisplayImage = (url: string | undefined | null) => {
    if (!url) return { src: "https://placehold.co/600x400.png", isPlaceholder: true };
    if (url.startsWith("data:image")) return { src: url, isPlaceholder: false };
    const gdriveSrc = getGoogleDriveImageSrc(url);
    return gdriveSrc ? { src: gdriveSrc, isPlaceholder: false } : { src: "https://placehold.co/600x400.png", isPlaceholder: true };
  };


  const handlePhotoClick = (item: InventoryItem) => {
    const { src: imageUrl } = getDisplayImage(item.photoUrl);
    if (imageUrl) {
        setPhotoToShow(imageUrl);
        setSelectedItem(item);
        setPhotoOpen(true);
    }
  };
  
  const stopVideoStream = React.useCallback(() => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
  }, []);
  
  const startVideoStream = React.useCallback(async (deviceId?: string) => {
    stopVideoStream();
    try {
        const constraints = { video: { deviceId: deviceId ? { exact: deviceId } : undefined } };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputDevices = devices.filter(device => device.kind === 'videoinput');
        setVideoDevices(videoInputDevices);

        if(!deviceId && videoInputDevices.length > 0) {
            setCurrentDeviceId(videoInputDevices[0].deviceId);
        }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings to use this app.',
      });
    }
  }, [stopVideoStream, toast]);
  

  React.useEffect(() => {
    if (isCameraOpen) {
      startVideoStream(currentDeviceId);
    } else {
      stopVideoStream();
    }
    
    return () => stopVideoStream();
  }, [isCameraOpen, currentDeviceId, startVideoStream, stopVideoStream]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUri);
      }
    }
  };
  
  const handleSavePhoto = () => {
    if (capturedImage) {
      setPhotoUrl(capturedImage);
      setCameraOpen(false);
      setCapturedImage(null);
    }
  };
  
  const handleSwitchCamera = () => {
      if(videoDevices.length > 1) {
          const currentIndex = videoDevices.findIndex(device => device.deviceId === currentDeviceId);
          const nextIndex = (currentIndex + 1) % videoDevices.length;
          setCurrentDeviceId(videoDevices[nextIndex].deviceId);
      }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }

  const handleSeedDatabase = async () => {
    if (!db) return;
    setIsSeeding(true);
    try {
      // 1. Delete all existing documents
      const inventoryCollection = collection(db, "inventory");
      const existingDocsSnapshot = await getDocs(inventoryCollection);
      const deleteBatch = writeBatch(db);
      existingDocsSnapshot.forEach(doc => {
        deleteBatch.delete(doc.ref);
      });
      await deleteBatch.commit();
      
      addNotification({ title: "Inventory Cleared", description: "Cleared existing inventory...", icon: Database });

      // 2. Add all new documents
      const addBatch = writeBatch(db);
      seedData.forEach(item => {
        const docRef = doc(inventoryCollection);
        addBatch.set(docRef, item);
      });
      await addBatch.commit();

      addNotification({
        title: "Database Seeded",
        description: `${seedData.length} new items have been added.`,
        icon: Database,
      });

    } catch (error) {
      console.error("Error seeding database:", error);
      toast({
        variant: "destructive",
        title: "Database Seeding Failed",
        description: "Could not write data to the database. Check console for details.",
      });
    } finally {
      setIsSeeding(false);
      setSeedConfirmOpen(false);
    }
  };
  
  const selectedItemForStockOut = items.find(i => i.id === selectedItemId);
  const isHrdUser = user && user.email === 'krezthrd@gmail.com';

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
        <div className="flex flex-col md:flex-row w-full md:w-auto md:items-center gap-2">
           <div className="relative flex-grow w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t.searchPlaceholder}
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <ToggleGroup type="single" value={layout} onValueChange={(value: 'list' | 'grid') => value && setLayout(value)} variant="outline">
                <ToggleGroupItem value="list" aria-label="List view">
                <List className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="grid" aria-label="Grid view">
                <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
            </ToggleGroup>
            
            <div className="hidden md:flex flex-grow items-center gap-2">
                {!isHrdUser && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full md:w-auto">
                        {t.actions}
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setImportOpen(true)}>
                        <Upload className="mr-2 h-4 w-4" />
                        {t.importFromCsv}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleExportCsv}>
                        <Download className="mr-2 h-4 w-4" />
                        {t.exportToCsv}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setSeedConfirmOpen(true)} className="text-red-600 focus:text-red-700">
                        <Database className="mr-2 h-4 w-4" />
                        {t.seedDatabase}
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                )}
                {!isHrdUser && (
                <Dialog open={isAddOpen} onOpenChange={(isOpen) => { setAddOpen(isOpen); if (!isOpen) setPhotoUrl(""); }}>
                    <DialogTrigger asChild>
                    <Button className="w-full md:w-auto">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {t.addItem}
                    </Button>
                    </DialogTrigger>
                    <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t.addNewItem}</DialogTitle>
                        <DialogDescription>
                        {t.addNewItemDesc}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddItem} className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">{t.name}</Label>
                        <Input id="name" name="name" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">{t.price}</Label>
                        <Input id="price" name="price" type="number" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="unit" className="text-right">{t.unit}</Label>
                        <Select name="unit" required onValueChange={setSelectedUnit}>
                            <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a unit" />
                            </SelectTrigger>
                            <SelectContent>
                            {Object.entries(t.unitsFull).map(([key, value]) => (
                                <SelectItem key={key} value={key}>{value}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quantity" className="text-right">{t.quantity}</Label>
                        <Input id="quantity" name="quantity" type="number" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="photoUrl" className="text-right">{t.photoUrl}</Label>
                        <div className="col-span-3 flex items-center gap-2">
                            <Input 
                                id="photoUrl" 
                                name="photoUrl" 
                                type="text" 
                                placeholder={t.pasteGdrive} 
                                className="flex-grow"
                                value={photoUrl}
                                onChange={(e) => setPhotoUrl(e.target.value)}
                            />
                            <Button type="button" size="icon" variant="outline" onClick={() => setCameraOpen(true)}>
                                <Camera className="h-4 w-4" />
                                <span className="sr-only">{t.takePhoto}</span>
                            </Button>
                        </div>
                        </div>
                        <DialogFooter>
                        <Button type="submit">{t.saveItem}</Button>
                        </DialogFooter>
                    </form>
                    </DialogContent>
                </Dialog>
                )}
            </div>

            <div className="flex md:hidden flex-grow items-center gap-2">
                {!isHrdUser && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex-1">
                        {t.actions}
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)]">
                    <DropdownMenuItem onSelect={() => setImportOpen(true)}>
                        <Upload className="mr-2 h-4 w-4" />
                        {t.importFromCsv}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleExportCsv}>
                        <Download className="mr-2 h-4 w-4" />
                        {t.exportToCsv}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setSeedConfirmOpen(true)} className="text-red-600 focus:text-red-700">
                        <Database className="mr-2 h-4 w-4" />
                        {t.seedDatabase}
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                )}
                {!isHrdUser && (
                <Dialog open={isAddOpen} onOpenChange={(isOpen) => { setAddOpen(isOpen); if (!isOpen) setPhotoUrl(""); }}>
                    <DialogTrigger asChild>
                    <Button className="flex-1">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {t.addItem}
                    </Button>
                    </DialogTrigger>
                    <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t.addNewItem}</DialogTitle>
                        <DialogDescription>
                        {t.addNewItemDesc}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddItem} className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">{t.name}</Label>
                        <Input id="name" name="name" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">{t.price}</Label>
                        <Input id="price" name="price" type="number" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="unit" className="text-right">{t.unit}</Label>
                        <Select name="unit" required onValueChange={setSelectedUnit}>
                            <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a unit" />
                            </SelectTrigger>
                            <SelectContent>
                            {Object.entries(t.unitsFull).map(([key, value]) => (
                                <SelectItem key={key} value={key}>{value}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quantity" className="text-right">{t.quantity}</Label>
                        <Input id="quantity" name="quantity" type="number" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="photoUrl" className="text-right">{t.photoUrl}</Label>
                        <div className="col-span-3 flex items-center gap-2">
                            <Input 
                                id="photoUrl" 
                                name="photoUrl" 
                                type="text" 
                                placeholder={t.pasteGdrive} 
                                className="flex-grow"
                                value={photoUrl}
                                onChange={(e) => setPhotoUrl(e.target.value)}
                            />
                            <Button type="button" size="icon" variant="outline" onClick={() => setCameraOpen(true)}>
                                <Camera className="h-4 w-4" />
                                <span className="sr-only">{t.takePhoto}</span>
                            </Button>
                        </div>
                        </div>
                        <DialogFooter>
                        <Button type="submit">{t.saveItem}</Button>
                        </DialogFooter>
                    </form>
                    </DialogContent>
                </Dialog>
                )}
            </div>
          </div>
          <Dialog open={isImportOpen} onOpenChange={setImportOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.importTitle}</DialogTitle>
                <DialogDescription>
                  {t.importDesc}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  <Label htmlFor="csv-file">{t.csvFile}</Label>
                  <Input 
                    id="csv-file" 
                    type="file" 
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files ? e.target.files[0] : null)}
                  />
              </div>
              <DialogFooter>
                <Button onClick={handleImportCsv} disabled={!csvFile || isImporting}>
                  {isImporting ? t.importing : t.importData}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>
      
      {layout === 'list' ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] hidden sm:table-cell">{t.photo}</TableHead>
                    <TableHead>{t.name}</TableHead>
                    <TableHead>{t.price}</TableHead>
                    <TableHead className="hidden md:table-cell">{t.unit}</TableHead>
                    <TableHead className="text-center">{t.status}</TableHead>
                    <TableHead className="text-right">{t.quantity}</TableHead>
                    <TableHead>
                      <span className="sr-only">{t.actions}</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const { src, isPlaceholder } = getDisplayImage(item.photoUrl);
                    return (
                    <TableRow key={item.id}>
                      <TableCell className="hidden sm:table-cell">
                        <div className="cursor-pointer" onClick={() => handlePhotoClick(item)}>
                          <Image
                            alt={item.name}
                            className="aspect-square rounded-md object-cover"
                            height="64"
                            src={src}
                            width="64"
                            unoptimized={!isPlaceholder}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{formatCurrency(item.price || 0)}</TableCell>
                      <TableCell className="hidden md:table-cell">{getUnitText(item.unit)}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={item.quantity > 5 ? "outline" : item.quantity > 0 ? "warning" : "destructive"}
                           className={
                            item.quantity > 5 ? 'border-green-600 text-green-600' : 
                            item.quantity > 0 ? 'bg-orange-100 text-orange-800' : 
                            'bg-red-100 text-red-800'
                          }
                        >
                          {item.quantity > 5 ? t.inStock : item.quantity > 0 ? t.lowStock : t.outOfStock}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell>
                         {!isHrdUser && (
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{t.actions}</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={() => handleCreatePreOrder(item)}>
                                <ShoppingCart className="mr-2 h-4 w-4" /> {t.createPreOrder}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                onSelect={() => {
                                    setSelectedItem(item);
                                    setEditItemOpen(true);
                                }}
                                >
                                <Pencil className="mr-2 h-4 w-4" /> {t.edit}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                onSelect={() => {
                                    setSelectedItemId(item.id);
                                    setSelectedItemName(item.name);
                                    setStockInOpen(true);
                                }}
                                >
                                <ArrowDownCircle className="mr-2 h-4 w-4" /> {t.stockIn}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                onSelect={() => {
                                    setSelectedItemId(item.id);
                                    setSelectedItemName(item.name);
                                    setStockOutOpen(true);
                                }}
                                >
                                <ArrowUpCircle className="mr-2 h-4 w-4" /> {t.stockOut}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                className="text-red-600 focus:text-red-700"
                                onSelect={() => {
                                    setSelectedItem(item);
                                    setDeleteOpen(true);
                                }}
                                >
                                <Trash2 className="mr-2 h-4 w-4" /> {t.deleteItem}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                         )}
                      </TableCell>
                    </TableRow>
                  )})}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredItems.map((item) => {
             const { src, isPlaceholder } = getDisplayImage(item.photoUrl);
             return (
              <Card key={item.id} className="flex flex-col">
                <CardHeader className="p-0">
                  <div className="relative">
                    <div className="cursor-pointer" onClick={() => handlePhotoClick(item)}>
                      <Image
                          alt={item.name}
                          className="aspect-video w-full rounded-t-lg object-cover"
                          height={180}
                          src={src}
                          width={320}
                          unoptimized={!isPlaceholder}
                        />
                    </div>
                    {!isHrdUser && (
                        <div className="absolute top-2 right-2">
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{t.actions}</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={() => handleCreatePreOrder(item)}>
                                <ShoppingCart className="mr-2 h-4 w-4" /> {t.createPreOrder}
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => { setSelectedItem(item); setEditItemOpen(true); }}>
                                <Pencil className="mr-2 h-4 w-4" /> {t.edit}
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => { setSelectedItemId(item.id); setSelectedItemName(item.name); setStockInOpen(true); }}>
                                <ArrowDownCircle className="mr-2 h-4 w-4" /> {t.stockIn}
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => { setSelectedItemId(item.id); setSelectedItemName(item.name); setStockOutOpen(true); }}>
                                <ArrowUpCircle className="mr-2 h-4 w-4" /> {t.stockOut}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600 focus:text-red-700" onSelect={() => { setSelectedItem(item); setDeleteOpen(true); }}>
                                <Trash2 className="mr-2 h-4 w-4" /> {t.deleteItem}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex-1">
                    <h3 className="font-semibold text-lg truncate" title={item.name}>{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{formatCurrency(item.price || 0)}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between items-center">
                    <Badge
                      variant={item.quantity > 5 ? "outline" : item.quantity > 0 ? "warning" : "destructive"}
                      className={
                        item.quantity > 5 ? 'border-green-600 text-green-600' : 
                        item.quantity > 0 ? 'bg-orange-100 text-orange-800' : 
                        'bg-red-100 text-red-800'
                      }
                    >
                      {item.quantity > 5 ? t.inStock : item.quantity > 0 ? t.lowStock : t.outOfStock}
                    </Badge>
                     <div className="text-right">
                        <p className="font-bold text-lg">{item.quantity}</p>
                        <p className="text-xs text-muted-foreground -mt-1">{getUnitText(item.unit)}</p>
                    </div>
                </CardFooter>
              </Card>
             )
          })}
        </div>
      )}
      
      {/* Photo Viewer Dialog */}
      <Dialog open={isPhotoOpen} onOpenChange={setPhotoOpen}>
        <DialogContent className="max-w-xs sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="hidden sm:block">{t.itemPhoto}</DialogTitle>
            <DialogDescription className="hidden sm:block">
             {t.itemPhotoDesc}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
              {photoToShow && (
                <div className="relative aspect-square w-full">
                    <Image
                    src={photoToShow}
                    alt={selectedItem?.name || 'Enlarged inventory item'}
                    fill
                    className="rounded-lg object-contain"
                    unoptimized={photoToShow.includes('googleusercontent')}
                    />
                </div>
              )}
              {selectedItem && (
                  <div className="sm:hidden flex flex-col gap-2 p-2 rounded-lg bg-muted/50">
                      <h3 className="font-bold text-lg">{selectedItem.name}</h3>
                      <div className="flex justify-between items-center text-sm">
                          <p className="text-muted-foreground">{t.price}</p>
                          <p className="font-semibold">{formatCurrency(selectedItem.price)}</p>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                          <p className="text-muted-foreground">{t.quantity}</p>
                          <p className="font-semibold">{selectedItem.quantity} {getUnitText(selectedItem.unit)}</p>
                      </div>
                  </div>
              )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Item Dialog */}
      <Dialog open={isEditItemOpen} onOpenChange={setEditItemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.editItemTitle(selectedItem?.name || '')}</DialogTitle>
            <DialogDescription>
             {t.editItemDesc}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditItem} className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">{t.name}</Label>
              <Input id="name" name="name" className="col-span-3" defaultValue={selectedItem?.name} required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">{t.price}</Label>
              <Input id="price" name="price" type="number" className="col-span-3" defaultValue={selectedItem?.price} required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">{t.unit}</Label>
              <Select name="unit" defaultValue={selectedItem?.unit} onValueChange={setSelectedUnit}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(t.unitsFull).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="photoUrl" className="text-right">{t.photoUrl}</Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input 
                  id="photoUrl" 
                  name="photoUrl" 
                  type="text" 
                  placeholder={t.pasteGdrive}
                  className="flex-grow" 
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                />
                 <Button type="button" size="icon" variant="outline" onClick={() => setCameraOpen(true)}>
                    <Camera className="h-4 w-4" />
                    <span className="sr-only">{t.takePhoto}</span>
                  </Button>
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
                defaultValue={selectedItem?.quantity}
                required
                min="0"
              />
            </div>
            <DialogFooter>
              <Button type="submit">{t.saveChanges}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>


      {/* Stock In Dialog */}
      <Dialog open={isStockInOpen} onOpenChange={(isOpen) => { if(!isOpen) { setSelectedItemId(null); setSelectedItemName(t.selectItem); } setStockInOpen(isOpen); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.recordStockIn}</DialogTitle>
            <DialogDescription>
              {t.recordStockInDesc}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStockUpdate("in")} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="item" className="text-right">{t.item}</Label>
              <div className="col-span-3">
                <Popover open={comboOpen} onOpenChange={setComboOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={comboOpen}
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
                            {items.map((item) => (
                              <CommandItem
                                key={item.id}
                                value={item.name}
                                onSelect={(currentValue) => {
                                  setSelectedItemId(item.id)
                                  setSelectedItemName(item.name)
                                  setComboOpen(false)
                                }}
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
              <Label htmlFor="quantity" className="text-right">{t.quantity}</Label>
              <Input id="quantity" name="quantity" type="number" className="col-span-3" required min="1" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="person" className="text-right">{t.from}</Label>
              <Input id="person" name="person" placeholder={t.supplierName} className="col-span-3" />
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

      {/* Stock Out Dialog */}
      <Dialog open={isStockOutOpen} onOpenChange={(isOpen) => { if(!isOpen) { setSelectedItemId(null); setSelectedItemName(t.selectItem); } setStockOutOpen(isOpen); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.recordStockOut}</DialogTitle>
            <DialogDescription>
              {t.recordStockOutDesc}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStockUpdate("out")} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="item" className="text-right">{t.item}</Label>
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
                                {items.map((item) => (
                                <CommandItem
                                    key={item.id}
                                    value={item.name}
                                    onSelect={(currentValue) => {
                                      setSelectedItemId(item.id)
                                      setSelectedItemName(item.name)
                                      setComboOutOpen(false)
                                    }}
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
              <Label htmlFor="quantity" className="text-right">{t.quantity}</Label>
              <Input id="quantity" name="quantity" type="number" className="col-span-3" required min="1" max={selectedItemForStockOut?.quantity} />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="person" className="text-right">{t.to}</Label>
              <Input id="person" name="person" placeholder={t.customerDept} className="col-span-3" required />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.removeStock}
              </Button>
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
              {t.deleteWarning(selectedItem?.name || '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedItem(null)}>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem}>
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Seeding Confirmation Dialog */}
       <AlertDialog open={isSeedConfirmOpen} onOpenChange={setSeedConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.areYouSureSeed}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.seedWarning}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleSeedDatabase}>
              {t.confirmSeed}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Camera Capture Dialog */}
      <Dialog open={isCameraOpen} onOpenChange={(isOpen) => { setCameraOpen(isOpen); setCapturedImage(null); }}>
          <DialogContent className="max-w-2xl">
              <DialogHeader>
                  <DialogTitle>{t.cameraTitle}</DialogTitle>
                  <DialogDescription>
                      {t.cameraDesc}
                  </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4">
                  { !hasCameraPermission && (
                      <Alert variant="destructive">
                          <AlertTitle>Camera Access Required</AlertTitle>
                          <AlertDescription>
                              Please allow camera access in your browser to use this feature.
                          </AlertDescription>
                      </Alert>
                  )}
                  <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden">
                      <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                      <canvas ref={canvasRef} className="hidden" />
                      {capturedImage && <Image src={capturedImage} alt="Captured image" fill className="object-cover" />}
                  </div>
              </div>
              <DialogFooter>
                  {capturedImage ? (
                      <>
                          <Button variant="outline" onClick={() => setCapturedImage(null)}>{t.retake}</Button>
                          <Button onClick={handleSavePhoto}>{t.savePhoto}</Button>
                      </>
                  ) : (
                    <div className="flex justify-center items-center w-full relative">
                        <Button onClick={handleCapture} disabled={!hasCameraPermission}>{t.capture}</Button>
                        {videoDevices.length > 1 && (
                          <Button variant="outline" size="icon" onClick={handleSwitchCamera} disabled={!hasCameraPermission} className="absolute right-0">
                            <SwitchCamera className="h-4 w-4" />
                            <span className="sr-only">{t.switchCamera}</span>
                          </Button>
                        )}
                    </div>
                  )}
              </DialogFooter>
          </DialogContent>
      </Dialog>
      
    </div>
  );
}


    
