import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

const backgroundVariants = cva(
  "fixed inset-0 w-full h-full -z-10",
  {
    variants: {
      variant: {
        default: "",
        mesh: "",
        gradient: "bg-blue-50 dark:bg-slate-950",
        dots: "bg-white dark:bg-slate-950",
        waves: "bg-white dark:bg-slate-950",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BackgroundProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof backgroundVariants> {}

const Background = React.forwardRef<HTMLDivElement, BackgroundProps>(
  ({ className, variant, children, ...props }, ref) => {
    const { theme, systemTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Determine the effective theme (for hydration)
    const effectiveTheme = mounted 
      ? theme === "system" 
        ? systemTheme || "light" 
        : theme || "light"
      : "light"
    
    // Handle mounting to avoid hydration mismatch
    useEffect(() => {
      setMounted(true)
    }, [])

    if (!mounted) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(backgroundVariants({ variant, className }))}
        {...props}
      >
        {/* Mesh background */}
        {(variant === "mesh" || variant === "default") && (
          <div className={effectiveTheme === "dark" ? "custom-bg-mesh-dark" : "custom-bg-mesh-light"} />
        )}
        
        {/* Dots pattern for "dots" variant */}
        {variant === "dots" && (
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-50" />
        )}

        {/* Waves pattern for "waves" variant */}
        {variant === "waves" && (
          <div className="absolute inset-0">
            <svg
              className="w-full h-full opacity-30 dark:opacity-10"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 320"
            >
              <path
                fill={effectiveTheme === "dark" ? "#4F46E5" : "#3B82F6"}
                fillOpacity="1"
                d="M0,224L48,192C96,160,192,96,288,96C384,96,480,160,576,170.7C672,181,768,139,864,117.3C960,96,1056,96,1152,122.7C1248,149,1344,203,1392,229.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              ></path>
              <path
                fill={effectiveTheme === "dark" ? "#6366F1" : "#60A5FA"}
                fillOpacity="0.8"
                d="M0,192L48,176C96,160,192,128,288,138.7C384,149,480,203,576,208C672,213,768,171,864,165.3C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              ></path>
            </svg>
          </div>
        )}
        
        {children}
      </div>
    )
  }
)
Background.displayName = "Background"

export { Background, backgroundVariants }
