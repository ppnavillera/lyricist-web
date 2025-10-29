import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-3 w-full overflow-hidden rounded-full bg-secondary/50 backdrop-blur-sm",
          className
        )}
        {...props}
      >
        <div
          className="h-full w-full flex-1 progress-gradient transition-all duration-500 ease-out relative shadow-lg"
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        >
          {/* 반짝이는 효과 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
        </div>
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
