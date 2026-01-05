import * as React from "react"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  HTMLDivElement,
  SliderPrimitive.Root.Props
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Control className="relative flex w-full items-center h-5">
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden bg-primary/20">
        <SliderPrimitive.Indicator className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-4 w-4 border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Control>
  </SliderPrimitive.Root>
))
Slider.displayName = "Slider"

export { Slider }
