import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TestCard from "./TestCard";
import ResultDisplay, { TestStatus } from "./ResultDisplay";
import { supabase } from "@/integrations/supabase/client";

const SmtpTest = () => {
  const [host, setHost] = useState("");
  const [port, setPort] = useState("587");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [sendTest, setSendTest] = useState(false);
  const [status, setStatus] = useState<TestStatus>("idle");
  const [output, setOutput] = useState<string[]>([]);

  const runTest = async () => {
    if (!host || !username || !password) return;
    setStatus("running");
    setOutput([`> Conectando ao SMTP ${host}:${port}...`]);

    try {
      const { data, error } = await supabase.functions.invoke("network-test", {
        body: {
          type: "smtp",
          host,
          port: parseInt(port),
          username,
          password,
          sendTest: sendTest && toEmail ? true : false,
          toEmail: sendTest ? toEmail : undefined,
        },
      });

      if (error) throw error;

      const lines: string[] = [];
      if (data.connected) lines.push("[OK] Conexão SMTP estabelecida");
      else lines.push("[ERRO] Falha na conexão SMTP");

      if (data.authenticated) lines.push("[OK] Autenticação bem-sucedida");
      else if (data.authError) lines.push(`[ERRO] Falha na autenticação: ${data.authError}`);

      if (data.emailSent) lines.push(`[OK] Email de teste enviado para ${toEmail}`);
      else if (data.sendError) lines.push(`[ERRO] Falha ao enviar: ${data.sendError}`);

      if (data.details) lines.push(`[INFO] ${data.details}`);

      setOutput((prev) => [...prev, ...lines]);
      setStatus(data.connected && data.authenticated ? "success" : "error");
    } catch (e: any) {
      setOutput((prev) => [...prev, `[ERRO] ${e.message}`]);
      setStatus("error");
    }
  };

  return (
    <TestCard title="Teste SMTP" icon={<Mail size={20} />}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-muted-foreground font-mono text-xs">Servidor SMTP</Label>
            <Input value={host} onChange={(e) => setHost(e.target.value)} placeholder="smtp.gmail.com" className="mt-1 bg-input border-border font-mono text-foreground placeholder:text-muted-foreground" />
          </div>
          <div>
            <Label className="text-muted-foreground font-mono text-xs">Porta</Label>
            <Input value={port} onChange={(e) => setPort(e.target.value)} placeholder="587" className="mt-1 bg-input border-border font-mono text-foreground placeholder:text-muted-foreground" />
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
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={sendTest} onChange={(e) => setSendTest(e.target.checked)} className="accent-primary" id="send-test" />
          <Label htmlFor="send-test" className="text-muted-foreground font-mono text-xs cursor-pointer">Enviar email de teste</Label>
        </div>
        {sendTest && (
          <div>
            <Label className="text-muted-foreground font-mono text-xs">Destinatário</Label>
            <Input value={toEmail} onChange={(e) => setToEmail(e.target.value)} placeholder="destino@exemplo.com" className="mt-1 bg-input border-border font-mono text-foreground placeholder:text-muted-foreground" />
          </div>
        )}
        <Button variant="neon" onClick={runTest} disabled={status === "running" || !host || !username || !password}>
          {status === "running" ? "Testando..." : "Testar SMTP"}
        </Button>
      </div>
      <ResultDisplay status={status} output={output} />
    </TestCard>
  );
};

export default SmtpTest;
