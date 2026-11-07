// Inscription Ploutos — creation de compte uniquement.
// La connexion et la reinitialisation de mot de passe se font sur app.ploutos-cgp.fr.

const SUPABASE_URL = 'https://ysbgfiqsuvdwzkcsiqir.supabase.co';
// Cle anon publique (exposition normale cote client, protegee par les policies RLS).
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzYmdmaXFzdXZkd3prY3NpcWlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MDMxODEsImV4cCI6MjA4OTA3OTE4MX0.eZInj2uw44jmI6OnWz9fll301x5eBq_1LSQTbMyJtj4';

// Jeton Turnstile courant (renseigne par le widget via ses callbacks data-*).
let turnstileToken = null;

// Message d'etat statique : bord gauche, fond teinte, pictogramme, mot en gras, phrase.
// type : 'error' (Erreur), 'success' (Compte cree), 'antirobot' (Anti-robot, a completer),
// 'antirobot-erreur' (Anti-robot, echec de la verification).
const ETATS_MSG = {
  error:              { etat: 'bloque',     role: 'alert',  mot: 'Erreur',      picto: 'cadenas' },
  success:            { etat: 'pret',       role: 'status', mot: 'Compte créé', picto: 'coche' },
  antirobot:          { etat: 'acompleter', role: 'status', mot: 'Anti-robot',  picto: 'cercle' },
  'antirobot-erreur': { etat: 'bloque',     role: 'alert',  mot: 'Anti-robot',  picto: 'cadenas' }
};
const PICTOS_MSG = {
  coche: [['path', { d: 'M20 6 9 17l-5-5' }]],
  cercle: [
    ['path', { d: 'M10.1 2.182a10 10 0 0 1 3.8 0' }], ['path', { d: 'M13.9 21.818a10 10 0 0 1-3.8 0' }],
    ['path', { d: 'M17.609 3.721a10 10 0 0 1 2.69 2.7' }], ['path', { d: 'M2.182 13.9a10 10 0 0 1 0-3.8' }],
    ['path', { d: 'M20.279 17.609a10 10 0 0 1-2.7 2.69' }], ['path', { d: 'M21.818 10.1a10 10 0 0 1 0 3.8' }],
    ['path', { d: 'M3.721 6.391a10 10 0 0 1 2.7-2.69' }], ['path', { d: 'M6.391 20.279a10 10 0 0 1-2.69-2.7' }]
  ],
  cadenas: [['rect', { width: '18', height: '11', x: '3', y: '11', rx: '2', ry: '2' }], ['path', { d: 'M7 11V7a5 5 0 0 1 10 0v4' }]]
};
function buildMsg(text, type, parts) {
  const cfg = ETATS_MSG[type] || ETATS_MSG.error;
  const box = document.createElement('div');
  box.className = 'msg';
  box.setAttribute('data-etat', cfg.etat);
  box.setAttribute('role', cfg.role);
  const ico = document.createElement('span');
  ico.className = 'msg-i';
  ico.setAttribute('aria-hidden', 'true');
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  const attrs = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', focusable: 'false' };
  Object.keys(attrs).forEach(function (k) { svg.setAttribute(k, attrs[k]); });
  PICTOS_MSG[cfg.picto].forEach(function (p) {
    const n = document.createElementNS(NS, p[0]);
    Object.keys(p[1]).forEach(function (k) { n.setAttribute(k, p[1][k]); });
    svg.appendChild(n);
  });
  ico.appendChild(svg);
  const t = document.createElement('p');
  t.className = 'msg-t';
  const strong = document.createElement('strong');
  strong.textContent = cfg.mot;
  const span = document.createElement('span');
  if (parts) { parts.forEach(function (n) { span.appendChild(n); }); } else { span.textContent = text; }
  t.appendChild(strong);
  t.appendChild(document.createTextNode(' '));
  t.appendChild(span);
  box.appendChild(ico);
  box.appendChild(t);
  return box;
}
function showMsg(text, type) {
  document.getElementById('msg').replaceChildren(buildMsg(text, type || 'error'));
}
function hideMsg() {
  document.getElementById('msg').replaceChildren();
}

// --- Callbacks Turnstile (references par data-callback/-error/-expired du widget) ---
function onTurnstileSuccess(token) {
  turnstileToken = token;
  hideMsg();
}
function onTurnstileError() {
  turnstileToken = null;
  showMsg('La vérification anti-robot a échoué. Rechargez la page puis réessayez.', 'antirobot-erreur');
}
function onTurnstileExpired() {
  turnstileToken = null;
}
function resetTurnstile() {
  turnstileToken = null;
  if (window.turnstile && typeof window.turnstile.reset === 'function') {
    try { window.turnstile.reset(); } catch (e) { /* widget non monte : sans effet */ }
  }
}

window.addEventListener('DOMContentLoaded', function () {
  document.getElementById('form-register').addEventListener('submit', handleRegister);
});

async function handleRegister(e) {
  e.preventDefault();
  hideMsg();

  const cabinet = document.getElementById('r-cabinet').value.trim();
  const email = document.getElementById('r-email').value.trim();
  const password = document.getElementById('r-password').value;
  const confirm = document.getElementById('r-confirm').value;

  if (!cabinet) return showMsg('Veuillez saisir le nom de votre cabinet.');
  if (password.length < 8) return showMsg('Le mot de passe doit faire au moins 8 caractères.');
  if (password !== confirm) return showMsg('Les mots de passe ne correspondent pas.');
  if (!turnstileToken) return showMsg('Veuillez compléter la vérification anti-robot avant de continuer.', 'antirobot');

  const btn = document.getElementById('btn-register');
  btn.disabled = true;
  btn.textContent = 'Création en cours...';

  try {
    const res = await fetch(SUPABASE_URL + '/auth/v1/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
      body: JSON.stringify({
        email,
        password,
        data: { cabinet_name: cabinet, full_name: cabinet },
        gotrue_meta_security: { captcha_token: turnstileToken }
      })
    });
    const data = await res.json();

    if (!res.ok) {
      if ((data.msg && data.msg.includes('already registered')) ||
          (data.error_description && data.error_description.includes('already'))) {
        showMsg('Un compte existe déjà avec cet email. Connectez-vous sur app.ploutos-cgp.fr ou réinitialisez votre mot de passe depuis l\'application.');
      } else {
        showMsg(data.msg || data.error_description || 'Erreur lors de la création du compte. Réessayez.');
      }
      resetTurnstile();
      return;
    }

    // Succes : la confirmation email est obligatoire avant tout acces.
    // Aucune redirection vers l'app : on invite a valider l'email.
    hideMsg();
    document.getElementById('form-register').hidden = true;
    const pills = document.getElementById('pills');
    if (pills) pills.hidden = true;
    const sw = document.getElementById('switch-text');
    if (sw) sw.hidden = true;
    const retour = document.getElementById('retour-accueil');
    if (retour) retour.hidden = false;
    const adresse = document.createElement('b');
    adresse.id = 'confirm-email';
    adresse.textContent = email;
    const screen = document.getElementById('confirm-screen');
    screen.hidden = false;
    screen.replaceChildren(buildMsg('', 'success', [
      document.createTextNode("Un email de confirmation vient d'être envoyé à "),
      adresse,
      document.createTextNode(". Votre compte s'active au clic sur le lien de confirmation. Pensez à vérifier vos courriers indésirables.")
    ]));

  } catch (err) {
    showMsg('Erreur de connexion. Vérifiez votre connexion internet puis réessayez.');
    resetTurnstile();
  } finally {
    btn.disabled = false;
    btn.textContent = 'Créer mon compte';
  }
}
