
const APP_URL = 'https://app.ploutos-cgp.fr';
const SUPABASE_URL = 'https://ysbgfiqsuvdwzkcsiqir.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzYmdmaXFzdXZkd3prY3NpcWlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MDMxODEsImV4cCI6MjA4OTA3OTE4MX0.eZInj2uw44jmI6OnWz9fll301x5eBq_1LSQTbMyJtj4';

// Récupérer la vraie clé depuis l'URL de l'app (ou hardcoder proprement)
// Pour l'instant on utilise fetch direct vers Supabase REST API

async function supabaseFetch(endpoint, options = {}) {
  const res = await fetch(SUPABASE_URL + endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      ...(options.headers || {})
    }
  });
  return res;
}

function showMsg(text, type = 'error') {
  const el = document.getElementById('msg');
  el.className = 'msg ' + type;
  el.textContent = text;
}
function hideMsg() {
  const el = document.getElementById('msg');
  el.className = 'msg';
  el.textContent = '';
}

// Tous les event listeners centralisés
window.addEventListener('DOMContentLoaded', function() {
  // Tabs
  document.getElementById('tab-register').addEventListener('click', function() { switchTab('register'); });
  document.getElementById('tab-login').addEventListener('click', function() { switchTab('login'); });

  // Liens switch
  var linkLogin = document.getElementById('link-login');
  if (linkLogin) linkLogin.addEventListener('click', function(e) { e.preventDefault(); switchTab('login'); });
  var linkForgot = document.getElementById('link-forgot');
  if (linkForgot) linkForgot.addEventListener('click', function(e) { e.preventDefault(); showForgot(); });
  var linkBackLogin = document.getElementById('link-back-login');
  if (linkBackLogin) linkBackLogin.addEventListener('click', function(e) { e.preventDefault(); switchTab('login'); });

  // Formulaires
  document.getElementById('form-register').addEventListener('submit', handleRegister);
  document.getElementById('form-login').addEventListener('submit', handleLogin);
  document.getElementById('form-forgot').addEventListener('submit', handleForgot);

  // Détecter ?mode=login dans l'URL
  const params = new URLSearchParams(window.location.search);
  if (params.get('mode') === 'login') {
    switchTab('login');
  }
});

function switchTab(tab) {
  hideMsg();
  const isRegister = tab === 'register';
  const isLogin = tab === 'login';

  document.getElementById('tab-register').classList.toggle('active', isRegister);
  document.getElementById('tab-login').classList.toggle('active', isLogin);
  document.getElementById('form-register').style.display = isRegister ? 'block' : 'none';
  document.getElementById('form-login').style.display = isLogin ? 'block' : 'none';
  document.getElementById('form-forgot').style.display = 'none';
  document.getElementById('pills').style.display = isRegister ? 'flex' : 'none';
  var switchText = document.getElementById('switch-text');
  switchText.innerHTML = isRegister
    ? 'Déjà un compte ? <a href="#" id="link-login">Se connecter</a>'
    : 'Pas encore de compte ? <a href="#" id="link-register">Créer un compte gratuit</a>';
  var newLink = document.getElementById('link-login') || document.getElementById('link-register');
  if (newLink) newLink.addEventListener('click', function(e) {
    e.preventDefault();
    switchTab(isRegister ? 'login' : 'register');
  });
}

function showForgot() {
  hideMsg();
  document.getElementById('form-login').style.display = 'none';
  document.getElementById('form-forgot').style.display = 'block';
  document.getElementById('pills').style.display = 'none';
  document.getElementById('switch-text').style.display = 'none';
}

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

  const btn = document.getElementById('btn-register');
  btn.disabled = true;
  btn.textContent = 'Création en cours...';

  try {
    const res = await fetch(SUPABASE_URL + '/auth/v1/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
      body: JSON.stringify({
        email, password,
        data: { cabinet_name: cabinet, full_name: cabinet }
      })
    });
    const data = await res.json();

    if (!res.ok) {
      if (data.msg?.includes('already registered') || data.error_description?.includes('already')) {
        showMsg('Un compte existe déjà avec cet email. Connectez-vous ou réinitialisez votre mot de passe.');
      } else {
        showMsg(data.msg || data.error_description || 'Erreur lors de la création du compte.');
      }
      return;
    }

    // Succès : rediriger vers l'app
    showMsg('✓ Compte créé ! Redirection vers l\'application...', 'success');
    setTimeout(() => { window.location.href = APP_URL; }, 1800);

  } catch(err) {
    showMsg('Erreur de connexion. Vérifiez votre connexion internet.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Commencer l\'essai gratuit →';
  }
}

async function handleLogin(e) {
  e.preventDefault();
  hideMsg();
  const email = document.getElementById('l-email').value.trim();
  const password = document.getElementById('l-password').value;

  const btn = document.getElementById('btn-login');
  btn.disabled = true;
  btn.textContent = 'Connexion...';

  try {
    const res = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      showMsg(data.error_description || 'Email ou mot de passe incorrect.');
      return;
    }

    // Stocker la session dans localStorage pour que l'app Supabase la récupère
    const storageKey = `sb-ysbgfiqsuvdwzkcsiqir-auth-token`;
    const session = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
      expires_in: data.expires_in,
      token_type: data.token_type,
      user: data.user,
    };
    localStorage.setItem(storageKey, JSON.stringify(session));
    showMsg('✓ Connecté ! Redirection...', 'success');
    setTimeout(() => { window.location.href = APP_URL; }, 1200);

  } catch(err) {
    showMsg('Erreur de connexion. Vérifiez votre connexion internet.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Se connecter';
  }
}

async function handleForgot(e) {
  e.preventDefault();
  hideMsg();
  const email = document.getElementById('f-email').value.trim();

  const btn = document.getElementById('btn-forgot');
  btn.disabled = true;
  btn.textContent = 'Envoi en cours...';

  try {
    const res = await fetch(SUPABASE_URL + '/auth/v1/recover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
      body: JSON.stringify({ email, redirect_to: APP_URL })
    });

    if (res.ok) {
      showMsg('✓ Email de réinitialisation envoyé ! Vérifiez votre boîte mail.', 'success');
    } else {
      showMsg('Erreur lors de l\'envoi. Vérifiez l\'adresse email.');
    }
  } catch(err) {
    showMsg('Erreur de connexion.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Envoyer le lien';
  }
}

// Détecter si on arrive depuis "Se connecter" dans l