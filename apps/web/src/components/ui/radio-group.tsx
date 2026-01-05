import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { Radio } from "@base-ui/react/radio"
import { IconCircle } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef<
  HTMLDivElement,
  RadioGroupPrimitive.Props
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive
    ref={ref}
    className={cn("grid gap-2", className)}
    {...props}
  />
))
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<
  HTMLButtonElement,
  Radio.Root.Props
>(({ className, children, ...props }, ref) => (
  <Radio.Root
    ref={ref}
    className={cn(
      "group aspect-square h-4 w-4 border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center",
      className
    )}
    {...props}
  >
    <Radio.Indicator className="flex items-center justify-center">
      <IconCircle className="h-3.5 w-3.5 fill-primary" />
    </Radio.Indicator>
    {children}
  </Radio.Root>
))
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
