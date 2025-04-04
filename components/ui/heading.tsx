import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const headingVariants = cva(
  "font-bold tracking-tight", 
  {
    variants: {
      size: {
        h1: "text-4xl md:text-5xl lg:text-6xl",
        h2: "text-3xl md:text-4xl",
        h3: "text-2xl md:text-3xl",
        h4: "text-xl md:text-2xl",
        h5: "text-lg md:text-xl",
        h6: "text-base md:text-lg",
      },
      weight: {
        light: "font-light",
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
        extrabold: "font-extrabold",
      },
      variant: {
        default: "text-slate-900 dark:text-slate-100",
        muted: "text-slate-500 dark:text-slate-400",
        gradient: "custom-gradient-text",
        primary: "text-blue-600 dark:text-blue-500",
        secondary: "text-slate-700 dark:text-slate-300",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      },
      decoration: {
        none: "",
        underline: "underline underline-offset-4",
        highlight: "relative inline-block",
      }
    },
    defaultVariants: {
      size: "h2",
      weight: "bold",
      variant: "default",
      align: "left",
      decoration: "none",
    },
  }
)

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: React.ElementType
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, size, weight, variant, align, decoration, as, children, ...props }, ref) => {
    const Component = as || (size === "h1" ? "h1" : 
                           size === "h3" ? "h3" : 
                           size === "h4" ? "h4" : 
                           size === "h5" ? "h5" : 
                           size === "h6" ? "h6" : "h2")
    
    return (
      <Component
        ref={ref}
        className={cn(headingVariants({ size, weight, variant, align, decoration, className }))}
        {...props}
      >
        {children}
        {decoration === "highlight" && (
          <span className="absolute bottom-0 left-0 w-full h-3 bg-blue-500/20 dark:bg-blue-400/20 -z-10" />
        )}
      </Component>
    )
  }
)
Heading.displayName = "Heading"

export { Heading, headingVariants }
