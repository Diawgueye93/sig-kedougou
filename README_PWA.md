# 🌐 Progressive Web App - SIG Kédougou

## Vue d'ensemble

Cette application a été transformée en **Progressive Web App (PWA)** complète avec support de géolocalisation, fonctionnement hors ligne et installation mobile.

## Fichiers Créés/Modifiés

### 📄 Fichiers Principaux PWA

#### 1. **manifest.json** (Nouveau)
- Métadonnées de l'application PWA
- Doit être dans la racine du projet
- Définit le nom, les icônes, les couleurs, les raccourcis
- Référencé dans `index.html` via: `<link rel="manifest" href="manifest.json">`

```json
{
  "name": "Cartographie web de la région de Kédougou",
  "short_name": "SIG Kédougou",
  "display": "standalone",
  "start_url": "/sig-kedougou/index.html",
  "icons": [...],
  ...
}
```

#### 2. **sw.js** (Service Worker - Nouveau)
- Enregistré automatiquement au chargement
- Gère le cache et le fonctionnement hors ligne
- Stratégie: "Cache First" (cache d'abord, réseau en fallback)
- Taille: ~8KB
- Localisation: racine du projet
- Chargé via JavaScript dans `index.html`

**Fonctionnalités:**
- Installation automatique au premier chargement
- Mise en cache des ressources essentielles
- Support du mode hors ligne
- Synchronisation en arrière-plan
- Notifications système

#### 3. **js/geolocation.js** (Nouveau)
- Module complet de géolocalisation
- Gère: localisation, suivi, favoris, historique
- Utilise IndexedDB pour le stockage local
- Taille: ~20KB
- Référencé dans `index.html`

**Fonctionnalités:**
- 📍 Localisation GPS unique
- 📡 Suivi continu en temps réel
- ⭐ Enregistrement des favoris
- 📜 Historique de position (20 dernières)
- 📤 Partage de localisation
- 🎯 Navigation vers les favoris

#### 4. **icons/icon.svg** (Nouveau)
- Icône SVG pour la PWA
- Format vectoriel (scalable)
- Référencée dans `manifest.json` et `index.html`
- Peut être convertie en PNG via `generate-icons.html`

#### 5. **icons/generate-icons.html** (Nouveau)
- Page web pour générer les icônes PNG
- Crée les tailles standards (72x72 à 512x512)
- Génère aussi les screenshots
- Fonctionne complètement dans le navigateur
- Utilise HTML5 Canvas pour le rendu
- **Accès via:** `http://localhost:8080/sig-kedougou/icons/generate-icons.html`

#### 6. **offline.html** (Nouveau)
- Page affichée en cas d'erreur réseau
- Design responsif et attrayant
- Détecte automatiquement le rétablissement de la connexion
- Fournit des astuces pour l'utilisateur

#### 7. **PWA_INSTALLATION.md** (Nouveau)
- Guide complet d'installation
- Instructions pour Android
- Instructions pour iOS
- Dépannage et FAQ
- Explications des permissions

#### 8. **index.html** (Modifié)
Ajouts:
- Meta tags PWA supplémentaires
- Lien vers `manifest.json`
- Référence aux icônes
- Script d'enregistrement du Service Worker
- Détection du mode hors ligne
- Référence au module `geolocation.js`

### 📦 Structure Complète

```
/sig-kedougou/
├── index.html                    (modifié - PWA setup)
├── manifest.json                 (nouveau - PWA config)
├── sw.js                        (nouveau - Service Worker)
├── offline.html                 (nouveau - Page offline fallback)
├── PWA_INSTALLATION.md          (nouveau - Guide d'installation)
│
├── js/
│   ├── geolocation.js           (nouveau - Géolocalisation)
│   ├── leaflet.js
│   ├── modern-app-script.js
│   ├── advanced-features.js
│   └── ... (autres fichiers)
│
├── icons/
│   ├── icon.svg                 (nouveau - Icône SVG)
│   ├── generate-icons.html      (nouveau - Générateur PNG)
│   ├── generate-icons.py        (nouveau - Script Python alt)
│   ├── icon-72x72.png           (généré)
│   ├── icon-96x96.png           (généré)
│   ├── icon-128x128.png         (généré)
│   ├── icon-144x144.png         (généré)
│   ├── icon-192x192.png         (généré)
│   ├── icon-384x384.png         (généré)
│   ├── icon-512x512.png         (généré)
│   ├── maskable-icon-192x192.png (généré)
│   ├── maskable-icon-512x512.png (généré)
│   ├── screenshot-1.png         (généré - 540x720)
│   └── screenshot-2.png         (généré - 1280x720)
│
├── css/
│   └── ... (fichiers existants)
│
└── data/
    └── ... (fichiers GeoJSON existants)
```

## Guide de Déploiement

### Étape 1: Générer les Icônes PNG
1. Ouvrez dans un navigateur: `http://localhost:8080/sig-kedougou/icons/generate-icons.html`
2. Cliquez sur **"Générer toutes les icônes"**
3. Téléchargez le fichier **sig-kedougou-icons.zip**
4. Extrayez les fichiers dans `/icons/`

### Étape 2: Tester Localement
1. Servez l'application via HTTP (localhost)
2. Ouvrez Chrome/Firefox sur Android: `http://localhost:8080/sig-kedougou/`
3. Installez l'application via la bannière ou le menu
4. Testez la géolocalisation et les fonctionnalités offline

### Étape 3: Production (Important!)
Pour la production, vous DEVEZ:
1. **Utiliser HTTPS** (Let's Encrypt gratuit, Cloudflare, etc.)
2. Mettre à jour l'URL dans `manifest.json`:
   ```json
   "start_url": "https://votre-domaine.com/sig-kedougou/index.html"
   ```
3. Mettre à jour le `CACHE_NAME` dans `sw.js` pour les nouvelles versions
4. Configurer les headers CORS si nécessaire

## Déploiement sur un Serveur

### Apache
```apache
<Directory /var/www/sig-kedougou>
    # Activer HTTPS
    <If "%{HTTPS} != 'on'">
        Redirect permanent / https://%{SERVER_NAME}%{REQUEST_URI}
    </If>
    
    # Headers PWA
    <FilesMatch "\.json$">
        Header set Content-Type "application/json; charset=UTF-8"
        Header set Access-Control-Allow-Origin "*"
    </FilesMatch>
    
    # Service Worker
    <FilesMatch "^sw\.js$">
        Header set Service-Worker-Allowed "/"
        Header set Cache-Control "max-age=0, must-revalidate"
    </FilesMatch>
    
    # Manifest
    <FilesMatch "^manifest\.json$">
        Header set Cache-Control "max-age=3600, public"
    </FilesMatch>
</Directory>
```

### Nginx
```nginx
server {
    listen 443 ssl http2;
    server_name votre-domaine.com;
    
    # SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/votre-domaine/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine/privkey.pem;
    
    location /sig-kedougou {
        alias /var/www/sig-kedougou;
        try_files $uri $uri/ /index.html;
    }
    
    location ~ /sig-kedougou/sw\.js$ {
        alias /var/www/sig-kedougou/sw.js;
        add_header Service-Worker-Allowed "/";
        add_header Cache-Control "max-age=0, must-revalidate";
    }
    
    location ~ /sig-kedougou/manifest\.json$ {
        alias /var/www/sig-kedougou/manifest.json;
        add_header Content-Type "application/json";
        add_header Cache-Control "max-age=3600, public";
    }
}
```

### Docker
```dockerfile
FROM nginx:alpine
COPY ./sig-kedougou /usr/share/nginx/html/sig-kedougou
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Fonctionnalités Détaillées

### 🔄 Service Worker et Cache

#### Stratégie de Cache: "Cache First"
1. Première visite → cache les ressources
2. Visites suivantes → sert depuis le cache
3. En arrière-plan → update le cache
4. Pas de connexion → sert depuis le cache

#### Ressources en Cache
- HTML, CSS, JS
- Images
- Données GeoJSON
- Polices
- Manifest et icônes

### 🗺️ Géolocalisation Avancée

#### Composants de `geolocation.js`
```javascript
GeoLocationManager {
  locateOnce()        // Localiser une fois
  startTracking()     // Suivi continu
  stopTracking()      // Arrêter le suivi
  addFavorite()       // Enregistrer un favori
  showFavorites()     // Afficher les favoris
  showHistory()       // Afficher l'historique
  shareLocation()     // Partager la position
  checkGeofences()    // Vérifier les zones
}
```

#### Stockage de Données
- Utilise **IndexedDB** pour la persistance
- Favoris: illimités
- Historique: 20 dernières positions
- Tampons: synchronisation en arrière-plan

### 📱 Support Mobile

#### Android
- ✅ Chrome 39+
- ✅ Firefox 55+
- ✅ Samsung Internet
- ✅ Brave
- ✅ Edge

#### iOS
- ✅ Safari 15.1+ (limitations)
- ⚠️ Pas d'accès complet au Service Worker
- ⚠️ Historique limité
- ✅ Géolocalisation fonctionne

## Configuration HTTPS (Recommandé)

### Let's Encrypt (Gratuit)

```bash
# Installer certbot
sudo apt-get install certbot python3-certbot-nginx

# Générer le certificat
sudo certbot certonly --nginx -d votre-domaine.com

# Renouvellement automatique
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Monitoring et Logging

### Accès à la Console
1. Sur le téléphone:
   - Android Chrome: `chrome://inspect`
   - iOS Safari: Développement → Safari → Inspecteur Web

2. Vérifier les logs:
   ```javascript
   // Dans la console du Service Worker
   console.log('Service Worker actif');
   console.log('Cache mis à jour');
   ```

### Erreurs Courantes
```javascript
// Vérifier l'enregistrement du Service Worker
navigator.serviceWorker.getRegistrations()
  .then(regs => console.log(regs));

// Vérifier les caches
caches.keys().then(names => console.log(names));

// Tester la géolocalisation
navigator.geolocation.getCurrentPosition(
  pos => console.log(pos),
  err => console.error(err)
);
```

## Mise à Jour et Versioning

Le fichier `manifest.json` utilise un système de version:
```json
"version": "1.0.0"
```

Pour mettre à jour:
1. Modifier `CACHE_NAME` dans `sw.js`:
   ```javascript
   const CACHE_NAME = 'sig-kedougou-v2';
   ```
2. Incrémenter la version dans `manifest.json`
3. Les utilisateurs recevront une notification

## Sécurité

### Recommandations
- ✅ Utiliser HTTPS en production
- ✅ Valider les données géolocalisation côté serveur
- ✅ Implémenter une authentification si nécessaire
- ✅ Rate limiting sur l'API de géolocalisation
- ✅ CORS configuré correctement
- ✅ CSP (Content Security Policy) pour les assets

### Politique CSP Exemple
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src * data: blob:;">
```

## Performance

### Optimisations Appliquées
- ✅ Lazy loading des scripts
- ✅ Mise en cache agressive
- ✅ Images optimisées (SVG pour icônes)
- ✅ Compression gzip des assets
- ✅ Code splitting (modules séparés)

### Métriques Cibles
- ⏱️ First Paint < 1s
- ⏱️ First Contentful Paint < 2s
- ⏱️ Time to Interactive < 3s
- 📊 Lighthouse Score > 90

## Compatibilité

| Navigateur | Android | iOS | Desktop |
|-----------|---------|-----|---------|
| Chrome | ✅ 39+ | ✅ - | ✅ 39+ |
| Firefox | ✅ 55+ | ❌ | ✅ 55+ |
| Safari | ❌ | ✅ 15.1+ | ✅ 15+ |
| Edge | ✅ 79+ | ✅ - | ✅ 79+ |
| Samsung Internet | ✅ 4+ | ↳ iOS | ✅ |

## Roadmap Futures

- [ ] Offline maps (Mapbox GL)
- [ ] Synchronisation serveur (CouchDB)
- [ ] Mode sombre
- [ ] Export de données (CSV, KML)
- [ ] Géorepérage avec notifications
- [ ] Intégration Sentry/Bugsnag
- [ ] Analytics (Plausible/Matomo)
- [ ] Multi-langues (i18n)

## Support et Ressources

- [MDN - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://www.w3.org/TR/appmanifest/)
- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [PWA Checklist](https://web.dev/pwa-checklist/)

---

**Version:** 1.0.0  
**Dernière mise à jour:** 13 Février 2026  
**Auteur:** SIG Kédougou Dev Team
