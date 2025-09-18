import * as React from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { InventoryItem, Transaction, PreOrder } from "@/lib/types";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { DashboardClientContent } from "./dashboard-client-content";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

async function getDashboardData() {
  if (!db) {
    throw new Error("Firebase not configured");
  }

  try {
    // Fetch Inventory
    const qInventory = query(collection(db, "inventory"), orderBy("name"));
    const inventorySnapshot = await getDocs(qInventory);
    const inventoryItems: InventoryItem[] = [];
    inventorySnapshot.forEach((doc) => {
      inventoryItems.push({ id: doc.id, ...doc.data() } as InventoryItem);
    });

    // Fetch all Transactions for chart
    const qTransactions = query(
      collection(db, "transactions"),
      orderBy("date", "desc")
    );
    const transactionsSnapshot = await getDocs(qTransactions);
    const transactions: Transaction[] = [];
    transactionsSnapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() } as Transaction);
    });

    // Fetch Recent Transactions
    const qRecentTransactions = query(
      collection(db, "transactions"),
      orderBy("date", "desc"),
      limit(5)
    );
    const recentTransactionsSnapshot = await getDocs(qRecentTransactions);
    const recentTransactions: Transaction[] = [];
    recentTransactionsSnapshot.forEach((doc) => {
      recentTransactions.push({ id: doc.id, ...doc.data() } as Transaction);
    });

    // Fetch Pre-Orders
    const qPreOrders = query(
      collection(db, "pre-orders"),
      orderBy("orderDate", "desc")
    );
    const preOrdersSnapshot = await getDocs(qPreOrders);
    const preOrders: PreOrder[] = [];
    preOrdersSnapshot.forEach((doc) => {
      preOrders.push({ id: doc.id, ...doc.data() } as PreOrder);
    });

    return {
      inventoryItems,
      transactions,
      recentTransactions,
      preOrders,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    // Return null or an empty state in case of error
    return null;
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) {
     return (
      <div className="flex items-center justify-center h-full">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>
            Could not fetch dashboard data. Please check the server connection and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <React.Suspense fallback={<FullPageSpinner />}>
      <DashboardClientContent
        initialInventoryItems={data.inventoryItems}
        initialTransactions={data.transactions}
        initialRecentTransactions={data.recentTransactions}
        initialPreOrders={data.preOrders}
      />
    </React.Suspense>
  );
}
