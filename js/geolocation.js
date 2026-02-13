/**
 * Module de géolocalisation avancé pour SIG Kédougou
 * Provides GPS tracking, favorite locations, geofencing, and location history
 */

class GeoLocationManager {
  constructor(map) {
    this.map = map;
    this.currentPosition = null;
    this.watchId = null;
    this.marker = null;
    this.accuracyCircle = null;
    this.isTracking = false;
    this.locations = [];
    this.db = null;
    this.initDatabase();
    this.createGeolocationUI();
  }

  /**
   * Initialiser la base de données IndexedDB pour les lieux favoris
   */
  initDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('sig-kedougou-locations', 1);

      request.onerror = () => {
        console.error('Erreur lors de l\'ouverture de la BD:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('Base de données initialisée');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Table pour les lieux favoris
        if (!db.objectStoreNames.contains('favorites')) {
          const store = db.createObjectStore('favorites', { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Table pour l'historique de localisation
        if (!db.objectStoreNames.contains('history')) {
          const store = db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Table pour les zones de géorepérage
        if (!db.objectStoreNames.contains('geofences')) {
          const store = db.createObjectStore('geofences', { keyPath: 'id', autoIncrement: true });
          store.createIndex('name', 'name', { unique: false });
        }
      };
    });
  }

  /**
   * Créer l'interface utilisateur pour la géolocalisation
   */
  createGeolocationUI() {
    const controlDiv = document.createElement('div');
    controlDiv.className = 'geo-control';
    controlDiv.innerHTML = `
      <div class="geo-control-container">
        <button id="btn-locate" class="geo-btn" title="Localiser ma position" data-active="false">
          <i class="fas fa-location-dot"></i>
        </button>
        <button id="btn-track" class="geo-btn" title="Suivre ma position" data-active="false">
          <i class="fas fa-signal"></i>
        </button>
        <button id="btn-favorites" class="geo-btn" title="Mes favoris">
          <i class="fas fa-star"></i>
        </button>
        <button id="btn-history" class="geo-btn" title="Historique">
          <i class="fas fa-history"></i>
        </button>
      </div>
      
      <div id="geo-info-panel" class="geo-info-panel" style="display: none;">
        <div class="geo-info-header">
          <h3>Localisation</h3>
          <button id="close-geo-panel" class="close-btn">&times;</button>
        </div>
        <div class="geo-info-body">
          <div class="geo-info-item">
            <label>Latitude:</label>
            <span id="geo-latitude">--</span>
          </div>
          <div class="geo-info-item">
            <label>Longitude:</label>
            <span id="geo-longitude">--</span>
          </div>
          <div class="geo-info-item">
            <label>Précision:</label>
            <span id="geo-accuracy">--</span>
          </div>
          <div class="geo-info-item">
            <label>Altitude:</label>
            <span id="geo-altitude">--</span>
          </div>
          <div class="geo-info-item">
            <label>Vitesse:</label>
            <span id="geo-speed">--</span>
          </div>
          <button id="btn-save-favorite" class="btn-save-location">
            <i class="fas fa-bookmark"></i> Ajouter aux favoris
          </button>
          <button id="btn-share-location" class="btn-save-location" style="background: #3498db;">
            <i class="fas fa-share"></i> Partager la localisation
          </button>
        </div>
      </div>
    `;

    // Ajouter au contrôle Leaflet
    const control = L.Control.extend({
      onAdd: () => controlDiv,
      onRemove: () => {}
    });

    new control({ position: 'topleft' }).addTo(this.map);

    // Attacher les événements
    this.attachEventListeners();

    // Ajouter les styles
    this.addStyles();
  }

  /**
   * Attacher les événements aux boutons
   */
  attachEventListeners() {
    document.getElementById('btn-locate').addEventListener('click', () => this.locateOnce());
    document.getElementById('btn-track').addEventListener('click', () => this.toggleTracking());
    document.getElementById('btn-favorites').addEventListener('click', () => this.showFavorites());
    document.getElementById('btn-history').addEventListener('click', () => this.showHistory());
    document.getElementById('close-geo-panel').addEventListener('click', () => this.closeInfoPanel());
    document.getElementById('btn-save-favorite').addEventListener('click', () => this.addFavorite());
    document.getElementById('btn-share-location').addEventListener('click', () => this.shareLocation());
  }

  /**
   * Localiser une fois la position actuelle
   */
  locateOnce() {
    if (!navigator.geolocation) {
      alert('Géolocalisation non supportée par votre navigateur');
      return;
    }

    const btn = document.getElementById('btn-locate');
    btn.classList.add('loading');
    btn.disabled = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.updateLocation(position);
        btn.classList.remove('loading');
        btn.disabled = false;
      },
      (error) => {
        this.handleGeolocationError(error);
        btn.classList.remove('loading');
        btn.disabled = false;
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  /**
   * Activer/Désactiver le suivi continu
   */
  toggleTracking() {
    if (this.isTracking) {
      this.stopTracking();
    } else {
      this.startTracking();
    }
  }

  /**
   * Commencer le suivi continu
   */
  startTracking() {
    if (!navigator.geolocation) {
      alert('Géolocalisation non supportée');
      return;
    }

    const btn = document.getElementById('btn-track');
    btn.dataset.active = 'true';
    btn.classList.add('active');

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.updateLocation(position);
        this.saveToHistory(position);
      },
      (error) => this.handleGeolocationError(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000
      }
    );

    this.isTracking = true;
    console.log('Suivi activé');
    this.showNotification('Suivi de la position activé', 'success');
  }

  /**
   * Arrêter le suivi continu
   */
  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    const btn = document.getElementById('btn-track');
    btn.dataset.active = 'false';
    btn.classList.remove('active');

    this.isTracking = false;
    console.log('Suivi désactivé');
    this.showNotification('Suivi de la position désactivé', 'info');
  }

  /**
   * Mettre à jour la localisation sur la carte
   */
  updateLocation(position) {
    const { latitude, longitude, accuracy, altitude, speed } = position.coords;

    this.currentPosition = {
      latitude,
      longitude,
      accuracy,
      altitude: altitude || null,
      speed: speed || null,
      timestamp: new Date().toISOString()
    };

    // Mettre à jour le panneau d'informations
    this.updateInfoPanel();

    // Centrer la carte
    const bounds = new L.LatLngBounds([
      [latitude - 0.01, longitude - 0.01],
      [latitude + 0.01, longitude + 0.01]
    ]);
    this.map.fitBounds(bounds);

    // Ajouter/Mettre à jour le marqueur
    this.updateMarker(latitude, longitude);

    // Afficher le cercle de précision
    this.updateAccuracyCircle(latitude, longitude, accuracy);

    // Vérifier les géoclôtures
    this.checkGeofences(latitude, longitude);
  }

  /**
   * Mettre à jour le marqueur de position
   */
  updateMarker(lat, lng) {
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.marker([lat, lng], {
        icon: L.icon({
          iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="%233498db" opacity="0.3"/><circle cx="16" cy="16" r="8" fill="%233498db"/><circle cx="16" cy="16" r="4" fill="%23ffffff"/></svg>',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16]
        })
      }).addTo(this.map);

      this.marker.bindPopup(
        `<div class="location-popup">
          <strong>Ma position</strong><br>
          Lat: ${lat.toFixed(6)}<br>
          Lng: ${lng.toFixed(6)}
        </div>`
      );
    }
  }

  /**
   * Mettre à jour le cercle de précision
   */
  updateAccuracyCircle(lat, lng, accuracy) {
    if (this.accuracyCircle) {
      this.map.removeLayer(this.accuracyCircle);
    }

    this.accuracyCircle = L.circle([lat, lng], {
      radius: accuracy,
      color: '#3498db',
      fillColor: '#3498db',
      fillOpacity: 0.15,
      weight: 2
    }).addTo(this.map);
  }

  /**
   * Mettre à jour le panneau d'informations
   */
  updateInfoPanel() {
    if (!this.currentPosition) return;

    const { latitude, longitude, accuracy, altitude, speed } = this.currentPosition;

    document.getElementById('geo-latitude').textContent = latitude.toFixed(6);
    document.getElementById('geo-longitude').textContent = longitude.toFixed(6);
    document.getElementById('geo-accuracy').textContent = accuracy ? `${Math.round(accuracy)} m` : '--';
    document.getElementById('geo-altitude').textContent = altitude ? `${Math.round(altitude)} m` : '--';
    document.getElementById('geo-speed').textContent = speed ? `${(speed * 3.6).toFixed(1)} km/h` : '--';

    // Afficher le panneau
    document.getElementById('geo-info-panel').style.display = 'block';
  }

  /**
   * Fermer le panneau d'informations
   */
  closeInfoPanel() {
    document.getElementById('geo-info-panel').style.display = 'none';
  }

  /**
   * Sauvegarder un lieu en favoris
   */
  async addFavorite() {
    if (!this.currentPosition) {
      alert('Aucune position à enregistrer');
      return;
    }

    const name = prompt('Nom du lieu:', `Lieu_${new Date().toLocaleTimeString()}`);
    if (!name) return;

    const favorite = {
      name,
      latitude: this.currentPosition.latitude,
      longitude: this.currentPosition.longitude,
      timestamp: new Date().toISOString(),
      description: prompt('Description (optionnel):') || ''
    };

    try {
      await this.saveFavoriteToDb(favorite);
      this.showNotification(`Favori "${name}" enregistré`, 'success');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du favori:', error);
      this.showNotification('Erreur lors de la sauvegarde', 'error');
    }
  }

  /**
   * Sauvegarder un favori dans la BD
   */
  saveFavoriteToDb(favorite) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['favorites'], 'readwrite');
      const store = transaction.objectStore('favorites');
      const request = store.add(favorite);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Afficher les favoris
   */
  async showFavorites() {
    try {
      const favorites = await this.getFavoritesFromDb();

      let html = '<div class="favorites-list">';
      if (favorites.length === 0) {
        html += '<p>Aucun favori enregistré</p>';
      } else {
        favorites.forEach((fav, index) => {
          html += `
            <div class="favorite-item">
              <strong>${fav.name}</strong><br>
              Lat: ${fav.latitude.toFixed(6)}, Lng: ${fav.longitude.toFixed(6)}<br>
              <small>${new Date(fav.timestamp).toLocaleString('fr-FR')}</small><br>
              ${fav.description ? `<em>${fav.description}</em><br>` : ''}
              <button onclick="window.geoManager.goToFavorite(${index})">Aller</button>
              <button onclick="window.geoManager.removeFavorite(${fav.id})">Supprimer</button>
            </div>
          `;
        });
      }
      html += '</div>';

      this.showModal('Mes Favoris', html);
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
    }
  }

  /**
   * Récupérer les favoris de la BD
   */
  getFavoritesFromDb() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['favorites'], 'readonly');
      const store = transaction.objectStore('favorites');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Aller à un favori
   */
  async goToFavorite(index) {
    const favorites = await this.getFavoritesFromDb();
    if (index >= 0 && index < favorites.length) {
      const fav = favorites[index];
      this.map.setView([fav.latitude, fav.longitude], 17);
      this.addMarker(fav.latitude, fav.longitude, fav.name, fav.description);
    }
  }

  /**
   * Supprimer un favori
   */
  removeFavorite(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce favori?')) {
      const transaction = this.db.transaction(['favorites'], 'readwrite');
      const store = transaction.objectStore('favorites');
      store.delete(id);
      this.showNotification('Favori supprimé', 'success');
      this.showFavorites();
    }
  }

  /**
   * Sauvegarder dans l'historique
   */
  saveToHistory(position) {
    const { latitude, longitude, accuracy } = position.coords;

    const historyEntry = {
      latitude,
      longitude,
      accuracy,
      timestamp: new Date().toISOString()
    };

    const transaction = this.db.transaction(['history'], 'readwrite');
    const store = transaction.objectStore('history');
    store.add(historyEntry);
  }

  /**
   * Afficher l'historique
   */
  async showHistory() {
    try {
      const history = await this.getHistoryFromDb();

      let html = '<div class="history-list">';
      if (history.length === 0) {
        html += '<p>Aucun historique</p>';
      } else {
        history.slice(-20).reverse().forEach((entry, index) => {
          html += `
            <div class="history-item">
              ${new Date(entry.timestamp).toLocaleString('fr-FR')}<br>
              Lat: ${entry.latitude.toFixed(6)}, Lng: ${entry.longitude.toFixed(6)}<br>
              Précision: ${Math.round(entry.accuracy)} m
            </div>
          `;
        });
      }
      html += '</div>';

      this.showModal('Historique de localisation', html);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    }
  }

  /**
   * Récupérer l'historique de la BD
   */
  getHistoryFromDb() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['history'], 'readonly');
      const store = transaction.objectStore('history');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Partager la localisation
   */
  shareLocation() {
    if (!this.currentPosition) {
      alert('Aucune position à partager');
      return;
    }

    const { latitude, longitude } = this.currentPosition;
    const url = `https://maps.google.com/?q=${latitude},${longitude}`;
    const text = `Position: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

    if (navigator.share) {
      navigator.share({
        title: 'SIG Kédougou - Ma localisation',
        text: text,
        url: url
      }).catch(err => console.log('Erreur lors du partage:', err));
    } else {
      // Fallback: copier dans le presse-papiers
      const fullText = `${text}\n${url}`;
      navigator.clipboard.writeText(fullText).then(() => {
        this.showNotification('Localisation copiée dans le presse-papiers', 'success');
      });
    }
  }

  /**
   * Vérifier les géoclôtures
   */
  checkGeofences(lat, lng) {
    // À implémenter: vérifier si la position est à proximité de géoclôtures
  }

  /**
   * Ajouter un marqueur personnalisé
   */
  addMarker(lat, lng, title, description) {
    L.marker([lat, lng]).addTo(this.map).bindPopup(`
      <div class="location-popup">
        <strong>${title}</strong><br>
        ${description || ''}<br>
        Lat: ${lat.toFixed(6)}<br>
        Lng: ${lng.toFixed(6)}
      </div>
    `);
  }

  /**
   * Gérer les erreurs de géolocalisation
   */
  handleGeolocationError(error) {
    let message = '';
    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = 'Géolocalisation refusée. Vérifiez les permissions du navigateur.';
        break;
      case error.POSITION_UNAVAILABLE:
        message = 'Localisation non disponible. Vérifiez votre connexion GPS.';
        break;
      case error.TIMEOUT:
        message = 'Délai d\'expiration au moment de la géolocalisation.';
        break;
      default:
        message = 'Erreur inconnue lors de la géolocalisation.';
    }
    console.error('Erreur Géolocalisation:', message);
    this.showNotification(message, 'error');
  }

  /**
   * Afficher une notification
   */
  showNotification(message, type = 'info') {
    // Utiliser le Notification API si disponible
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('SIG Kédougou', {
        body: message,
        icon: '/sig-kedougou/icons/icon-192x192.png'
      });
    }

    // Sinon, afficher dans la console
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  /**
   * Afficher un modal
   */
  showModal(title, content) {
    // Créer un modal simple
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.close-btn').addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  /**
   * Ajouter les styles CSS
   */
  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .geo-control {
        background: white;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        margin-left: 10px;
        margin-top: 10px;
      }

      .geo-control-container {
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .geo-btn {
        width: 36px;
        height: 36px;
        padding: 6px;
        border: none;
        background: white;
        color: #333;
        cursor: pointer;
        font-size: 16px;
        border-bottom: 1px solid #e0e0e0;
        transition: all 0.3s ease;
      }

      .geo-btn:last-child {
        border-bottom: none;
      }

      .geo-btn:hover {
        background: #f5f5f5;
      }

      .geo-btn.active,
      .geo-btn.loading {
        background: #3498db;
        color: white;
      }

      .geo-btn.loading {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .geo-info-panel {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 300px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        font-family: Arial, sans-serif;
      }

      .geo-info-header {
        padding: 12px;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .geo-info-header h3 {
        margin: 0;
        font-size: 14px;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #999;
      }

      .geo-info-body {
        padding: 12px;
      }

      .geo-info-item {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        font-size: 12px;
        border-bottom: 1px solid #f0f0f0;
      }

      .geo-info-item label {
        font-weight: bold;
        color: #666;
      }

      .btn-save-location {
        width: 100%;
        padding: 8px;
        margin-top: 8px;
        background: #27ae60;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: background 0.3s;
      }

      .btn-save-location:hover {
        background: #229954;
      }

      .location-popup {
        font-family: Arial, sans-serif;
        font-size: 12px;
      }

      .favorites-list, .history-list {
        max-height: 400px;
        overflow-y: auto;
      }

      .favorite-item, .history-item {
        padding: 10px;
        border-bottom: 1px solid #e0e0e0;
        font-size: 12px;
      }

      .favorite-item button {
        margin-right: 5px;
        padding: 4px 8px;
        font-size: 10px;
        cursor: pointer;
      }

      .custom-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
      }

      .custom-modal .modal-content {
        background: white;
        border-radius: 8px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
      }

      @media (max-width: 600px) {
        .geo-info-panel {
          width: calc(100% - 40px);
          right: 20px;
          left: 20px;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialiser le gestionnaire de géolocalisation au chargement de la carte
document.addEventListener('DOMContentLoaded', () => {
  // Attendre que la carte soit créée
  const checkMap = setInterval(() => {
    if (typeof map !== 'undefined') {
      clearInterval(checkMap);
      window.geoManager = new GeoLocationManager(map);
      console.log('Gestionnaire de géolocalisation initialisé');
    }
  }, 100);
});

// Demander la permission de notification
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}
