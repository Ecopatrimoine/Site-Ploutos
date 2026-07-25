// Inscription Ploutos — creation de compte uniquement.
// La connexion et la reinitialisation de mot de passe se font sur app.ploutos-cgp.fr.

const SUPABASE_URL = 'https://ysbgfiqsuvdwzkcsiqir.supabase.co';
// Cle anon publique (exposition normale cote client, protegee par les policies RLS).
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzYmdmaXFzdXZkd3prY3NpcWlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MDMxODEsImV4cCI6MjA4OTA3OTE4MX0.eZInj2uw44jmI6OnWz9fll301x5eBq_1LSQTbMyJtj4';

// Jeton Turnstile courant (renseigne par le widget via ses callbacks data-*).
let turnstileToken = null;

function showMsg(text, type) {
  const el = document.getElementById('msg');
  el.className = 'msg ' + (type || 'error');
  el.textContent = text;
}
function hideMsg() {
  const el = document.getElementById('msg');
  el.className = 'msg';
  el.textContent = '';
}

// --- Callbacks Turnstile (references par data-callback/-error/-expired du widget) ---
function onTurnstileSuccess(token) {
  turnstileToken = token;
  hideMsg();
}
function onTurnstileError() {
  turnstileToken = null;
  showMsg('La vérification anti-robot a échoué. Rechargez la page puis réessayez.');
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
  if (!turnstileToken) return showMsg('Veuillez compléter la vérification anti-robot avant de continuer.');

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
    document.getElementById('form-register').style.display = 'none';
    const pills = document.getElementById('pills');
    if (pills) pills.style.display = 'none';
    const sw = document.getElementById('switch-text');
    if (sw) sw.style.display = 'none';
    document.getElementById('confirm-email').textContent = email;
    document.getElementById('confirm-screen').style.display = 'block';

  } catch (err) {
    showMsg('Erreur de connexion. Vérifiez votre connexion internet puis réessayez.');
    resetTurnstile();
  } finally {
    btn.disabled = false;
    btn.textContent = "Commencer l'essai gratuit →";
  }
}
