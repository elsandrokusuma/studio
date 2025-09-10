
import * as React from "react";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { PreOrdersClient } from "./pre-orders-client";

// This page will now be a Server Component to handle searchParams correctly.
export default function PreOrdersPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    return (
      <React.Suspense fallback={<FullPageSpinner />}>
        <PreOrdersClient searchParams={searchParams} />
      </React.Suspense>
    );
}
