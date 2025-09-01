
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wrench } from "lucide-react";

export default function ApprovalSparepartPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Approval Sparepart</h1>
        <p className="text-muted-foreground">
          Review and approve or reject pending sparepart requests.
        </p>
      </header>
      
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-24">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-4 bg-primary/10 rounded-full">
            <Wrench className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight">
            Coming Soon
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            This page is under construction. The functionality to approve sparepart requests will be available here shortly.
          </p>
        </div>
      </div>
    </div>
  );
}
