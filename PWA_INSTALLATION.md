# 📱 Guide d'Installation - SIG Kédougou PWA

## Qu'est-ce qu'une Progressive Web App (PWA)?

Une **Progressive Web App (PWA)** est une application web qui fonctionne comme une application native sur votre téléphone ou tablette. Elle peut:
- ✅ Être installée directement depuis le navigateur
- ✅ Fonctionner hors ligne
- ✅ Accéder à la géolocalisation GPS
- ✅ Accéder à la caméra et aux fichiers
- ✅ Recevoir des notifications

## Installation sur Android

### Étape 1: Ouvrir l'application dans Chrome
1. Ouvrez votre navigateur **Chrome** ou **Firefox**
2. Allez à l'adresse: `http://localhost:8080/sig-kedougou/`
   (Ou l'URL de votre serveur)

### Étape 2: Installer l'application
1. **Chrome**: Attendez que une bannière **"Installer"** apparaisse en bas de l'écran
   - Appuyez sur "Installer"
   - Confirmez avec "Installer l'app"

2. **Firefox**: Utilisez le menu à 3 points (⋯) → "Installer"

3. **Samsung Internet**: Utilisez le menu → "Ajouter à l'écran d'accueil"

### Étape 3: Utiliser l'application
- L'application apparaît maintenant sur votre écran d'accueil
- Appuyez sur l'icône pour lancer l'application
- Fonctionne en mode **"Standalone"** (sans barre d'adresse)

## Installation sur iOS (iPhone/iPad)

### Étape 1: Ouvrir dans Safari
1. Ouvrez **Safari**
2. Allez à l'adresse: `http://localhost:8080/sig-kedougou/`

### Étape 2: Ajouter à l'écran d'accueil
1. Appuyez sur le bouton **Partage** (carré avec flèche)
2. Sélectionnez **"Sur l'écran d'accueil"**
3. Confirmez en appuyant sur **"Ajouter"**

### Étape 3: Utiliser l'application
- L'application s'ajoute à votre écran d'accueil
- Appuyez pour lancer l'application
- Fonctionne en mode fullscreen

## Fonctionnalités de Géolocalisation

### 🎯 Localiser une fois
- Appuyez sur le bouton **📍** (doigt pointant le bas)
- L'application demande la permission
- Votre position s'affiche sur la carte

### 📡 Suivi continu
- Appuyez sur le bouton **📶** (signal)
- L'application suit votre position en temps réel
- Idéal pour naviguer dans la région

### ⭐ Favoris
- Appuyez sur le bouton **⭐** (star)
- Enregistrez vos lieux importants
- Accédez-y rapidement plus tard
- Ces lieux sont sauvegardés localement

### 📜 Historique
- Appuyez sur le bouton **⏱️** (horloge)
- Consultez votre historique de position
- Les 20 dernières positions sont conservées

### 📤 Partager la localisation
- Utiliser le bouton **Partager** du panneau d'info
- Fonctionne avec Messages, Email, etc.

## Fonctionnement Hors Ligne

L'application est conçue pour fonctionner partiellement hors ligne:
- ✅ Vues précédemment chargées restent disponibles
- ✅ Géolocalisation fonctionne
- ✅ Consulter les favoris
- ✅ Historique local
- ❌ Les fonds de carte en ligne ne se chargeront pas
- ❌ Les couches WMS nécessitent une connexion

## Permissions Requises

Lors du premier lancement, l'application demandera:
- **Géolocalisation**: Pour déterminer votre position GPS
- **Notifications**: Pour les alertes et notifications
- **Stockage local**: Pour sauvegarder les favoris et l'historique

## Dépannage

### L'application ne s'installe pas
- Vérifiez que vous utilisez **Chrome 39+**, **Firefox 55+**, ou **Safari 15.1+**
- Le site doit être en **HTTPS** en production (HTTP fonctionne en local)
- Le `manifest.json` doit être valide
- Le service worker doit être enregistré

### La géolocalisation ne fonctionne pas
- Vérifiez les permissions du navigateur
- Assurez-vous d'utiliser HTTPS en production
- Le GPS doit être activé sur votre appareil

### L'application ne fonctionne pas hors ligne
- Le service worker peut ne pas être chargé
- Rechargez l'application une première fois en ligne
- Le cache peut prendre quelques secondes à se construire

### Effacer le cache
Pour vider complètement le cache:
1. Android: Paramètres → Applications → SIG Kédougou → Stockage → Effacer le cache
2. iOS: Paramètres → Safari → Historique et données de sites → Effacer l'historique

## Architecture PWA

### Fichiers créés
```
/sig-kedougou/
├── manifest.json           # Métadonnées PWA
├── sw.js                   # Service Worker (cache et offline)
├── js/geolocation.js       # Module de géolocalisation
├── icons/
│   ├── icon.svg           # Icône SVG
│   ├── generate-icons.html # Générateur d'icônes PNG
│   └── icon-*.png         # Icônes PNG (générées)
└── index.html             # Page principale (modifiée)
```

### Fonctionnalités PWA

#### 1. **Service Worker (sw.js)**
- Cache les ressources au premier chargement
- Permet le fonctionnement hors ligne
- Synchronisation en arrière-plan
- Gestion des notifications

#### 2. **Manifest.json**
- Métadonnées de l'application
- Configuration de l'écran d'accueil
- Définition des icônes
- Paramètres de lancement

#### 3. **Géolocalisation (geolocation.js)**
- Accès au GPS
- Suivi en temps réel
- Sauvegarde des favoris
- Historique de position
- Partage de localisation
- Affichage de la précision

## Mises à Jour

Le service worker vérifie automatiquement les mises à jour:
- Une notification vous informe si une nouvelle version est disponible
- Rechargez pour appliquer la mise à jour
- Le cache sera mis à jour automatiquement

## Sécurité et Confidentialité

- Les données de géolocalisation sont **stockées localement**
- Les données ne sont **jamais envoyées** au serveur sans votre consentement (sauf si implémenté)
- Supprimez l'application normalement pour effacer toutes les données
- Consultez votre navigateur pour restreindre les permissions

## Support

Pour des problèmes:
1. Vérifiez la console du navigateur (F12 → Console)
2. Vérifiez les permissions de l'application
3. Assurez-vous que les fichiers PWA sont présents
4. Essayez de vider le cache et les cookies
5. Réinstallez l'application si nécessaire

## Ressources

- [Progressive Web Apps - MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web APIs - Geolocation](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
