import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TestCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}

const TestCard = ({ title, icon, children, className }: TestCardProps) => {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-neon",
        className
      )}
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="text-primary">{icon}</span>
        <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
};

export default TestCard;
