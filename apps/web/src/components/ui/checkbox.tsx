import * as React from "react"
import { Checkbox as CheckboxPrimitive, useCheckbox } from "@base-ui/react/checkbox"
import { IconCheck } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { getRootProps, getInputProps, checked } = useCheckbox({ ...props })

  return (
    <CheckboxPrimitive.Root
      {...getRootProps()}
      ref={ref}
      className={cn(
        "grid place-content-center peer h-4 w-4 shrink-0 border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        checked && "bg-primary text-primary-foreground",
        className
      )}
    >
      <CheckboxPrimitive.Input {...getInputProps()} />
      {checked && (
        <CheckboxPrimitive.Indicator className={cn("grid place-content-center text-current")}>
          <IconCheck className="h-4 w-4" />
        </CheckboxPrimitive.Indicator>
      )}
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
