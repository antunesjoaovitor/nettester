import { useState } from "react";
import { Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TestCard from "./TestCard";
import ResultDisplay, { TestStatus } from "./ResultDisplay";
import { supabase } from "@/integrations/supabase/client";

const COMMON_PORTS = [21, 22, 25, 53, 80, 110, 143, 443, 465, 587, 993, 995, 2525, 3306, 5060, 5061, 5432, 8080];

const PROTOCOLS = [
  { value: "tcp", label: "TCP" },
  { value: "tls", label: "TLS" },
  { value: "udp", label: "UDP" },
] as const;

const TcpPortTest = () => {
  const [host, setHost] = useState("");
  const [ports, setPorts] = useState("80,443,25,587,993,995,110");
  const [protocol, setProtocol] = useState<string>("tcp");
  const [customPort, setCustomPort] = useState("");
  const [status, setStatus] = useState<TestStatus>("idle");
  const [output, setOutput] = useState<string[]>([]);

  const runTest = async () => {
    if (!host) return;
    setStatus("running");
    setOutput([`> Testando portas em ${host}...`]);

    const portList = ports.split(",").map((p) => parseInt(p.trim())).filter((p) => !isNaN(p));

    try {
      const { data, error } = await supabase.functions.invoke("network-test", {
        body: { type: "tcp", host, ports: portList },
      });

      if (error) throw error;

      const results = data.results as { port: number; open: boolean; service: string }[];
      const lines = results.map((r) =>
        r.open
          ? `[OK] Porta ${r.port} (${r.service}) - ABERTA`
          : `[ERRO] Porta ${r.port} (${r.service}) - FECHADA`
      );
      setOutput((prev) => [...prev, ...lines, `[INFO] Teste concluído - ${results.filter((r) => r.open).length}/${results.length} portas abertas`]);
      setStatus(results.some((r) => r.open) ? "success" : "error");
    } catch (e: any) {
      setOutput((prev) => [...prev, `[ERRO] ${e.message}`]);
      setStatus("error");
    }
  };

  return (
    <TestCard title="Teste de Portas TCP" icon={<Network size={20} />}>
      <div className="space-y-3">
        <div>
          <Label className="text-muted-foreground font-mono text-xs">Host / IP</Label>
          <Input
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="exemplo.com ou 192.168.1.1"
            className="mt-1 bg-input border-border font-mono text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div>
          <Label className="text-muted-foreground font-mono text-xs">Portas (separadas por vírgula)</Label>
          <Input
            value={ports}
            onChange={(e) => setPorts(e.target.value)}
            placeholder="80,443,25,587"
            className="mt-1 bg-input border-border font-mono text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {COMMON_PORTS.map((p) => (
            <button
              key={p}
              onClick={() => {
                const current = ports.split(",").map((x) => x.trim()).filter(Boolean);
                if (!current.includes(String(p))) {
                  setPorts([...current, String(p)].join(","));
                }
              }}
              className="rounded border border-border px-2 py-0.5 font-mono text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
        <Button variant="neon" onClick={runTest} disabled={status === "running" || !host}>
          {status === "running" ? "Escaneando..." : "Escanear Portas"}
        </Button>
      </div>
      <ResultDisplay status={status} output={output} />
    </TestCard>
  );
};

export default TcpPortTest;
