import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SERVICE_MAP: Record<number, string> = {
  21: "FTP", 22: "SSH", 25: "SMTP", 53: "DNS", 80: "HTTP",
  110: "POP3", 143: "IMAP", 443: "HTTPS", 465: "SMTPS",
  587: "SMTP-TLS", 993: "IMAPS", 995: "POP3S",
  3306: "MySQL", 5432: "PostgreSQL", 8080: "HTTP-Alt",
};

async function testTcpPort(host: string, port: number, timeout = 5000): Promise<{ port: number; open: boolean; service: string }> {
  const service = SERVICE_MAP[port] || "Unknown";
  try {
    const conn = await Promise.race([
      Deno.connect({ hostname: host, port }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), timeout)),
    ]);
    (conn as Deno.Conn).close();
    return { port, open: true, service };
  } catch {
    return { port, open: false, service };
  }
}

async function testSmtp(host: string, port: number, username: string, password: string, sendTest: boolean, toEmail?: string, authMethod = "tls") {
  const result: Record<string, any> = { connected: false, authenticated: false };

  try {
    const useDirectTls = authMethod === "ssl" || port === 465;
    let conn: Deno.Conn;

    if (useDirectTls) {
      conn = await Deno.connectTls({ hostname: host, port });
      result.tlsInfo = "Conexão SSL/TLS direta estabelecida";
    } else {
      conn = await Deno.connect({ hostname: host, port });
    }
    result.connected = true;

    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    const buf = new Uint8Array(4096);

    const read = async (): Promise<string> => {
      const n = await conn.read(buf);
      return n ? decoder.decode(buf.subarray(0, n)) : "";
    };

    const write = async (cmd: string) => {
      await conn.write(encoder.encode(cmd + "\r\n"));
    };

    // Read greeting
    await read();

    // EHLO
    await write(`EHLO netprobe`);
    const ehloResp = await read();

    // STARTTLS if requested
    if (authMethod === "tls" && !useDirectTls && ehloResp.includes("STARTTLS")) {
      await write("STARTTLS");
      await read();
      conn = await Deno.startTls(conn as Deno.TcpConn, { hostname: host });
      result.tlsInfo = "STARTTLS negociado com sucesso";
      await write(`EHLO netprobe`);
      await read();
    }

    // Skip auth if method is "none"
    if (authMethod !== "none" && username && password) {
      // AUTH LOGIN
      await write("AUTH LOGIN");
      const authResp = await read();
      if (authResp.startsWith("334")) {
        await write(btoa(username));
        await read();
        await write(btoa(password));
        const passResp = await read();
        if (passResp.startsWith("235")) {
          result.authenticated = true;
        } else {
          result.authError = passResp.trim();
        }
      } else {
        // Try AUTH PLAIN
        const authStr = btoa(`\0${username}\0${password}`);
        await write(`AUTH PLAIN ${authStr}`);
        const plainResp = await read();
        if (plainResp.startsWith("235")) {
          result.authenticated = true;
        } else {
          result.authError = plainResp.trim();
        }
      }
    } else if (authMethod === "none") {
      result.authenticated = true;
    }

    // Send test email if requested
    if (result.authenticated && sendTest && toEmail) {
      try {
        const fromAddr = username || `netprobe@${host}`;
        await write(`MAIL FROM:<${fromAddr}>`);
        await read();
        await write(`RCPT TO:<${toEmail}>`);
        await read();
        await write("DATA");
        await read();
        const date = new Date().toUTCString();
        await write(
          `From: NetProbe <${fromAddr}>\r\nTo: ${toEmail}\r\nSubject: NetProbe - Teste SMTP\r\nDate: ${date}\r\n\r\nEste é um email de teste enviado pelo NetProbe.\r\n.`
        );
        const sendResp = await read();
        result.emailSent = sendResp.startsWith("250");
        if (!result.emailSent) result.sendError = sendResp.trim();
      } catch (e) {
        result.sendError = e.message;
      }
    }

    await write("QUIT");
    conn.close();
  } catch (e) {
    result.details = e.message;
  }

  return result;
}

async function testImapPop(type: "imap" | "pop3", host: string, port: number, username: string, password: string) {
  const result: Record<string, any> = { connected: false, authenticated: false };

  try {
    const useTls = port === 993 || port === 995;
    let conn: Deno.Conn;

    if (useTls) {
      conn = await Deno.connectTls({ hostname: host, port });
    } else {
      conn = await Deno.connect({ hostname: host, port });
    }
    result.connected = true;

    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    const buf = new Uint8Array(4096);

    const read = async (): Promise<string> => {
      const n = await conn.read(buf);
      return n ? decoder.decode(buf.subarray(0, n)) : "";
    };

    const write = async (cmd: string) => {
      await conn.write(encoder.encode(cmd + "\r\n"));
    };

    // Read greeting
    const greeting = await read();

    if (type === "imap") {
      // IMAP LOGIN
      await write(`a1 LOGIN "${username}" "${password}"`);
      const loginResp = await read();
      if (loginResp.includes("a1 OK")) {
        result.authenticated = true;
        // Try to get mailbox info
        await write("a2 LIST \"\" \"*\"");
        const listResp = await read();
        const folders = listResp.split("\r\n").filter((l: string) => l.includes("a2 OK") === false && l.startsWith("*")).length;
        result.mailboxInfo = `${folders} pastas encontradas`;
        await write("a3 LOGOUT");
      } else {
        result.authError = loginResp.trim();
      }
    } else {
      // POP3 USER/PASS
      await write(`USER ${username}`);
      const userResp = await read();
      if (userResp.startsWith("+OK")) {
        await write(`PASS ${password}`);
        const passResp = await read();
        if (passResp.startsWith("+OK")) {
          result.authenticated = true;
          await write("STAT");
          const statResp = await read();
          if (statResp.startsWith("+OK")) {
            const parts = statResp.trim().split(" ");
            result.mailboxInfo = `${parts[1]} mensagens, ${parts[2]} bytes`;
          }
          await write("QUIT");
        } else {
          result.authError = passResp.trim();
        }
      } else {
        result.authError = userResp.trim();
      }
    }

    conn.close();
  } catch (e) {
    result.details = e.message;
  }

  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { type } = body;

    let result;
    switch (type) {
      case "tcp": {
        const { host, ports } = body;
        const results = await Promise.all(ports.map((p: number) => testTcpPort(host, p)));
        result = { results };
        break;
      }
      case "smtp": {
        const { host, port, username, password, sendTest, toEmail } = body;
        result = await testSmtp(host, port, username, password, sendTest, toEmail);
        break;
      }
      case "imap":
      case "pop3": {
        const { host, port, username, password } = body;
        result = await testImapPop(type, host, port, username, password);
        break;
      }
      default:
        throw new Error("Tipo de teste inválido");
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
