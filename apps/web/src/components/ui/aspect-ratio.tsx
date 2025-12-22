"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const AspectRatio = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    ratio?: number
  }
>(({ className, ratio = 16 / 9, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative w-full", className)}
    style={{ paddingBottom: `${(1 / ratio) * 100}%` }}
    {...props}
  >
    <div className="absolute inset-0">{props.children}</div>
  </div>
))
AspectRatio.displayName = "AspectRatio"

export { AspectRatio }
