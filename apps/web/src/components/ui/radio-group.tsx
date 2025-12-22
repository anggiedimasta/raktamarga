import * as React from "react"
import { RadioGroup as RadioGroupPrimitive, Radio, useRadioGroup } from "@base-ui/react/radio-group"
import { IconCircle } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
  }
>(({ className, value, defaultValue, onValueChange, ...props }, ref) => {
  const { getRootProps } = useRadioGroup({ value, defaultValue, onChange: onValueChange })

  return (
    <RadioGroupPrimitive.Root
      {...getRootProps()}
      ref={ref}
      className={cn("grid gap-2", className)}
      {...props}
    />
  )
})
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value: string
  }
>(({ className, value, ...props }, ref) => {
  const { getRootProps, getInputProps, checked } = useRadioGroup({ value })

  return (
    <Radio
      {...getRootProps()}
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <Radio.Input {...getInputProps()} />
      {checked && (
        <Radio.Indicator className="flex items-center justify-center">
          <IconCircle className="h-3.5 w-3.5 fill-primary" />
        </Radio.Indicator>
      )}
    </Radio>
  )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
