// Service Worker pour PWA - SIG Kédougou
const CACHE_NAME = 'sig-kedougou-v1';
const urlsToCache = [
  '/sig-kedougou/index.html',
  '/sig-kedougou/css/leaflet.css',
  '/sig-kedougou/css/L.Control.Layers.Tree.css',
  '/sig-kedougou/css/L.Control.Locate.min.css',
  '/sig-kedougou/css/qgis2web.css',
  '/sig-kedougou/css/fontawesome-all.min.css',
  '/sig-kedougou/css/leaflet.photon.css',
  '/sig-kedougou/css/leaflet-measure.css',
  '/sig-kedougou/css/modern-app-style.css',
  '/sig-kedougou/js/leaflet.js',
  '/sig-kedougou/js/L.Control.Layers.Tree.min.js',
  '/sig-kedougou/js/L.Control.Locate.min.js',
  '/sig-kedougou/js/leaflet.rotatedMarker.js',
  '/sig-kedougou/js/leaflet-hash.js',
  '/sig-kedougou/js/Autolinker.min.js',
  '/sig-kedougou/js/rbush.min.js',
  '/sig-kedougou/js/labelgun.min.js',
  '/sig-kedougou/js/labels.js',
  '/sig-kedougou/js/leaflet.photon.js',
  '/sig-kedougou/js/leaflet-measure.js',
  '/sig-kedougou/js/qgis2web_expressions.js',
  '/sig-kedougou/js/modern-app-script.js',
  '/sig-kedougou/js/layer-definitions.js',
  '/sig-kedougou/js/advanced-features.js',
  '/sig-kedougou/js/geolocation.js',
  '/sig-kedougou/data/Regions_Senegal_3.js',
  '/sig-kedougou/data/Region_Kedougou_4.js',
  '/sig-kedougou/data/Kedougou_Departements_5.js',
  '/sig-kedougou/data/Kedougou_Arrondissements_6.js',
  '/sig-kedougou/data/Kedougou_Ecoles_7.js',
  '/sig-kedougou/data/Kedougou_Hydrographie_8.js',
  '/sig-kedougou/data/Kedougou_Routes_9.js',
  '/sig-kedougou/data/Kedougou_Localites_10.js',
  '/sig-kedougou/icons/icon-192x192.png',
  '/sig-kedougou/icons/icon-512x512.png',
  '/sig-kedougou/manifest.json'
];

// Installation du Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker : Installation en cours...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Service Worker : Cache ouvert');
      return cache.addAll(urlsToCache).catch(error => {
        console.warn('Certaines ressources n\'ont pas pu être cachées:', error);
        // Ne pas échouer l'installation si quelques ressources ne sont pas disponibles
        return Promise.resolve();
      });
    }).then(() => {
      return self.skipWaiting(); // Force l'activation
    })
  );
});

// Activation du Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker : Activation en cours...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Supprimer les anciens caches
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker : Suppression du cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // Prend le contrôle immédiatement
    })
  );
});

// Interception des requêtes réseau
self.addEventListener('fetch', event => {
  // Ignorer les requêtes non-GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Stratégie: Cache first, Network fallback
  event.respondWith(
    caches.match(event.request).then(response => {
      // Retourner la réponse en cache si disponible
      if (response) {
        console.log('Service Worker : Ressource servie from cache:', event.request.url);
        return response;
      }

      // Sinon, tenter de récupérer depuis le réseau
      return fetch(event.request).then(networkResponse => {
        // Ne mettre en cache que les réponses valides
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
          return networkResponse;
        }

        // Cloner la réponse
        const responseToCache = networkResponse.clone();

        // Ajouter à la cache
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
          console.log('Service Worker : Ressource mise en cache:', event.request.url);
        });

        return networkResponse;
      }).catch(error => {
        console.error('Service Worker : Erreur réseau:', error);
        // Retourner une page hors ligne si disponible
        return caches.match('/sig-kedougou/offline.html').catch(() => {
          return new Response('Mode hors ligne - Page non disponible');
        });
      });
    })
  );
});

// Gestion des messages venant du client
self.addEventListener('message', event => {
  console.log('Service Worker : Message reçu:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('Cache vidé');
    });
  }
});

// Synchronisation en arrière-plan (Background Sync)
self.addEventListener('sync', event => {
  console.log('Service Worker : Événement sync:', event.tag);
  
  if (event.tag === 'sync-locations') {
    event.waitUntil(syncLocations());
  }
});

// Fonction pour synchroniser les localisations
async function syncLocations() {
  try {
    // Récupérer les données du localStorage
    const db = await openDatabase();
    const locations = await getAllLocations(db);
    
    // Envoyer au serveur
    for (const location of locations) {
      if (!location.synced) {
        await sendToServer(location);
      }
    }
    
    console.log('Synchronisation des lieux complétée');
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error);
  }
}

// Utilitaires de base de données
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('sig-kedougou-db', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('locations')) {
        db.createObjectStore('locations', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function getAllLocations(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('locations', 'readonly');
    const store = transaction.objectStore('locations');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function sendToServer(location) {
  try {
    const response = await fetch('/sig-kedougou/api/save-location', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(location)
    });
    
    if (response.ok) {
      console.log('Localisation envoyée avec succès:', location.id);
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la localisation:', error);
  }
}

// Notifications (pour les événements importants)
self.addEventListener('notificationclick', event => {
  console.log('Notification cliquée:', event.notification.tag);
  
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // Vérifier si la fenêtre est déjà ouverte
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === '/sig-kedougou/index.html' && 'focus' in client) {
          return client.focus();
        }
      }
      // Sinon, ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow('/sig-kedougou/index.html');
      }
    })
  );
});

console.log('Service Worker enregistré et actif');
