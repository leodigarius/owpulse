import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const containerVariants = cva(
  "mx-auto px-4 sm:px-6 lg:px-8 relative",
  {
    variants: {
      size: {
        default: "max-w-7xl",
        sm: "max-w-5xl",
        md: "max-w-6xl", 
        lg: "max-w-7xl",
        xl: "max-w-[85rem]",
        full: "max-w-full",
      },
      padding: {
        default: "py-8",
        none: "py-0",
        sm: "py-4",
        lg: "py-12",
        xl: "py-16",
      },
      withGlow: {
        true: "relative",
        false: "",
      }
    },
    defaultVariants: {
      size: "default",
      padding: "default",
      withGlow: false,
    },
  }
)

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, padding, withGlow = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          containerVariants({ size, padding, withGlow, className })
        )}
        {...props}
      >
        {withGlow && (
          <div className="hero-glow left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        )}
        {children}
      </div>
    )
  }
)
Container.displayName = "Container"

export { Container, containerVariants }
