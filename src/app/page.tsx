
import * as React from "react";
import dynamic from 'next/dynamic';
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DashboardClientContent = dynamic(() =>
  import('./dashboard-client-content').then(mod => mod.DashboardClientContent),
  {
    ssr: false, 
    loading: () => <FullPageSpinner />,
  }
);


async function getDashboardData() {
  if (!db) {
    console.warn("Firebase not configured, returning empty data.");
    return {
      inventoryItems: [],
      transactions: [],
      recentTransactions: [],
      preOrders: [],
    };
  }

  try {
    const qInventory = query(collection(db, "inventory"), orderBy("name"));
    const inventorySnapshot = await getDocs(qInventory);
    const inventoryItems: InventoryItem[] = [];
    inventorySnapshot.forEach((doc) => {
      inventoryItems.push({ id: doc.id, ...doc.data() } as InventoryItem);
    });

    const qTransactions = query(
      collection(db, "transactions"),
      orderBy("date", "desc")
    );
    const transactionsSnapshot = await getDocs(qTransactions);
    const transactions: Transaction[] = [];
    transactionsSnapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() } as Transaction);
    });

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
    console.error("Error fetching dashboard data for anonymous user:", error);
    return {
      inventoryItems: [],
      transactions: [],
      recentTransactions: [],
      preOrders: [],
    };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <DashboardClientContent
      initialInventoryItems={data.inventoryItems}
      initialTransactions={data.transactions}
      initialRecentTransactions={data.recentTransactions}
      initialPreOrders={data.preOrders}
    />
  );
}

    