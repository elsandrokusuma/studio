
'use server';

import { 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    getDocs, 
    limit, 
    writeBatch,
    Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Transaction } from "@/lib/types";

// The maximum number of transactions to keep in the database.
const MAX_TRANSACTIONS = 2000;
// The number of old transactions to delete when the maximum is exceeded.
const DELETE_BATCH_SIZE = 500;

/**
 * Adds a new transaction and cleans up old transactions if the total exceeds a threshold.
 * @param transaction The transaction data to add.
 */
export async function manageTransaction(transaction: Omit<Transaction, 'id' | 'date'>): Promise<void> {
  if (!db) {
    console.error("Firebase is not initialized. Cannot add or clean up transactions.");
    return;
  }

  // 1. Add the new transaction
  await addDoc(collection(db, "transactions"), {
    ...transaction,
    date: new Date().toISOString(),
  });

  // 2. Check the total number of transactions
  const transactionsCollection = collection(db, "transactions");
  const countSnapshot = await getDocs(transactionsCollection);
  const totalCount = countSnapshot.size;

  // 3. If the count exceeds the maximum, delete the oldest ones
  if (totalCount > MAX_TRANSACTIONS) {
    console.log(`Transaction count (${totalCount}) exceeds maximum (${MAX_TRANSACTIONS}). Cleaning up old entries...`);
    
    // Query for the oldest transactions to delete
    const q = query(transactionsCollection, orderBy("date", "asc"), limit(DELETE_BATCH_SIZE));
    const snapshotToDelete = await getDocs(q);
    
    // Create a batch to delete them efficiently
    const batch = writeBatch(db);
    snapshotToDelete.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`Successfully deleted ${snapshotToDelete.size} old transactions.`);
  }
}
