/* Ploutos - script des pages reglementaires (R1, 11/11/2026).
   Trois fonctions, rien d'autre : repere de lecture du sommaire, fil de progression sous la barre, bouton
   « Imprimer ou enregistrer en PDF ». Les onglets, le sommaire et les id des titres sont dans le HTML :
   sans ce script, la page reste entierement lisible et navigable (le bouton d'impression, inutile sans
   script, n'apparait qu'avec lui). */
(function () {
  'use strict';

  // Bouton d'impression : cache dans le HTML, montre ici
  var imprimer = document.querySelector('.imp');
  if (imprimer) {
    imprimer.hidden = false;
    imprimer.addEventListener('click', function () { window.print(); });
  }

  // Repere de lecture : le lien du sommaire dont le titre passe dans la bande haute de l'ecran
  var liens = Array.prototype.slice.call(document.querySelectorAll('.som a[href^="#"]'));
  var titres = liens.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var courant = 0;   // dernier titre entre dans la bande de lecture (observateur)
  var auBas = false; // page au bout du defilement : la derniere section, trop courte pour atteindre la bande, prime
  function afficher() {
    var actif = auBas ? liens.length - 1 : courant;
    liens.forEach(function (a, j) { a.classList.toggle('on', j === actif); });
  }
  if (liens.length) {
    afficher();
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entrees) {
        entrees.forEach(function (e) {
          if (e.isIntersecting) { courant = titres.indexOf(e.target); afficher(); }
        });
      }, { rootMargin: '-20% 0px -70% 0px' });
      titres.forEach(function (t) { if (t) io.observe(t); });
    }
  }

  // Fil de progression et detection du bas de page
  var fil = document.getElementById('prog');
  var attente = false;
  function maj() {
    attente = false;
    var racine = document.documentElement;
    var reste = Math.max(1, racine.scrollHeight - window.innerHeight);
    if (fil) fil.style.setProperty('--p', Math.min(1, racine.scrollTop / reste).toFixed(4));
    var bas = racine.scrollTop >= reste - 2;
    if (bas !== auBas) { auBas = bas; afficher(); }
    // retour en haut d'un seul saut (touche Debut) : aucun titre ne traverse la bande, le premier reprend la main
    if (titres[0] && courant !== 0 && titres[0].getBoundingClientRect().top > window.innerHeight * 0.3) {
      courant = 0; afficher();
    }
  }
  function demander() {
    if (!attente) { attente = true; window.requestAnimationFrame(maj); }
  }
  window.addEventListener('scroll', demander, { passive: true });
  window.addEventListener('resize', demander);
  maj();
})();
