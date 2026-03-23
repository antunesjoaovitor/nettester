import { cn } from "@/lib/utils";

export type TestStatus = "idle" | "running" | "success" | "error";

interface ResultDisplayProps {
  status: TestStatus;
  output: string[];
}

const ResultDisplay = ({ status, output }: ResultDisplayProps) => {
  if (status === "idle" && output.length === 0) return null;

  return (
    <div className="mt-4 rounded border border-border bg-background p-4 font-mono text-sm">
      <div className="mb-2 flex items-center gap-2">
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            status === "running" && "animate-pulse bg-yellow-400",
            status === "success" && "bg-primary",
            status === "error" && "bg-destructive",
            status === "idle" && "bg-muted-foreground"
          )}
        />
        <span className="text-muted-foreground text-xs uppercase tracking-wider">
          {status === "running" ? "Executando..." : status === "success" ? "Concluído" : status === "error" ? "Erro" : "Aguardando"}
        </span>
      </div>
      <div className="space-y-0.5">
        {output.map((line, i) => (
          <div
            key={i}
            className={cn(
              "text-foreground",
              line.startsWith("[OK]") && "text-primary",
              line.startsWith("[ERRO]") && "text-destructive",
              line.startsWith("[INFO]") && "text-muted-foreground",
              line.startsWith(">") && "text-neon-bright"
            )}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultDisplay;
