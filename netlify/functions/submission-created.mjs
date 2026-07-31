// Accuse de reception automatique des messages du formulaire de contact.
// Netlify declenche cette fonction (nom d'evenement reserve "submission-created")
// a chaque soumission de formulaire Netlify Forms.
//
// ============================================================================
// ACQUIS FONCTIONNELS -- a ne jamais perdre lors d'une refonte
// ============================================================================
// 1. ANTI-RELAIS A SPAM. Le message saisi n'est JAMAIS reinjecte dans l'email :
//    le corps est un TEXTE FIXE. Formulaire public + echo du contenu = relais a
//    spam offert au premier venu. Seul le nom saisi apparait, echappe ET borne.
// 2. TOUJOURS 200. L'accuse est un confort : toute erreur est journalisee mais
//    renvoie 200, pour ne jamais faire echouer la soumission cote Netlify.
// 3. MULTIPART. HTML et texte brut en parallele, comme tous les emails maison.
//
// ============================================================================
// CHARTE -- refonte du 31/07/2026 sur le GABARIT MAITRE
// ============================================================================
// SOURCE DE VERITE : Argos, docs/emails/GABARIT_EMAIL_MAITRE.html. La palette
// ci-dessous en est une COPIE (repos separes, aucun import possible) : toute
// evolution de charte se fait la-bas d'abord, ici ensuite. Aucune couleur hors
// de ces dix tokens n'est admise.
//
// La version precedente etait une carte ad hoc de 480 px, bordure haute or,
// « PLOUTOS » en texte, sur des gris hors palette -- fonctionnellement saine,
// visuellement etrangere aux quinze autres emails du produit.
//
// DEUX ECARTS DELIBERES AU GABARIT, tous deux par absence :
//   - PAS DE CTA. Le destinataire vient d'agir : il a ecrit. Rien n'est attendu
//     de lui, c'est nous qui devons repondre. Un bouton serait soit circulaire
//     (le renvoyer sur le site d'ou il sort), soit presomptueux -- ce formulaire
//     recoit aussi bien des questions de facturation que des prospects. Le CTA du
//     gabarit est un emplacement ; un type qui n'attend aucune action le laisse
//     legitimement vide, comme d'autres types laissent l'encadre vide.
//   - PAS DE LIEN DEMO. Meme raison : proposer un rendez-vous a quelqu'un qui
//     pose une question, c'est repondre a cote. Il aura sa reponse humaine, et le
//     lien de demo s'il s'avere que c'est ce qu'il cherchait.
// ============================================================================

// --- Palette du gabarit maitre (copie surveillee, cf. en-tete) ---------------
const MARINE = '#101B3B'; // bandeau, pied, titre, liens de corps
const OR = '#E3AF64'; // filet 4px, liseré encadré, liens du pied, ALT du logo
const OR_PALE = '#FBF3E4'; // fond de l'encadré
const TEXTE = '#3A4256'; // corps Arial
const GRIS = '#585D69'; // fonction de signature, raison de réception
const BLEU_GRIS = '#9AA4BC'; // baseline du bandeau, texte du pied sur marine
const FOND = '#F0F1F4'; // fond de page
const BLANC = '#FFFFFF'; // corps de carte
const FILET = '#E5E7EE'; // séparateur de signature

const LOGO = 'https://ploutos-cgp.fr/logo-email-ploutos.png';
const CONTACT = 'contact@ecopatrimoine-conseil.com';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Borne du nom repris dans la salutation. Le champ est libre et public : sans
 *  plafond, un nom de plusieurs milliers de caracteres produirait un email
 *  monstrueux. 80 signes couvrent tout patronyme reel. */
const NOM_MAX = 80;

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Nom exploitable pour la salutation, ou chaine vide.
 *
 * POINT UNIQUE D'ASSAINISSEMENT du seul champ libre qui entre dans l'email :
 *   - chevrons RETIRES. Aucun patronyme reel n'en contient, et les oter ici
 *     protege les DEUX faces : l'echappement HTML ne couvre pas la part texte,
 *     ou une balise resterait en clair. Inerte dans un text/plain, certes -- mais
 *     un assainissement a la source survit a une refonte qui oublierait
 *     d'echapper, ce qu'un echappement disperse ne fait pas.
 *   - apostrophes, traits d'union et accents CONSERVES (O'Brien, Jean-Luc,
 *     Muller) : l'echappement HTML s'en charge cote HTML.
 *   - espaces normalises, puis troncature AVANT echappement, pour ne jamais
 *     couper une entite au milieu.
 */
function nomPropre(value) {
  const brut = String(value == null ? '' : value)
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return brut.slice(0, NOM_MAX);
}

export function buildHtml(name) {
  const nom = nomPropre(name);
  const salutation = nom ? `Bonjour ${escapeHtml(nom)},` : 'Bonjour,';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ploutos</title>
</head>
<body style="margin:0;padding:0;background-color:${FOND};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${FOND};">
    <tr><td align="center" style="padding:28px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Bandeau marine -->
        <tr><td style="background-color:${MARINE};border-radius:10px 10px 0 0;padding:20px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="vertical-align:middle;">
              <img src="${LOGO}" width="204" height="44" alt="PLOUTOS"
                   style="display:block;width:204px;height:44px;border:0;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:bold;color:${OR};letter-spacing:1px;" />
            </td>
            <td align="right" style="vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:${BLEU_GRIS};letter-spacing:2px;text-transform:uppercase;">
              Logiciel patrimonial
            </td>
          </tr></table>
        </td></tr>

        <!-- Filet or -->
        <tr><td style="background-color:${OR};height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>

        <!-- Corps -->
        <tr><td style="background-color:${BLANC};padding:36px 40px 8px;">
          <h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:bold;color:${MARINE};line-height:1.35;">
            Message bien reçu
          </h1>
          <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:${TEXTE};">
            ${salutation}
          </p>
          <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:${TEXTE};">
            Votre message est bien arrivé et sera lu personnellement.
          </p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 26px;">
            <tr><td style="border-left:4px solid ${OR};background-color:${OR_PALE};border-radius:0 8px 8px 0;padding:16px 20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:${MARINE};">
              Réponse sous 48 h ouvrées.
            </td></tr>
          </table>

          <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:${TEXTE};">
            Si votre demande est urgente, écrivez-nous directement à <a href="mailto:${CONTACT}" style="color:${MARINE};text-decoration:underline;">${CONTACT}</a>.
          </p>
        </td></tr>

        <!-- Signature -->
        <tr><td style="background-color:${BLANC};padding:0 40px 30px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${FILET};">
            <tr><td style="padding-top:20px;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:bold;color:${MARINE};">
                David Perry
              </p>
              <p style="margin:2px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${GRIS};">
                Fondateur — Ploutos &middot; EcoPatrimoine Conseil
              </p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Pied marine -->
        <tr><td style="background-color:${MARINE};border-radius:0 0 10px 10px;padding:20px 32px;">
          <p style="margin:0 0 6px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:${BLEU_GRIS};">
            Ploutos est édité par EcoPatrimoine Conseil, SARL — RCS Perpignan 909&nbsp;388&nbsp;373
          </p>
          <p style="margin:0;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${BLEU_GRIS};">
            <a href="https://ploutos-cgp.fr" style="color:${OR};text-decoration:none;">ploutos-cgp.fr</a>
            &nbsp;&middot;&nbsp;
            <a href="https://ploutos-cgp.fr/politique-confidentialite" style="color:${OR};text-decoration:none;">Confidentialité</a>
          </p>
        </td></tr>

      </table>

      <!-- Raison de réception, hors carte -->
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="padding:16px 24px 0;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:${GRIS};">
          Vous recevez cet email car vous avez utilisé le formulaire de contact de ploutos-cgp.fr.
        </td></tr>
      </table>

    </td></tr>
  </table>
</body>
</html>`;
}

export function buildText(name) {
  const nom = nomPropre(name);
  const salutation = nom ? `Bonjour ${nom},` : 'Bonjour,';

  return [
    'PLOUTOS — Logiciel patrimonial',
    '',
    'MESSAGE BIEN REÇU',
    '',
    salutation,
    '',
    'Votre message est bien arrivé et sera lu personnellement.',
    '',
    '[ Réponse sous 48 h ouvrées. ]',
    '',
    `Si votre demande est urgente, écrivez-nous directement à ${CONTACT}.`,
    '',
    '--',
    'David Perry',
    'Fondateur — Ploutos · EcoPatrimoine Conseil',
    '',
    'Ploutos est édité par EcoPatrimoine Conseil, SARL — RCS Perpignan 909 388 373',
    'https://ploutos-cgp.fr · Confidentialité : https://ploutos-cgp.fr/politique-confidentialite',
    '',
    'Vous recevez cet email car vous avez utilisé le formulaire de contact de ploutos-cgp.fr.',
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
        reply_to: CONTACT,
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
