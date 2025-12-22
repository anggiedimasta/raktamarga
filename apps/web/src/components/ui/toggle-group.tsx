import * as React from "react"
import { ToggleGroup as ToggleGroupPrimitive, useToggleGroup } from "@base-ui/react/toggle-group"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: "default",
  variant: "default",
})

const ToggleGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof toggleVariants> & {
      type?: "single" | "multiple"
      value?: string | string[]
      defaultValue?: string | string[]
      onValueChange?: (value: string | string[]) => void
    }
>(({ className, variant, size, children, type = "single", value, defaultValue, onValueChange, ...props }, ref) => {
  const { getRootProps } = useToggleGroup({ type, value, defaultValue, onChange: onValueChange })

  return (
    <ToggleGroupPrimitive.Root
      {...getRootProps()}
      ref={ref}
      className={cn("flex items-center justify-center gap-1", className)}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
})

ToggleGroup.displayName = "ToggleGroup"

const ToggleGroupItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof toggleVariants> & {
      value: string
    }
>(({ className, children, variant, size, value, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)
  const { getRootProps, getInputProps, selected } = useToggleGroup({ value })

  return (
    <ToggleGroupPrimitive.Item
      {...getRootProps()}
      ref={ref}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        selected && "bg-accent text-accent-foreground",
        className
      )}
      {...props}
    >
      <ToggleGroupPrimitive.Input {...getInputProps()} />
      {children}
    </ToggleGroupPrimitive.Item>
  )
})

ToggleGroupItem.displayName = "ToggleGroupItem"

export { ToggleGroup, ToggleGroupItem }
