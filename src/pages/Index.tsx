import { Terminal, Wifi } from "lucide-react";
import TcpPortTest from "@/components/TcpPortTest";
import SmtpTest from "@/components/SmtpTest";
import ImapPopTest from "@/components/ImapPopTest";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-mono">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="flex items-center gap-2 text-primary">
            <Terminal size={24} />
            <Wifi size={18} className="animate-pulse" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              NetProbe<span className="text-primary">_</span>
            </h1>
            <p className="text-xs text-muted-foreground">Validador de Conexões de Rede</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl p-6">
        <div className="mb-6 rounded border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            <span className="text-primary">$</span> Ferramenta para testar conectividade TCP, autenticação SMTP/IMAP/POP3 e envio de emails de teste.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <TcpPortTest />
          <SmtpTest />
          <ImapPopTest />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-3 text-center">
        <p className="font-mono text-xs text-muted-foreground">
          NetProbe v1.0 — Todos os testes executados via conexão segura
        </p>
      </footer>
    </div>
  );
};

export default Index;
