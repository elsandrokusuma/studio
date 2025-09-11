
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
  { name: "Gunting Besar ( Ideal 8.5\" )", quantity: 2, photoUrl: "https://drive.google.com/file/d/1TpOLDdp6zV6PNAiuNepFa7BTGVrFM4my/view?usp=drivesdk", unit: "Pcs", price: 10000 },
  { name: "Gunting Kecil ( Ideal 4.5\" )", quantity: 0, photoUrl: "https://drive.google.com/file/d/1x-lSgsKwFyPk2OP3xlSagQ_pRMD_1vQ8/view?usp=drivesdk", unit: "Pcs", price: 4000 },
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
  const [selectedItemName, setSelectedItemName] = React.useState<string>("Select an item...");


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
  

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db) return;
    const formData = new FormData(e.currentTarget);
    const newItemData = {
      name: formData.get("name") as string,
      price: Number(formData.get("price")),
      unit: selectedUnit || (formData.get("unit") as string),
      quantity: Number(formData.get("quantity")),
      photoUrl: photoUrl || undefined,
    };

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
        description: "Quantity cannot be negative.",
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
            title: "Field Required",
            description: "The 'To' field cannot be empty.",
          });
          return;
        }

        const itemRef = doc(db, "inventory", selectedItemToUpdate.id);
        const newQuantity = type === "in" ? selectedItemToUpdate.quantity + quantity : selectedItemToUpdate.quantity - quantity;

        if (newQuantity < 0) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Stock cannot be negative.",
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
        setSelectedItemName("Select an item...");
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


  const handlePhotoClick = (photoUrl: string | undefined | null) => {
    const { src: imageUrl } = getDisplayImage(photoUrl);
    if (imageUrl) {
        setPhotoToShow(imageUrl);
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
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground max-w-sm">
            You do not have permission to view this page. Please contact an administrator if you believe this is an error.
        </p>
      </div>
    );
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
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Manage your products and their stock levels.
          </p>
        </div>
        <div className="flex flex-col md:flex-row w-full md:w-auto items-center gap-2">
           <div className="relative flex-grow w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by item name..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <ToggleGroup type="single" value={layout} onValueChange={(value: 'list' | 'grid') => value && setLayout(value)} variant="outline">
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          {!isHrdUser && (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                    Actions
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setImportOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import from CSV
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleExportCsv}>
                    <Download className="mr-2 h-4 w-4" />
                    Export to CSV
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setSeedConfirmOpen(true)} className="text-red-600 focus:text-red-700">
                    <Database className="mr-2 h-4 w-4" />
                    Seed Database
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Dialog open={isImportOpen} onOpenChange={setImportOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import from CSV</DialogTitle>
                <DialogDescription>
                  Upload a CSV file to add items to the inventory in bulk.
                  The file must have columns: `name`, `price`, `unit`, `quantity`, and optionally `photoUrl`.
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
          {!isHrdUser && (
            <Dialog open={isAddOpen} onOpenChange={(isOpen) => { setAddOpen(isOpen); if (!isOpen) setPhotoUrl(""); }}>
                <DialogTrigger asChild>
                <Button className="w-full md:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Item
                </Button>
                </DialogTrigger>
                <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Inventory Item</DialogTitle>
                    <DialogDescription>
                    Fill in the details below to add a new product.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddItem} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" name="name" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price" className="text-right">Price</Label>
                    <Input id="price" name="price" type="number" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="unit" className="text-right">Unit</Label>
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
                    <Label htmlFor="quantity" className="text-right">Quantity</Label>
                    <Input id="quantity" name="quantity" type="number" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="photoUrl" className="text-right">Photo</Label>
                    <div className="col-span-3 flex items-center gap-2">
                        <Input 
                            id="photoUrl" 
                            name="photoUrl" 
                            type="text" 
                            placeholder="Or paste https://drive.google.com/..." 
                            className="flex-grow"
                            value={photoUrl}
                            onChange={(e) => setPhotoUrl(e.target.value)}
                        />
                        <Button type="button" size="icon" variant="outline" onClick={() => setCameraOpen(true)}>
                            <Camera className="h-4 w-4" />
                            <span className="sr-only">Take Photo</span>
                        </Button>
                    </div>
                    </div>
                    <DialogFooter>
                    <Button type="submit">Save Item</Button>
                    </DialogFooter>
                </form>
                </DialogContent>
            </Dialog>
          )}
        </div>
      </header>
      
      {layout === 'list' ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] hidden sm:table-cell">Photo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="hidden md:table-cell">Unit</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const { src, isPlaceholder } = getDisplayImage(item.photoUrl);
                    return (
                    <TableRow key={item.id}>
                      <TableCell className="hidden sm:table-cell">
                        <div className="cursor-pointer" onClick={() => handlePhotoClick(item.photoUrl)}>
                          {isPlaceholder ? (
                            <Image
                                alt={item.name}
                                className="aspect-square rounded-md object-cover"
                                height="64"
                                src={src}
                                width="64"
                              />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              alt={item.name}
                              className="aspect-square rounded-md object-cover"
                              height="64"
                              src={src}
                              width="64"
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{formatCurrency(item.price || 0)}</TableCell>
                      <TableCell className="hidden md:table-cell">{item.unit}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={item.quantity > 5 ? "outline" : item.quantity > 0 ? "warning" : "destructive"}
                           className={
                            item.quantity > 5 ? 'border-green-600 text-green-600' : 
                            item.quantity > 0 ? 'bg-orange-100 text-orange-800' : 
                            'bg-red-100 text-red-800'
                          }
                        >
                          {item.quantity > 5 ? "In Stock" : item.quantity > 0 ? "Low Stock" : "Out of Stock"}
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
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={() => handleCreatePreOrder(item)}>
                                <ShoppingCart className="mr-2 h-4 w-4" /> Create Pre-Order
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                onSelect={() => {
                                    setSelectedItem(item);
                                    setEditItemOpen(true);
                                }}
                                >
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                onSelect={() => {
                                    setSelectedItemId(item.id);
                                    setSelectedItemName(item.name);
                                    setStockInOpen(true);
                                }}
                                >
                                <ArrowDownCircle className="mr-2 h-4 w-4" /> Stock In
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                onSelect={() => {
                                    setSelectedItemId(item.id);
                                    setSelectedItemName(item.name);
                                    setStockOutOpen(true);
                                }}
                                >
                                <ArrowUpCircle className="mr-2 h-4 w-4" /> Stock Out
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                className="text-red-600 focus:text-red-700"
                                onSelect={() => {
                                    setSelectedItem(item);
                                    setDeleteOpen(true);
                                }}
                                >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Item
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredItems.map((item) => {
             const { src, isPlaceholder } = getDisplayImage(item.photoUrl);
             return (
              <Card key={item.id} className="flex flex-col">
                <CardHeader className="p-0">
                  <div className="relative">
                    <div className="cursor-pointer" onClick={() => handlePhotoClick(item.photoUrl)}>
                       {isPlaceholder ? (
                          <Image
                              alt={item.name}
                              className="aspect-video w-full rounded-t-lg object-cover"
                              height={180}
                              src={src}
                              width={320}
                            />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt={item.name}
                            className="aspect-video w-full rounded-t-lg object-cover"
                            height={180}
                            src={src}
                            width={320}
                          />
                        )}
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
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={() => handleCreatePreOrder(item)}>
                                <ShoppingCart className="mr-2 h-4 w-4" /> Create Pre-Order
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => { setSelectedItem(item); setEditItemOpen(true); }}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => { setSelectedItemId(item.id); setSelectedItemName(item.name); setStockInOpen(true); }}>
                                <ArrowDownCircle className="mr-2 h-4 w-4" /> Stock In
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => { setSelectedItemId(item.id); setSelectedItemName(item.name); setStockOutOpen(true); }}>
                                <ArrowUpCircle className="mr-2 h-4 w-4" /> Stock Out
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600 focus:text-red-700" onSelect={() => { setSelectedItem(item); setDeleteOpen(true); }}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Item
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
                      {item.quantity > 5 ? "In Stock" : item.quantity > 0 ? "Low Stock" : "Out of Stock"}
                    </Badge>
                     <div className="text-right">
                        <p className="font-bold text-lg">{item.quantity}</p>
                        <p className="text-xs text-muted-foreground -mt-1">{item.unit}</p>
                    </div>
                </CardFooter>
              </Card>
             )
          })}
        </div>
      )}
      
      {/* Photo Viewer Dialog */}
      <Dialog open={isPhotoOpen} onOpenChange={setPhotoOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Item Photo</DialogTitle>
            <DialogDescription>
              A larger view of the inventory item's photo.
            </DialogDescription>
          </DialogHeader>
          {photoToShow && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoToShow}
              alt="Enlarged inventory item"
              width={600}
              height={400}
              className="rounded-lg object-contain w-full"
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit Item Dialog */}
      <Dialog open={isEditItemOpen} onOpenChange={setEditItemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item: {selectedItem?.name}</DialogTitle>
            <DialogDescription>
             Update the details for this item. Changes to quantity will be logged as a transaction.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditItem} className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" name="name" className="col-span-3" defaultValue={selectedItem?.name} required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Price</Label>
              <Input id="price" name="price" type="number" className="col-span-3" defaultValue={selectedItem?.price} required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">Unit</Label>
              <Select name="unit" defaultValue={selectedItem?.unit} onValueChange={setSelectedUnit}>
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
              <Label htmlFor="photoUrl" className="text-right">Photo</Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input 
                  id="photoUrl" 
                  name="photoUrl" 
                  type="text" 
                  placeholder="Or paste https://drive.google.com/..." 
                  className="flex-grow" 
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                />
                 <Button type="button" size="icon" variant="outline" onClick={() => setCameraOpen(true)}>
                    <Camera className="h-4 w-4" />
                    <span className="sr-only">Take Photo</span>
                  </Button>
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
                defaultValue={selectedItem?.quantity}
                required
                min="0"
              />
            </div>
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>


      {/* Stock In Dialog */}
      <Dialog open={isStockInOpen} onOpenChange={(isOpen) => { if(!isOpen) { setSelectedItemId(null); setSelectedItemName("Select an item..."); } setStockInOpen(isOpen); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Stock In</DialogTitle>
            <DialogDescription>
              Add new stock received for this item.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStockUpdate("in")} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="item" className="text-right">Item</Label>
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
              <Label htmlFor="quantity" className="text-right">Quantity</Label>
              <Input id="quantity" name="quantity" type="number" className="col-span-3" required min="1" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="person" className="text-right">From</Label>
              <Input id="person" name="person" placeholder="e.g., Supplier Name" className="col-span-3" />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Stock
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stock Out Dialog */}
      <Dialog open={isStockOutOpen} onOpenChange={(isOpen) => { if(!isOpen) { setSelectedItemId(null); setSelectedItemName("Select an item..."); } setStockOutOpen(isOpen); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Stock Out</DialogTitle>
            <DialogDescription>
              Record stock that has been sold or used.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStockUpdate("out")} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="item" className="text-right">Item</Label>
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
              <Label htmlFor="quantity" className="text-right">Quantity</Label>
              <Input id="quantity" name="quantity" type="number" className="col-span-3" required min="1" max={selectedItemForStockOut?.quantity} />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="person" className="text-right">To</Label>
              <Input id="person" name="person" placeholder="e.g., Customer, Department" className="col-span-3" required />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Remove Stock
              </Button>
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
              This action cannot be undone. This will permanently delete the item
              <span className="font-semibold"> {selectedItem?.name} </span>
              from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedItem(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Seeding Confirmation Dialog */}
       <AlertDialog open={isSeedConfirmOpen} onOpenChange={setSeedConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all current items in your inventory and replace them with the new data set.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSeedDatabase}>
              Yes, replace my data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Camera Capture Dialog */}
      <Dialog open={isCameraOpen} onOpenChange={(isOpen) => { setCameraOpen(isOpen); setCapturedImage(null); }}>
          <DialogContent className="max-w-2xl">
              <DialogHeader>
                  <DialogTitle>Take a Photo</DialogTitle>
                  <DialogDescription>
                      Point your camera at the item and click "Capture".
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
                          <Button variant="outline" onClick={() => setCapturedImage(null)}>Retake</Button>
                          <Button onClick={handleSavePhoto}>Save Photo</Button>
                      </>
                  ) : (
                    <div className="flex justify-center items-center w-full relative">
                        <Button onClick={handleCapture} disabled={!hasCameraPermission}>Capture</Button>
                        {videoDevices.length > 1 && (
                          <Button variant="outline" size="icon" onClick={handleSwitchCamera} disabled={!hasCameraPermission} className="absolute right-0">
                            <SwitchCamera className="h-4 w-4" />
                            <span className="sr-only">Switch Camera</span>
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
