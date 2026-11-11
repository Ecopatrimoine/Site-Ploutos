// Serveur local de recette (lot R1) : sert la racine du depot comme Netlify le fait.
// Difference avec « python -m http.server » : /cgu est resolu en cgu.html (URLs propres), et /docs/* repond 404
// avec la page 404 du site (meme garde-fou que _redirects ; docs/ est versionne mais jamais servi).
// Usage (depuis la racine du depot) : node docs/maquettes/serveur_local.mjs [port]   (defaut : 8080)
// Aucune dependance. Ne remplace pas Netlify : pas de _headers (donc pas de CSP), pas de _redirects hors /docs/*.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { extname, join, normalize, sep } from 'node:path';

const RACINE = fileURLToPath(new URL('../../', import.meta.url));
const PORT = Number(process.argv[2] || process.env.PORT || 8080);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8'
};

async function existe(chemin) {
  try { return (await stat(chemin)).isFile(); } catch { return false; }
}

// Renvoie le chemin disque a servir, ou null.
async function resoudre(chemin) {
  if (chemin === '/docs' || chemin.startsWith('/docs/')) return null;
  const rel = normalize(decodeURIComponent(chemin)).replace(/^[/\\]+/, '');
  const abs = join(RACINE, rel);
  if (abs !== RACINE.replace(/[/\\]$/, '') && !abs.startsWith(RACINE)) return null; // sortie de la racine
  if (rel === '' || rel.endsWith(sep)) return (await existe(join(abs, 'index.html'))) ? join(abs, 'index.html') : null;
  if (await existe(abs)) return abs;
  if (!extname(abs) && (await existe(abs + '.html'))) return abs + '.html';
  if (await existe(join(abs, 'index.html'))) return join(abs, 'index.html');
  return null;
}

createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, 'http://localhost');
    let fichier = await resoudre(pathname);
    let statut = 200;
    if (!fichier) { fichier = join(RACINE, '404.html'); statut = 404; }
    const corps = await readFile(fichier);
    res.writeHead(statut, { 'Content-Type': TYPES[extname(fichier)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : corps);
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Erreur du serveur local : ' + e.message);
  }
}).listen(PORT, () => console.log(`Serveur local : http://localhost:${PORT}/  (Ctrl+C pour arreter)\n  essayer : /cgu  /dpa  /politique-confidentialite`));
