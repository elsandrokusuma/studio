
import * as React from "react";
import {
  collection,
  query,
  where,
  getDocs,
  documentId,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

import type { PreOrder } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { SuratJalanClientContent } from "./surat-jalan-client-content";


// Server Component for data fetching
export default async function SuratJalanPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  
  const fetchOrders = async (): Promise<PreOrder[] | { error: string }> => {
    if (!db) {
        return { error: "Firebase not configured. Please check your environment variables." };
    }

    const idsParam = searchParams?.ids;
    const ids = typeof idsParam === 'string' ? idsParam.split(",") : [];

    if (!ids || ids.length === 0) {
        return [];
    };

    try {
        const q = query(collection(db, "pre-orders"), where(documentId(), "in", ids));
        const querySnapshot = await getDocs(q);
        const selectedOrders: PreOrder[] = [];
        querySnapshot.forEach((doc) => {
            selectedOrders.push({ id: doc.id, ...doc.data() } as PreOrder);
        });
        
        return selectedOrders;

    } catch (err) {
        console.error("Failed to fetch pre-orders from Firestore", err);
        return { error: "Failed to fetch order details." };
    }
  };

  const result = await fetchOrders();

  if ('error' in result) {
    return (
     <div className="flex items-center justify-center h-full">
       <Alert variant="destructive" className="max-w-md">
         <AlertTitle>Error</AlertTitle>
         <AlertDescription>
           {result.error}
         </AlertDescription>
       </Alert>
     </div>
   );
  }

  return (
    <React.Suspense fallback={<FullPageSpinner />}>
      <SuratJalanClientContent orders={result} />
    </React.Suspense>
  )
}
