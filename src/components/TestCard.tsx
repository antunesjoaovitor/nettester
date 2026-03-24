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
        "rounded-3xl border border-border bg-panel p-6 shadow-panel transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-blue",
        className
      )}
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </span>
        <h2 className="text-lg font-extrabold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
};

export default TestCard;