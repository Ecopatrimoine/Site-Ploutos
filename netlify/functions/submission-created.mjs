// Accuse de reception automatique des messages du formulaire de contact.
// Netlify declenche cette fonction (nom d'evenement reserve "submission-created")
// a chaque soumission de formulaire Netlify Forms.
//
// Regle anti-abus : le corps de l'accuse est un TEXTE FIXE. Le message saisi par
// l'utilisateur n'est JAMAIS reinjecte dans l'email (formulaire public + echo du
// contenu = relais a spam). Seul le prenom/nom est repris, echappe, pour la salutation.
//
// L'accuse est un confort : toute erreur d'envoi est journalisee mais renvoie 200,
// pour ne jamais faire echouer la soumission cote Netlify.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildHtml(name) {
  const safe = escapeHtml(name).trim();
  const hello = safe ? `Bonjour ${safe},` : 'Bonjour,';
  return `<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Arial,Helvetica,sans-serif;color:#101B3B;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#ffffff;border-radius:16px;border-top:4px solid #E3AF64;box-shadow:0 8px 32px rgba(16,27,59,0.08);">
        <tr><td style="padding:32px 32px 26px;">
          <div style="font-size:22px;font-weight:900;letter-spacing:1px;color:#101B3B;margin-bottom:24px;">PLOUTOS</div>
          <p style="font-size:16px;line-height:1.6;margin:0 0 16px;color:#101B3B;">${hello}</p>
          <p style="font-size:15px;line-height:1.7;margin:0 0 16px;color:#444444;">Votre message est bien arrivé. Nous vous répondons sous 48&nbsp;h ouvrées.</p>
          <p style="font-size:14px;line-height:1.7;margin:0 0 24px;color:#666666;">En cas d'urgence : <a href="mailto:contact@ecopatrimoine-conseil.com" style="color:#26428B;text-decoration:none;">contact@ecopatrimoine-conseil.com</a></p>
          <p style="font-size:14px;line-height:1.6;margin:0 0 20px;color:#101B3B;">— L'équipe Ploutos · EcoPatrimoine Conseil</p>
          <a href="https://ploutos-cgp.fr" style="color:#26428B;font-size:13px;text-decoration:none;">ploutos-cgp.fr</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildText(name) {
  const trimmed = String(name == null ? '' : name).trim();
  const hello = trimmed ? `Bonjour ${trimmed},` : 'Bonjour,';
  return [
    hello,
    '',
    'Votre message est bien arrivé. Nous vous répondons sous 48 h ouvrées.',
    '',
    "En cas d'urgence : contact@ecopatrimoine-conseil.com",
    '',
    '— L\'équipe Ploutos · EcoPatrimoine Conseil',
    'ploutos-cgp.fr',
  ].join('\n');
}

export const handler = async (event) => {
  let payload;
  try {
    payload = JSON.parse(event.body).payload;
  } catch (err) {
    console.log('submission-created: corps illisible', err);
    return { statusCode: 200 };
  }

  // Ne traiter que le formulaire de contact ; sinon 200 silencieux.
  if (!payload || payload.form_name !== 'contact') {
    return { statusCode: 200 };
  }

  const data = payload.data || {};
  const email = String(data.email == null ? '' : data.email).trim();
  const name = data.name;

  // Validation sommaire de l'email ; sinon 200 silencieux.
  if (!EMAIL_RE.test(email)) {
    return { statusCode: 200 };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('submission-created: RESEND_API_KEY absente, accuse non envoye');
    return { statusCode: 200 };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Ploutos <contact@ploutos-cgp.fr>',
        to: email,
        reply_to: 'contact@ecopatrimoine-conseil.com',
        subject: 'Nous avons bien reçu votre message — Ploutos',
        html: buildHtml(name),
        text: buildText(name),
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.log('submission-created: envoi Resend en echec', res.status, detail);
    }
  } catch (err) {
    console.log('submission-created: erreur reseau Resend', err);
  }

  // Confort uniquement : toujours 200.
  return { statusCode: 200 };
};
