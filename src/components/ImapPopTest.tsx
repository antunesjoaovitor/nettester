import { useState } from "react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TestCard from "./TestCard";
import ResultDisplay, { TestStatus } from "./ResultDisplay";
import { supabase } from "@/integrations/supabase/client";

const ImapPopTest = () => {
  const [protocol, setProtocol] = useState<"imap" | "pop3">("imap");
  const [host, setHost] = useState("");
  const [port, setPort] = useState("993");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<TestStatus>("idle");
  const [output, setOutput] = useState<string[]>([]);

  const runTest = async () => {
    if (!host || !username || !password) return;
    setStatus("running");
    setOutput([`> Conectando via ${protocol.toUpperCase()} em ${host}:${port}...`]);

    try {
      const { data, error } = await supabase.functions.invoke("network-test", {
        body: { type: protocol, host, port: parseInt(port), username, password },
      });

      if (error) throw error;

      const lines: string[] = [];
      if (data.connected) lines.push(`[OK] Conexão ${protocol.toUpperCase()} estabelecida`);
      else lines.push(`[ERRO] Falha na conexão ${protocol.toUpperCase()}`);

      if (data.authenticated) lines.push("[OK] Autenticação bem-sucedida");
      else if (data.authError) lines.push(`[ERRO] Falha na autenticação: ${data.authError}`);

      if (data.mailboxInfo) lines.push(`[INFO] ${data.mailboxInfo}`);
      if (data.details) lines.push(`[INFO] ${data.details}`);

      setOutput((prev) => [...prev, ...lines]);
      setStatus(data.connected && data.authenticated ? "success" : "error");
    } catch (e: any) {
      setOutput((prev) => [...prev, `[ERRO] ${e.message}`]);
      setStatus("error");
    }
  };

  return (
    <TestCard title="Teste IMAP / POP3" icon={<Inbox size={20} />}>
      <div className="space-y-3">
        <div className="flex gap-2">
          {(["imap", "pop3"] as const).map((p) => (
            <button
              key={p}
              onClick={() => {
                setProtocol(p);
                setPort(p === "imap" ? "993" : "995");
              }}
              className={`rounded border px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-all ${
                protocol === p
                  ? "border-primary bg-primary text-primary-foreground shadow-neon"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-muted-foreground font-mono text-xs">Servidor</Label>
            <Input value={host} onChange={(e) => setHost(e.target.value)} placeholder={protocol === "imap" ? "imap.gmail.com" : "pop.gmail.com"} className="mt-1 bg-input border-border font-mono text-foreground placeholder:text-muted-foreground" />
          </div>
          <div>
            <Label className="text-muted-foreground font-mono text-xs">Porta</Label>
            <Input value={port} onChange={(e) => setPort(e.target.value)} className="mt-1 bg-input border-border font-mono text-foreground placeholder:text-muted-foreground" />
          </div>
        </div>
        <div>
          <Label className="text-muted-foreground font-mono text-xs">Usuário / Email</Label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="user@exemplo.com" className="mt-1 bg-input border-border font-mono text-foreground placeholder:text-muted-foreground" />
        </div>
        <div>
          <Label className="text-muted-foreground font-mono text-xs">Senha</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1 bg-input border-border font-mono text-foreground placeholder:text-muted-foreground" />
        </div>
        <Button variant="neon" onClick={runTest} disabled={status === "running" || !host || !username || !password}>
          {status === "running" ? "Testando..." : `Testar ${protocol.toUpperCase()}`}
        </Button>
      </div>
      <ResultDisplay status={status} output={output} />
    </TestCard>
  );
};

export default ImapPopTest;
