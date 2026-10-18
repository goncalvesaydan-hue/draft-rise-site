import "server-only";

export type AccessCodeNotificationParams = {
  email: string;
  clientName: string;
  companyName: string;
  code: string;
  intakeId: string;
};

export type SubmissionNotificationParams = {
  intakeId: string;
  reference: string;
  clientName: string;
  companyName: string;
  clientEmail: string;
  answers: Record<string, any>;
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const TEAM_NOTIFICATION_EMAIL =
  process.env.PORTAL_NOTIFICATION_EMAIL ||
  process.env.PORTAL_TEAM_EMAIL ||
  "geral@draftandrise.com";

const RESEND_FROM =
  process.env.RESEND_FROM ||
  process.env.PORTAL_FROM_EMAIL ||
  "Draft & Rise <notificacoes@draftandrise.com>";

/**
 * Sends an email using Resend API (via native fetch, zero dependencies).
 */
async function sendWithResend(options: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[Email Resend Error]", res.status, errorText);
      return { ok: false, error: errorText };
    }

    return { ok: true };
  } catch (err: any) {
    console.error("[Email Resend Network Error]", err);
    return { ok: false, error: err?.message || String(err) };
  }
}

/**
 * Notification 1: Sent to geral@draftandrise.com when a client requests access or when a code is generated.
 */
export async function sendAccessCodeNotification(
  params: AccessCodeNotificationParams,
): Promise<{ ok: boolean; error?: string }> {
  const appUrl = (process.env.PORTAL_APP_URL || "https://draftandrise.com").replace(/\/$/, "");
  const directClientLink = `${appUrl}/acesso?email=${encodeURIComponent(params.email)}&code=${encodeURIComponent(params.code)}`;
  const teamLink = `${appUrl}/acesso?tab=team`;

  // Log remedio por motivos de segurança - evitar divulgação de códigos de acesso
  // console.log(
  //   `[Portal Auth Code] Código de 6 dígitos gerado: ${params.code} para ${params.email} (${params.companyName})`,
  // );

  const subject = `[Draft & Rise] Novo Código WhatsApp: ${params.code} · ${params.companyName || params.email}`;

  const html = `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8">
  <title>Novo Código de Acesso WhatsApp</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F4F2EC; margin: 0; padding: 24px 16px; color: #162025; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E3E0D6; }
    .header { background: #162025; padding: 28px 32px; color: #ffffff; }
    .brand { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .brand-sub { font-size: 13px; color: #9BA3AF; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .content { padding: 32px; }
    .badge { display: inline-block; background: #FFF4EE; color: #FF6B35; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 16px; border: 1px solid #FFE2D4; }
    .title { font-size: 20px; font-weight: 700; margin: 0 0 16px 0; color: #162025; }
    .code-box { background: #F4F2EC; border: 2px dashed #FF6B35; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .code-label { font-size: 12px; color: #64707D; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-bottom: 8px; }
    .code-number { font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #162025; font-family: monospace; }
    .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .info-table td { padding: 8px 0; font-size: 14px; border-bottom: 1px solid #F0EEE6; }
    .info-label { color: #64707D; width: 140px; font-weight: 500; }
    .info-val { color: #162025; font-weight: 600; }
    .actions { margin-top: 28px; }
    .btn { display: inline-block; background: #FF6B35; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 14px; text-align: center; }
    .btn-secondary { display: inline-block; background: #162025; color: #ffffff !important; text-decoration: none; padding: 12px 20px; border-radius: 10px; font-weight: 600; font-size: 14px; margin-left: 10px; text-align: center; }
    .footer { background: #F9F8F5; padding: 20px 32px; font-size: 12px; color: #8A94A0; text-align: center; border-top: 1px solid #EAE7DC; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">draft&rise.</div>
      <div class="brand-sub">Portal Privado · WhatsApp Business AI (Meta Oficial)</div>
    </div>
    <div class="content">
      <div class="badge">Novo Pedido de Acesso</div>
      <h2 class="title">Código de 6 Dígitos Solicitado</h2>
      <p style="font-size: 14px; color: #4A5568; line-height: 1.5;">
        Um cliente solicitou acesso ao questionário técnico para onboarding do Bot WhatsApp Oficial. Podes enviar o código de 6 dígitos abaixo ou o link direto via WhatsApp:
      </p>

      <div class="code-box">
        <div class="code-label">Código de Entrada do Cliente</div>
        <div class="code-number">${params.code}</div>
      </div>

      <table class="info-table">
        <tr>
          <td class="info-label">Empresa:</td>
          <td class="info-val">${escapeHtml(params.companyName || "Não especificada")}</td>
        </tr>
        <tr>
          <td class="info-label">Pessoa de Contacto:</td>
          <td class="info-val">${escapeHtml(params.clientName || "Não especificada")}</td>
        </tr>
        <tr>
          <td class="info-label">E-mail:</td>
          <td class="info-val">${escapeHtml(params.email)}</td>
        </tr>
        <tr>
          <td class="info-label">Validade:</td>
          <td class="info-val">24 Horas</td>
        </tr>
      </table>

      <div class="actions">
        <a href="${directClientLink}" class="btn">Abrir Acesso com Código Preenchido</a>
        <a href="${teamLink}" class="btn-secondary">Painel da Equipa</a>
      </div>
    </div>
    <div class="footer">
      Draft & Rise · Documento Interno e Confidencial<br>
      Notificação gerada automaticamente pelo Portal WhatsApp Business AI.
    </div>
  </div>
</body>
</html>
  `;

  if (process.env.RESEND_API_KEY) {
    return sendWithResend({
      to: [params.email, TEAM_NOTIFICATION_EMAIL].filter(Boolean),
      subject,
      html,
    });
  }

  return { ok: true };
}

/**
 * Notification 2: Sent when client completes and submits the questionnaire.
 */
export async function sendSubmissionNotification(
  params: SubmissionNotificationParams,
): Promise<{ ok: boolean; error?: string }> {
  const appUrl = (process.env.PORTAL_APP_URL || "https://draftandrise.com").replace(/\/$/, "");
  const teamLink = `${appUrl}/equipa`;

  const subject = `[Draft & Rise] Questionário Concluído: ${params.companyName || params.clientEmail} (${params.reference})`;

  const html = `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8">
  <title>Questionário WhatsApp Submetido</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F4F2EC; margin: 0; padding: 24px 16px; color: #162025; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E3E0D6; }
    .header { background: #162025; padding: 28px 32px; color: #ffffff; }
    .brand { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .brand-sub { font-size: 13px; color: #9BA3AF; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .content { padding: 32px; }
    .badge-success { display: inline-block; background: #E6F4EA; color: #137333; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 16px; border: 1px solid #CEEAD6; }
    .title { font-size: 20px; font-weight: 700; margin: 0 0 16px 0; color: #162025; }
    .ref-box { background: #F4F2EC; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0; }
    .ref-code { font-size: 22px; font-weight: 800; color: #162025; letter-spacing: 1px; }
    .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .info-table td { padding: 8px 0; font-size: 14px; border-bottom: 1px solid #F0EEE6; }
    .info-label { color: #64707D; width: 140px; font-weight: 500; }
    .info-val { color: #162025; font-weight: 600; }
    .btn { display: inline-block; background: #FF6B35; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 14px; text-align: center; margin-top: 20px; }
    .footer { background: #F9F8F5; padding: 20px 32px; font-size: 12px; color: #8A94A0; text-align: center; border-top: 1px solid #EAE7DC; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">draft&rise.</div>
      <div class="brand-sub">Portal Privado · WhatsApp Business AI</div>
    </div>
    <div class="content">
      <div class="badge-success">Questionário Submetido com Sucesso</div>
      <h2 class="title">Novo Questionário Pronto para Treino</h2>
      <p style="font-size: 14px; color: #4A5568; line-height: 1.5;">
        O cliente concluiu e submeteu todas as etapas do questionário técnico do Bot WhatsApp Oficial da Meta. Todos os dados já estão disponíveis no painel da equipa para exportar o Markdown de treino e configurar o agente.
      </p>

      <div class="ref-box">
        <div style="font-size: 12px; color: #64707D; margin-bottom: 4px;">Referência da Ficha</div>
        <div class="ref-code">${params.reference}</div>
      </div>

      <table class="info-table">
        <tr>
          <td class="info-label">Empresa:</td>
          <td class="info-val">${escapeHtml(params.companyName || "—")}</td>
        </tr>
        <tr>
          <td class="info-label">Contacto:</td>
          <td class="info-val">${escapeHtml(params.clientName || "—")}</td>
        </tr>
        <tr>
          <td class="info-label">E-mail:</td>
          <td class="info-val">${escapeHtml(params.clientEmail)}</td>
        </tr>
      </table>

      <a href="${teamLink}" class="btn">Abrir Painel da Equipa & Descarregar Markdown</a>
    </div>
    <div class="footer">
      Draft & Rise · Equipa de Suporte & Engenharia WhatsApp<br>
      geral@draftandrise.com
    </div>
  </div>
</body>
</html>
  `;

  if (process.env.RESEND_API_KEY) {
    return sendWithResend({
      to: [TEAM_NOTIFICATION_EMAIL, params.clientEmail].filter(Boolean),
      subject,
      html,
    });
  }

  return { ok: true };
}

