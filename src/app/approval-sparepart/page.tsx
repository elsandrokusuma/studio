
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Wrench,
  FileText,
  Boxes,
  Clock,
  PlusCircle,
  Search,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

export default function ApprovalSparepartPage() {
  const [dateFilter, setDateFilter] = React.useState<Date | undefined>(undefined);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg hidden sm:block">
            <Wrench className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Approval Sparepart
            </h1>
            <p className="text-muted-foreground">
              0 Requests • 0 Items
            </p>
          </div>
        </div>
        <Button disabled>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Request
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="text-white" style={{ backgroundColor: 'hsl(var(--summary-card-1))' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card className="text-white" style={{ backgroundColor: 'hsl(var(--summary-card-2))' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Boxes className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card className="text-white" style={{ backgroundColor: 'hsl(var(--summary-card-3))' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search request or item..."
              className="pl-8 w-full"
              disabled
            />
          </div>
          <Select disabled>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full md:w-auto justify-start text-left font-normal"
                disabled
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFilter ? format(dateFilter, "PPP") : <span>Pick date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFilter}
                onSelect={setDateFilter}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <div className="items-center gap-2 hidden md:flex">
            <Checkbox id="select-all" disabled />
            <label htmlFor="select-all" className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Select All
            </label>
          </div>
           <Button variant="ghost" className="text-muted-foreground" disabled>
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
        </CardContent>
      </Card>

      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-24">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-4 bg-primary/10 rounded-full">
            <Wrench className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight">
            Functionality Coming Soon
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            This page is under construction. The functionality to approve sparepart requests will be available here shortly.
          </p>
        </div>
      </div>
    </div>
  );
}
