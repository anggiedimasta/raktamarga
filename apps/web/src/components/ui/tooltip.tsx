"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive, useTooltip } from "@base-ui/react/tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = ({ children, delayDuration = 700, ...props }: React.PropsWithChildren<{ delayDuration?: number }>) => {
  return <div {...props}>{children}</div>
}

const Tooltip = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    open?: boolean
    defaultOpen?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(({ className, open, defaultOpen, onOpenChange, ...props }, ref) => {
  const { getRootProps } = useTooltip({ open, defaultOpen, onChange: onOpenChange })

  return (
    <TooltipPrimitive.Root
      {...getRootProps()}
      ref={ref}
      className={cn(className)}
      {...props}
    />
  )
})
Tooltip.displayName = "Tooltip"

const TooltipTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { getRootProps, getInputProps } = useTooltip({})

  return (
    <TooltipPrimitive.Trigger
      {...getRootProps()}
      ref={ref}
      className={className}
      {...props}
    >
      <TooltipPrimitive.Input {...getInputProps()} />
    </TooltipPrimitive.Trigger>
  )
})
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    sideOffset?: number
  }
>(({ className, sideOffset = 4, ...props }, ref) => {
  const { getRootProps, hidden } = useTooltip({})

  if (hidden) return null

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        {...getRootProps()}
        ref={ref}
        className={cn(
          "z-50 overflow-hidden bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        style={{ margin: `${sideOffset}px` }}
        {...props}
      />
    </TooltipPrimitive.Portal>
  )
})
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
