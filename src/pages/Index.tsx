import TcpPortTest from "@/components/TcpPortTest";
import SmtpTest from "@/components/SmtpTest";
import ImapPopTest from "@/components/ImapPopTest";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-header/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <img
            src="/junditech.png"
            alt="Logo JundiTech"
            className="h-14 w-14 rounded-xl object-contain"
          />

          <div className="min-w-0">
            <h1 className="text-xl font-extrabold tracking-tight text-white md:text-2xl">
              JundiTech <span className="text-primary">Net Tester</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Validador de conectividade de rede e e-mail
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <section className="mb-8 rounded-3xl border border-border bg-panel p-6 shadow-panel">
          <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
            Plataforma JundiTech
          </span>

          <h2 className="mb-3 text-3xl font-extrabold leading-tight text-white md:text-4xl">
            JundiTech Net Tester
          </h2>

          <p className="max-w-3xl text-base text-muted-foreground md:text-lg">
            Ferramenta para validar portas TCP/UDP/TLS, autenticação SMTP, IMAP e POP3,
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <TcpPortTest />
          <SmtpTest />
          <ImapPopTest />
        </div>
      </main>

      <footer className="border-t border-border bg-header/70 px-6 py-4 text-center">
        <p className="text-xs text-muted-foreground">
          JundiTech Net Tester v1.1
        </p>
      </footer>
    </div>
  );
};

export default Index;