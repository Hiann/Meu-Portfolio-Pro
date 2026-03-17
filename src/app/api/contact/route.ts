import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

/**
 * ─── API DE COMUNICAÇÃO DEV.SYS ──────────────────────────────────────────────
 * Rota segura para processamento e envio de payloads de contato via Nodemailer.
 * Arquitetura de email baseada em "Bulletproof Table Design" para compatibilidade
 * universal e injeção de Smart Reply automatizado (Pop-up nativo).
 */

export async function POST(req: NextRequest) {
  try {
    // 1. Extração e Validação do Payload
    // Recebe os dados em formato JSON vindos do formulário no frontend (page.tsx).
    const { name, email, msg } = await req.json();

    // Verificação de segurança: impede que envios vazios travem o servidor ou mandem spam.
    if (!name || !email || !msg) {
      return NextResponse.json(
        { error: "SYSTEM_ERR: Parâmetros obrigatórios ausentes no payload." },
        { status: 400 } // Retorna Bad Request
      );
    }

    // 2. Configuração do Transporte Seguro (SMTP)
    // Inicializa o Nodemailer usando as credenciais do Gmail configuradas no .env.local
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465, // Porta para conexão segura SSL
      secure: true,
      auth: {
        user: process.env.GMAIL_USER, // O e-mail que vai realizar os envios
        pass: process.env.GMAIL_PASS, // A senha de aplicativo gerada no painel do Google
      },
    });

    // 3. Processamento de Metadados e Telemetria
    // Captura o momento exato do envio para registrar nos logs do e-mail.
    const now = new Date();
    
    // Formatação de Data e Hora (Padrão ISO/BR) - Para exibir bonitinho na mensagem recebida.
    const dateFormatted = now.toLocaleDateString("pt-BR", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    const timeFormatted = now.toLocaleTimeString("pt-BR", {
      hour: "2-digit", minute: "2-digit", timeZoneName: "short",
    });
    
    // Geração de Identificadores Únicos (Apenas para uso interno)
    // Cria um ID de referência visual para simular o estilo de "Sistema Log".
    const hash = Math.random().toString(36).slice(2, 8).toUpperCase();
    const msgId = `SYS-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${hash}`;
    
    // Telemetria: Conta quantas palavras a mensagem tem para calcular o tempo de leitura.
    const wordCount = msg.trim().split(/\s+/).length;
    // Cálculo estimado de leitura (base em 200 palavras por minuto).
    const readTimeSecs = Math.max(1, Math.ceil((wordCount / 200) * 60));
    const readTimeStr = readTimeSecs > 60 ? `${Math.ceil(readTimeSecs / 60)} min` : `${readTimeSecs} seg`;

    // Higienização de Segurança (XSS Prevention) para o HTML
    // Substitui caracteres que podem quebrar o HTML do e-mail, como as chaves de tags (< e >).
    // Transforma quebras de linha normais do textarea (\n) em quebras do HTML (<br/>).
    const safeMsg = msg
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br/>");

    // 4. ENGINE DE RESPOSTA INTELIGENTE (Smart Reply - Padrão Corporativo)
    // Prepara o corpo do rascunho de resposta que o Gmail vai abrir quando clicar no botão do email.
    const replySubject = `Resposta: Contato via Portfólio — Hiann Alexander`;
    
    // Corpo da resposta limpo, formatando a mensagem anterior como citação nativa (>)
    const replyBodyText = `Olá, ${name.split(' ')[0]}!

Recebi sua mensagem através do meu portfólio e agradeço muito pelo contato.

[ Escreva sua resposta ou proposta aqui... ]

Fico à disposição para conversarmos.

Atenciosamente,

Hiann Alexander
Python Dev · Backend · IA
https://linkedin.com/in/hiann-alexander

───────────────────────────────────────────
Em ${dateFormatted} às ${timeFormatted}, ${name} <${email}> escreveu:

> ${msg.split('\n').join('\n> ')}`; // Injeta um '>' no começo de todas as linhas da msg original

    // ── MÁGICA AQUI: Usar 'mailto:' puro força o pop-up interno do Gmail ──
    // Codificamos tudo (encodeURIComponent) para que a URL suporte espaços e quebras de linha sem quebrar o link no navegador.
    const mailtoDirectLink = `mailto:${email}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyBodyText)}`;

    // 5. Construção da Interface do Email Interno (HTML/CSS Inline Strict)
    // O template do e-mail! É feito apenas com tabelas porque clientes como Outlook não suportam Flexbox ou Grid.
    const html = `<!DOCTYPE html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <meta name="x-apple-disable-message-reformatting"/>
  <meta name="color-scheme" content="dark"/>
  <meta name="supported-color-schemes" content="dark"/>
  <title>Transmissão DEV.SYS — ${msgId}</title>
  <style>
    /* CSS Base de fallback */
    body, table, td, p, a { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; }
    .mono { font-family: 'Courier New', Courier, monospace !important; }
    body { margin: 0; padding: 0; background-color: #050505; -webkit-font-smoothing: antialiased; }
    table { border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    a { text-decoration: none; }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#050505; min-width:100%;">

  <div style="display:none; font-size:1px; color:#050505; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
    🚨 Nova solicitação de contato recebida de ${name} (${email}). Leia os dados completos da transmissão. &nbsp;&#8203;&zwnj;&nbsp;&#8203;&zwnj;&nbsp;&#8203;&zwnj;&nbsp;&#8203;&zwnj;
  </div>

  <table width="100%" bgcolor="#050505" cellpadding="0" cellspacing="0" role="presentation" style="padding: 40px 10px;">
    <tr>
      <td align="center">
        
        <table width="600" bgcolor="#0a0a0a" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px; width:100%; border:1px solid #1e293b;">
          
          <tr>
            <td style="padding: 12px 24px; border-bottom: 1px solid #1e293b; background-color: #030303;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td width="50" align="left" style="vertical-align:middle;">
                    <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:#ef4444; margin-right:4px;"></span>
                    <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:#eab308; margin-right:4px;"></span>
                    <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:#22c55e;"></span>
                  </td>
                  <td align="center" style="vertical-align:middle;">
                    <span class="mono" style="font-size:10px; font-weight:bold; color:#e07c1a; letter-spacing:0.3em; text-transform:uppercase;">
                      DEV.SYS // SECURE_LINK
                    </span>
                  </td>
                  <td width="50" align="right" style="vertical-align:middle;">
                    <span class="mono" style="font-size:10px; color:#475569;">v2.8</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background-color: #e07c1a; padding: 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td>
                    <p class="mono" style="margin:0 0 12px 0; font-size:10px; font-weight:bold; color:#ffffff; background-color:rgba(0,0,0,0.2); display:inline-block; padding:4px 10px; letter-spacing:0.1em;">
                      [ STATUS: NOVA TRANSMISSÃO ]
                    </p>
                    <h1 style="margin:0; font-size:32px; font-weight:800; color:#111827; letter-spacing:-0.03em; line-height:1.1;">
                      Conexão Recebida
                    </h1>
                    <p style="margin:12px 0 0 0; font-size:14px; color:#ffffff; font-weight:500;">
                      Remetente validado: <span style="font-weight:700; color:#111827;">${email}</span>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 0;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#070707;">
                <tr>
                  <td width="50%" valign="top" style="padding: 24px; border-right:1px solid #1e293b; border-bottom:1px solid #1e293b;">
                    <p class="mono" style="margin:0 0 6px 0; font-size:9px; color:#6b7280; text-transform:uppercase; letter-spacing:0.15em;">Nome do Contato</p>
                    <p style="margin:0; font-size:15px; color:#ffffff; font-weight:bold;">${name}</p>
                  </td>
                  <td width="50%" valign="top" style="padding: 24px; border-bottom:1px solid #1e293b;">
                    <p class="mono" style="margin:0 0 6px 0; font-size:9px; color:#6b7280; text-transform:uppercase; letter-spacing:0.15em;">Ação Direta</p>
                    <p style="margin:0; font-size:13px;">
                      <a href="${mailtoDirectLink}" style="color:#e07c1a; font-weight:bold; word-break:break-all;">Responder via Gmail ↗</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td width="50%" valign="top" style="padding: 24px; border-right:1px solid #1e293b;">
                    <p class="mono" style="margin:0 0 6px 0; font-size:9px; color:#6b7280; text-transform:uppercase; letter-spacing:0.15em;">Timestamp (Local)</p>
                    <p class="mono" style="margin:0; font-size:11px; color:#cbd5e1;">${dateFormatted}<br/>${timeFormatted}</p>
                  </td>
                  <td width="50%" valign="top" style="padding: 24px;">
                    <p class="mono" style="margin:0 0 6px 0; font-size:9px; color:#6b7280; text-transform:uppercase; letter-spacing:0.15em;">Análise de Payload</p>
                    <p class="mono" style="margin:0; font-size:11px; color:#cbd5e1;">
                      <span style="color:#22c55e;">✔</span> ${wordCount} Palavras<br/>
                      <span style="color:#3b82f6;">⏱</span> ~${readTimeStr}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="border-left: 4px solid #e07c1a; background-color: #030303; padding: 24px;">
                    <p class="mono" style="margin:0 0 16px 0; font-size:10px; font-weight:bold; color:#475569; letter-spacing:0.1em; text-transform:uppercase;">
                      --- INÍCIO DA MENSAGEM ---
                    </p>
                    <div style="font-size:15px; color:#e2e8f0; line-height:1.7;">
                      ${safeMsg}
                    </div>
                    <p class="mono" style="margin:16px 0 0 0; font-size:10px; font-weight:bold; color:#475569; letter-spacing:0.1em; text-transform:uppercase;">
                      --- FIM DA MENSAGEM ---
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 0 30px 50px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center">
                    
                    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;">
                      <tr>
                        <td align="center" bgcolor="#e07c1a" style="border-radius: 2px;">
                          <a href="${mailtoDirectLink}" 
                             style="display:inline-block; font-family:'Courier New', monospace; font-size:13px; font-weight:bold; letter-spacing:0.15em; color:#ffffff; padding:18px 40px; border:1px solid #e07c1a; text-transform:uppercase; text-decoration:none;">
                            Responder de forma profissional ↗
                          </a>
                        </td>
                      </tr>
                    </table>

                    

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 30px; border-top: 1px solid #1e293b; background-color: #020202;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td width="50%" align="left" valign="top">
                    <p class="mono" style="margin:0 0 4px 0; font-size:9px; color:#475569; text-transform:uppercase;">
                      System ID
                    </p>
                    <p class="mono" style="margin:0; font-size:10px; color:#94a3b8; font-weight:bold;">
                      ${msgId}
                    </p>
                  </td>
                  <td width="50%" align="right" valign="top">
                    <p class="mono" style="margin:0 0 4px 0; font-size:9px; color:#475569; text-transform:uppercase;">
                      Segurança
                    </p>
                    <p class="mono" style="margin:0; font-size:10px; color:#22c55e;">
                      ROUTED VIA DEV.SYS
                    </p>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" align="center" style="padding-top:20px;">
                    <p class="mono" style="margin:0; font-size:8px; color:#334155; letter-spacing:0.1em; text-transform:uppercase;">
                      © ${now.getFullYear()} Hiann Alexander. Email gerado automaticamente pelo Next.js.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td style="height: 4px; background-color: #e07c1a;"></td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

    // 6. Execução do Envio (O Nodemailer tenta se conectar com os servidores do google e disparar)
    await transporter.sendMail({
      // Como aparecerá na sua lista de e-mails, simulando que veio do contato mas enviado pelo sistema
      from: `"${name} (Portfólio)" <${process.env.GMAIL_USER}>`, 
      to: "hiannpdr1234@gmail.com",
      replyTo: email,
      subject: `Nova mensagem de: ${email} [DEV.SYS]`,
      html,
    });

    // Confirma para o page.tsx do site que tudo deu certo, liberando o botão de check verde
    return NextResponse.json({ ok: true, id: msgId });

  } catch (err) {
    // Se o Google bloquear ou houver erro no .env.local, ele registra no console do server e retorna erro para o site.
    console.error("[DEV.SYS] Email Routing Error:", err);
    return NextResponse.json(
      { error: "SYSTEM_ERR: Falha crítica na rota de email SMTP." },
      { status: 500 }
    );
  }
}