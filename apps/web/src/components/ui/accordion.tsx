import * as React from "react"
import { Accordion as AccordionPrimitive, useAccordion } from "@base-ui/react/accordion"
import { IconChevronDown } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

const Accordion = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    type?: "single" | "multiple"
    value?: string | string[]
    defaultValue?: string | string[]
    onValueChange?: (value: string | string[]) => void
  }
>(({ className, type = "single", value, defaultValue, onValueChange, ...props }, ref) => {
  const { getRootProps } = useAccordion({ type, value, defaultValue, onChange: onValueChange })

  return (
    <AccordionPrimitive.Root
      {...getRootProps()}
      ref={ref}
      className={cn(className)}
      {...props}
    />
  )
})
Accordion.displayName = "Accordion"

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string
  }
>(({ className, value, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    value={value}
    className={cn("border-b", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value: string
  }
>(({ className, children, value, ...props }, ref) => {
  const { getRootProps, getInputProps, expanded } = useAccordion({ value })

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        {...getRootProps()}
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left",
          expanded && "[&>svg]:rotate-180",
          className
        )}
        {...props}
      >
        <AccordionPrimitive.Input {...getInputProps()} />
        {children}
        <IconChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
})
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string
  }
>(({ className, children, value, ...props }, ref) => {
  const { getRootProps, hidden } = useAccordion({ value })

  if (hidden) return null

  return (
    <AccordionPrimitive.Content
      {...getRootProps()}
      ref={ref}
      className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn("pb-4 pt-0", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
})
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
