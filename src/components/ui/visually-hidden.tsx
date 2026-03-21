import * as React from "react"
import { cn } from "@/lib/utils"

const VisuallyHidden = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "absolute inset-0 [clip:rect(0,0,0,0)] [clip-path:inset(50%)] height-px width-px overflow-hidden p-0 margin-[-1px] whitespace-nowrap border-0",
      className
    )}
    {...props}
  />
))

VisuallyHidden.displayName = "VisuallyHidden"

export { VisuallyHidden }