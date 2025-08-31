
"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root
const SelectValue = SelectPrimitive.Value
const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border px-3 text-sm",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Content
    ref={ref}
    className={cn(
      "relative z-50 min-w-[8rem] max-h-[200px] overflow-y-auto rounded-md border bg-white shadow-md touch-auto", // Tambahkan max-h & overflow-y
      className
    )}
    {...props}
  >
    <SelectPrimitive.ScrollUpButton className="flex items-center justify-center py-1">
      <ChevronUp className="h-4 w-4" />
    </SelectPrimitive.ScrollUpButton>

    <SelectPrimitive.Viewport className="p-1">
      {children}
    </SelectPrimitive.Viewport>

    <SelectPrimitive.ScrollDownButton className="flex items-center justify-center py-1">
      <ChevronDown className="h-4 w-4" />
    </SelectPrimitive.ScrollDownButton>
  </SelectPrimitive.Content>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100",
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemIndicator className="absolute left-2 flex items-center justify-center">
      <Check className="h-4 w-4" />
    </SelectPrimitive.ItemIndicator>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue }
