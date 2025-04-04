import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white shadow hover:bg-blue-700/90 dark:bg-blue-500 dark:hover:bg-blue-600/90",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-700/90 dark:bg-red-500 dark:hover:bg-red-600/90",
        outline:
          "border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100",
        secondary:
          "bg-slate-200 text-slate-900 shadow-sm hover:bg-slate-300/80 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700/80",
        ghost: "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100",
        link: "text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline",
        gradient: "bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200",
        "gradient-outline": "border-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200 shadow-sm",
        glass: "bg-white/20 dark:bg-slate-900/20 backdrop-blur-lg text-blue-600 dark:text-blue-400 border border-white/20 dark:border-slate-700/20 hover:bg-white/30 dark:hover:bg-slate-800/30 shadow-sm",
        soft: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-md px-10 text-base",
        icon: "h-10 w-10",
      },
      rounded: {
        default: "rounded-md",
        full: "rounded-full",
        lg: "rounded-lg",
        xl: "rounded-xl",
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        bounce: "animate-bounce",
        float: "animate-float",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
      animation: "none",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, rounded, animation, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, rounded, animation, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
