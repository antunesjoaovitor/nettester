import { cn } from "@/lib/utils";

export type TestStatus = "idle" | "running" | "success" | "error";

interface ResultDisplayProps {
  status: TestStatus;
  output: string[];
}

const ResultDisplay = ({ status, output }: ResultDisplayProps) => {
  if (status === "idle" && output.length === 0) return null;

  return (
    <div className="mt-4 rounded-2xl border border-border bg-black/30 p-4 text-sm">
      <div className="mb-3 flex items-center gap-2">
        <span
          className={cn(
            "h-2.5 w-2.5 rounded-full",
            status === "running" && "animate-pulse bg-yellow-400",
            status === "success" && "bg-green-500",
            status === "error" && "bg-red-500",
            status === "idle" && "bg-muted-foreground"
          )}
        />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {status === "running"
            ? "Executando..."
            : status === "success"
            ? "Concluído"
            : status === "error"
            ? "Erro"
            : "Aguardando"}
        </span>
      </div>

      <div className="space-y-1 font-mono">
        {output.map((line, i) => (
          <div
            key={i}
            className={cn(
              "break-words text-foreground",
              line.startsWith("[OK]") && "text-green-400",
              line.startsWith("[ERRO]") && "text-red-400",
              line.startsWith("[INFO]") && "text-slate-400",
              line.startsWith(">") && "text-primary"
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