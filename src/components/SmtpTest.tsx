import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TestCard from "./TestCard";
import ResultDisplay, { TestStatus } from "./ResultDisplay";
import { supabase } from "@/integrations/supabase/client";

const AUTH_METHODS = [
  { value: "tls", label: "STARTTLS", defaultPort: "587" },
  { value: "ssl", label: "SSL/TLS", defaultPort: "465" },
  { value: "plain", label: "Texto Plano (sem criptografia)", defaultPort: "25" },
  { value: "none", label: "Sem autenticação", defaultPort: "25" },
];

const SmtpTest = () => {
  const [host, setHost] = useState("");
  const [port, setPort] = useState("587");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [sendTest, setSendTest] = useState(false);
  const [authMethod, setAuthMethod] = useState("tls");
  const [status, setStatus] = useState<TestStatus>("idle");
  const [output, setOutput] = useState<string[]>([]);

  const handleAuthMethodChange = (value: string) => {
    setAuthMethod(value);
    const method = AUTH_METHODS.find((m) => m.value === value);
    if (method) setPort(method.defaultPort);
  };

  const needsCredentials = authMethod !== "none";

  const runTest = async () => {
    if (!host || (needsCredentials && (!username || !password))) return;
    setStatus("running");
    setOutput([`> Conectando ao SMTP ${host}:${port} (${AUTH_METHODS.find(m => m.value === authMethod)?.label})...`]);

    try {
      const { data, error } = await supabase.functions.invoke("network-test", {
        body: {
          type: "smtp",
          host,
          port: parseInt(port),
          username: needsCredentials ? username : "",
          password: needsCredentials ? password : "",
          authMethod,
          sendTest: sendTest && toEmail ? true : false,
          toEmail: sendTest ? toEmail : undefined,
        },
      });

      if (error) throw error;

      const lines: string[] = [];
      if (data.connected) lines.push("[OK] Conexão SMTP estabelecida");
      else lines.push("[ERRO] Falha na conexão SMTP");

      if (needsCredentials) {
        if (data.authenticated) lines.push("[OK] Autenticação bem-sucedida");
        else if (data.authError) lines.push(`[ERRO] Falha na autenticação: ${data.authError}`);
      }

      if (data.emailSent) lines.push(`[OK] Email de teste enviado para ${toEmail}`);
      else if (data.sendError) lines.push(`[ERRO] Falha ao enviar: ${data.sendError}`);

      if (data.tlsInfo) lines.push(`[INFO] ${data.tlsInfo}`);
      if (data.details) lines.push(`[INFO] ${data.details}`);

      setOutput((prev) => [...prev, ...lines]);
      setStatus(data.connected && (needsCredentials ? data.authenticated : true) ? "success" : "error");
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
            <Label className="text-muted-foreground font-mono text-xs">Usuário {needsCredentials && <span className="text-primary">*</span>}</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="user@exemplo.com" className="mt-1 bg-input border-border font-mono text-foreground placeholder:text-muted-foreground" disabled={!needsCredentials} />
          </div>
          <div>
            <Label className="text-muted-foreground font-mono text-xs">Senha {needsCredentials && <span className="text-primary">*</span>}</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1 bg-input border-border font-mono text-foreground placeholder:text-muted-foreground" disabled={!needsCredentials} />
          </div>
        </div>
        <div>
          <Label className="text-muted-foreground font-mono text-xs">Email de contato</Label>
          <Input value={toEmail} onChange={(e) => { setToEmail(e.target.value); if (e.target.value) setSendTest(true); else setSendTest(false); }} placeholder="destino@exemplo.com" className="mt-1 bg-input border-border font-mono text-foreground placeholder:text-muted-foreground" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-muted-foreground font-mono text-xs">Autenticação</Label>
            <Select value={authMethod} onValueChange={handleAuthMethodChange}>
              <SelectTrigger className="mt-1 bg-input border-border font-mono text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AUTH_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-muted-foreground font-mono text-xs">Porta</Label>
            <Input value={port} onChange={(e) => setPort(e.target.value)} placeholder="587" className="mt-1 bg-input border-border font-mono text-foreground placeholder:text-muted-foreground" />
          </div>
        </div>
        <div>
          <Label className="text-muted-foreground font-mono text-xs">Server Host <span className="text-primary">*</span></Label>
          <Input value={host} onChange={(e) => setHost(e.target.value)} placeholder="smtp.gmail.com" className="mt-1 bg-input border-border font-mono text-foreground placeholder:text-muted-foreground" />
        </div>
        <Button variant="neon" onClick={runTest} disabled={status === "running" || !host || (needsCredentials && (!username || !password))}>
          {status === "running" ? "Testando..." : "Testar Conexão"}
        </Button>
      </div>
      <ResultDisplay status={status} output={output} />
    </TestCard>
  );
};

export default SmtpTest;
