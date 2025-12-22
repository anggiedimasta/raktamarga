import * as React from "react"
import { Slider as SliderPrimitive, useSlider } from "@base-ui/react/slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number[]
    defaultValue?: number[]
    onValueChange?: (value: number[]) => void
    min?: number
    max?: number
    step?: number
  }
>(({ className, value, defaultValue, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
  const { getRootProps, getTrackProps, getThumbProps, getRangeProps } = useSlider({
    value,
    defaultValue,
    onChange: onValueChange,
    min,
    max,
    step,
  })

  const currentValue = value || defaultValue || [0]

  return (
    <SliderPrimitive.Root
      {...getRootProps()}
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        {...getTrackProps()}
        className="relative h-1.5 w-full grow overflow-hidden bg-primary/20"
      >
        <SliderPrimitive.Range
          {...getRangeProps()}
          className="absolute h-full bg-primary"
          style={{ width: `${((currentValue[0] - min) / (max - min)) * 100}%` }}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        {...getThumbProps()}
        className="block h-4 w-4 border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      />
    </SliderPrimitive.Root>
  )
})
Slider.displayName = "Slider"

export { Slider }
