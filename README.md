# AnimeSama - AniList

[![Firefox Add-ons](https://img.shields.io/badge/Firefox-FF7139?style=for-the-badge&logo=Firefox-Browser&logoColor=white)](https://addons.mozilla.org/fr/firefox/addon/animesama-anilist/) [![Chrome Web Store](https://img.shields.io/badge/Chrome-4285F4?style=for-the-badge&logo=Google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/animesama-anilist/ebknncbhiaonjcchodembecmakkndamd?hl=fr) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

## 📝 Description

**AnimeSama-AniList** est une extension web pour navigateur permettant de suivre votre progression de lecture et de visionnage directement depuis Anime-Sama. 

Elle synchronise facilement ce que vous regardez (animes) ou lisez (scans) avec votre bibliothèque AniList pour ne plus jamais perdre le fil de votre progression !

## ✨ Fonctionnalités

- 🔄 **Synchronisation automatique ou manuelle :** Mettez à jour votre liste d'épisodes vus sur Anime-Sama vers votre compte AniList sans y penser, ou utilisez un bouton dédié directement sur la page.
- 🔒 **Authentification sécurisée :** Connexion directe et fiable à votre compte via le protocole OAuth2.
- 🎨 **Interface légère et discrète :** S'intègre de façon fluide à l'interface d'Anime-Sama et se contrôle facilement via son menu d'extension (`popup`).
- 📖 **100 % Open Source :** Le code est totalement public et transparent.

## 📥 Installation

### Depuis les boutiques officielles (Recommandé)

- 🦊 **Firefox :** [Télécharger sur Firefox Add-ons](https://addons.mozilla.org/fr/firefox/addon/animesama-anilist/)
- 🌐 **Chrome / Edge / Brave :** [Télécharger sur le Chrome Web Store](https://chromewebstore.google.com/detail/animesama-anilist/ebknncbhiaonjcchodembecmakkndamd?hl=fr)

### Installation manuelle (Développement)

1. Clonez ce dépôt ou téléchargez le code source.
2. Naviguez vers la page des extensions de votre navigateur :
   - Chrome/Brave/Edge : `chrome://extensions/`
   - Firefox : `about:debugging#/runtime/this-firefox`
3. Activez le **Mode développeur** (en haut à droite pour les navigateurs basés sur Chromium).
4. Chargez l'extension :
   - Chromium : Cliquez sur **Charger l'extension non empaquetée** et sélectionnez le dossier racine du projet.
   - Firefox : Cliquez sur **Charger un module temporaire** et sélectionnez le fichier `manifest.json`.

## 🚀 Comment l'utiliser ?

1. Une fois l'extension installée, épinglez-la à votre barre d'outils et cliquez sur son icône.
2. Connectez-vous à votre compte AniList en suivant la procédure sécurisée.
3. Via le menu de l'extension, choisissez votre mode de validation préféré.
4. Rendez-vous sur Anime-Sama et profitez de votre contenu ! Votre progression sera automatiquement (ou manuellement selon votre choix) synchronisée sur AniList.

## 📂 Architecture du projet

L'extension est architecturée selon les standards WebExtension :
* 📁 `assets/` : Contient les images et les icônes de l'extension (ex: `icon16.png`, `icon48.png`, `icon128.png`).
* 📁 `popup/` : Interface et logique du menu s'ouvrant au clic sur l'extension (`popup.html`, `popup.css`, `popup.js`)[cite: 1].
* 📁 `scripts/` : Scripts de logique métier comprenant `background.js` fonctionnant en arrière-plan et `content.js` qui interagit avec la page d'Anime-Sama[cite: 1].
* 📄 `manifest.json` : Fichier de configuration et de permissions[cite: 1].

## 🛡️ Confidentialité & Sécurité

Cette extension respecte votre vie privée de façon stricte. Aucune donnée personnelle n'est collectée ou revendue. Le jeton d'accès AniList est stocké **localement** sur votre navigateur pour maintenir votre session active, et l'extension ne communique qu'avec les API officielles.
[(`PRIVACY.md`)](PRIVACY.md)[cite: 1].

## 📜 Licence

Ce projet est distribué sous la Licence MIT. Voir le fichier [`LICENSE`](LICENSE) pour plus de détails[cite: 1].