
import * as React from "react";
import {
  collection,
  query,
  where,
  getDocs,
  documentId,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

import type { SparepartRequest } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { SparepartOrderClientContent, type GroupedOrders } from "./sparepart-order-client-content";


// Server Component for data fetching
export default async function SparepartOrderPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  
  const fetchOrders = async (): Promise<GroupedOrders[] | { error: string }> => {
    if (!db) {
        return { error: "Firebase not configured. Please check your environment variables." };
    }

    const poNumbersParam = searchParams?.poNumbers;
    const poNumbers = typeof poNumbersParam === 'string' ? poNumbersParam.split(",") : [];

    if (!poNumbers || poNumbers.length === 0) {
        return [];
    };

    try {
        const q = query(collection(db, "sparepart-requests"), where("requestNumber", "in", poNumbers));
        const querySnapshot = await getDocs(q);
        const selectedOrders: SparepartRequest[] = [];
        querySnapshot.forEach((doc) => {
            // We only want to print approved items or items with revised quantities
            const data = doc.data() as SparepartRequest;
            if(data.status === 'Approved') {
               selectedOrders.push({ id: doc.id, ...data });
            }
        });
        
        const groups: { [key: string]: SparepartRequest[] } = {};
        selectedOrders.forEach(order => {
            if (!groups[order.requestNumber]) {
                groups[order.requestNumber] = [];
            }
            groups[order.requestNumber].push(order);
        });

        const groupedData = Object.values(groups).map(items => ({
          requestNumber: items[0].requestNumber,
          requester: items[0].requester,
          location: items[0].location,
          requestDate: items[0].requestDate,
          items: items,
        }));

        return groupedData;

    } catch (err) {
        console.error("Failed to fetch sparepart requests from Firestore", err);
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
      <SparepartOrderClientContent groupedOrders={result} />
    </React.Suspense>
  )
}
