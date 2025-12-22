"use client"

import * as React from "react"
import { Collapsible as CollapsiblePrimitive, useCollapsible } from "@base-ui/react/collapsible"

const Collapsible = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    open?: boolean
    defaultOpen?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(({ className, open, defaultOpen, onOpenChange, ...props }, ref) => {
  const { getRootProps } = useCollapsible({ open, defaultOpen, onChange: onOpenChange })

  return (
    <CollapsiblePrimitive.Root
      {...getRootProps()}
      ref={ref}
      className={className}
      {...props}
    />
  )
})
Collapsible.displayName = "Collapsible"

const CollapsibleTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { getRootProps, getInputProps } = useCollapsible({})

  return (
    <CollapsiblePrimitive.Trigger
      {...getRootProps()}
      ref={ref}
      className={className}
      {...props}
    >
      <CollapsiblePrimitive.Input {...getInputProps()} />
    </CollapsiblePrimitive.Trigger>
  )
})
CollapsibleTrigger.displayName = "CollapsibleTrigger"

const CollapsibleContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { getRootProps, hidden } = useCollapsible({})

  if (hidden) return null

  return (
    <CollapsiblePrimitive.Content
      {...getRootProps()}
      ref={ref}
      className={className}
      {...props}
    />
  )
})
CollapsibleContent.displayName = "CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
