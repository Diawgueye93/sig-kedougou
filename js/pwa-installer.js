/**
 * PWA Installation Manager - SIG Kédougou
 * Gère toute la logique d'installation de l'application
 * Ce fichier est chargé après geolocation.js dans index.html
 */

class PWAInstallationManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.platform = this.detectPlatform();
        
        this.initializeElements();
        this.attachEventListeners();
        this.checkIfInstalled();
        
        console.log('✅ PWAInstallationManager initialisé');
        console.log('Platform:', this.platform);
    }

    /**
     * Initialiser les éléments du DOM
     */
    initializeElements() {
        this.elements = {
            installPromptBanner: document.getElementById('install-prompt-banner'),
            installAppBtn: document.getElementById('install-app-btn'),
            installPromptBtn: document.getElementById('install-prompt-btn'),
            dismissPromptBtn: document.getElementById('install-prompt-dismiss'),
            confirmInstallBtn: document.getElementById('confirm-install-btn'),
            installAppModal: document.getElementById('installAppModal'),
            modalOverlay: document.getElementById('modalOverlay'),
            offlineBanner: null
        };
    }

    /**
     * Attacher les événements
     */
    attachEventListeners() {
        // Événement beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => this.handleBeforeInstallPrompt(e));

        // Événement appinstalled
        window.addEventListener('appinstalled', () => this.handleAppInstalled());

        // Boutons d'installation
        if (this.elements.installPromptBtn) {
            this.elements.installPromptBtn.addEventListener('click', () => this.showInstallPrompt());
        }

        if (this.elements.dismissPromptBtn) {
            this.elements.dismissPromptBtn.addEventListener('click', () => this.hideInstallPrompt());
        }

        if (this.elements.installAppBtn) {
            this.elements.installAppBtn.addEventListener('click', () => this.handleNavbarInstallClick());
        }

        if (this.elements.confirmInstallBtn) {
            this.elements.confirmInstallBtn.addEventListener('click', () => this.showInstallPrompt());
        }

        // Événements online/offline
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
    }

    /**
     * Gérer l'événement beforeinstallprompt
     */
    handleBeforeInstallPrompt(e) {
        e.preventDefault();
        this.deferredPrompt = e;
        
        console.log('📲 beforeinstallprompt capturé - App installable');
        
        // Afficher les options d'installation
        this.showInstallOptions();
    }

    /**
     * Afficher les options d'installation
     */
    showInstallOptions() {
        // Afficher la bannière
        if (this.elements.installPromptBanner) {
            this.elements.installPromptBanner.style.display = 'block';
            console.log('📲 Bannière d\'installation affichée');
        }

        // Afficher le bouton dans la navbar
        if (this.elements.installAppBtn) {
            this.elements.installAppBtn.style.display = 'flex';
        }

        // Demander les permissions de notification
        this.requestNotificationPermission();
    }

    /**
     * Afficher le prompt d'installation
     */
    async showInstallPrompt() {
        if (!this.deferredPrompt) {
            console.warn('❌ deferredPrompt non disponible');
            this.showInstallInfoModal();
            return;
        }

        try {
            // Afficher le dialogue d'installation du navigateur
            this.deferredPrompt.prompt();

            // Attendre la réponse de l'utilisateur
            const { outcome } = await this.deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('✅ Utilisateur a accepté l\'installation');
                this.handleInstallAccepted();
            } else {
                console.log('❌ Utilisateur a refusé l\'installation');
                this.handleInstallRejected();
            }

            // Réinitialiser le deferredPrompt
            this.deferredPrompt = null;
        } catch (error) {
            console.error('❌ Erreur lors de l\'installation:', error);
        }
    }

    /**
     * Installation acceptée par l'utilisateur
     */
    handleInstallAccepted() {
        this.hideInstallPrompt();
        this.showInstallSuccessNotification();
        this.isInstalled = true;
        
        // Sauvegarder dans localStorage
        localStorage.setItem('pwa-installed', 'true');
        localStorage.setItem('pwa-install-date', new Date().toISOString());
    }

    /**
     * Installation refusée par l'utilisateur
     */
    handleInstallRejected() {
        // Afficher qui peut avoir l'intention de réessayer
        console.log('⏰ Vous pouvez réinstaller plus tard');
    }

    /**
     * Gérer le clic sur le bouton navbar
     */
    async handleNavbarInstallClick() {
        if (!this.deferredPrompt) {
            console.log('ℹ️ L\'application est déjà installée ou l\'installation n\'est pas disponible');
            this.showInstallInfoModal();
            return;
        }

        await this.showInstallPrompt();
    }

    /**
     * Afficher le modal d'information d'installation
     */
    showInstallInfoModal() {
        if (this.elements.installAppModal) {
            this.elements.installAppModal.style.display = 'block';
            if (this.elements.modalOverlay) {
                this.elements.modalOverlay.style.display = 'block';
            }
        }
    }

    /**
     * Cacher la bannière d'installation
     */
    hideInstallPrompt() {
        if (this.elements.installPromptBanner) {
            this.elements.installPromptBanner.style.display = 'none';
        }
    }

    /**
     * L'app a été installée avec succès
     */
    handleAppInstalled() {
        console.log('🎉 PWA installée avec succès!');
        
        this.hideInstallPrompt();
        
        if (this.elements.installAppBtn) {
            this.elements.installAppBtn.style.display = 'none';
        }

        this.isInstalled = true;
        localStorage.setItem('pwa-installed', 'true');
        localStorage.setItem('pwa-install-date', new Date().toISOString());

        // Notification système
        this.showInstallSuccessNotification();
    }

    /**
     * Afficher une notification de succès d'installation
     */
    showInstallSuccessNotification() {
        // Notification système
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('SIG Kédougou installée! 🎉', {
                body: 'L\'application est maintenant installée sur votre écran d\'accueil.',
                icon: 'icons/icon.svg',
                badge: 'icons/icon-192x192.png',
                tag: 'install-success',
                requireInteraction: false
            });
        }

        console.log('✅ L\'application a été installée avec succès!');
    }

    /**
     * Demander la permission pour les notifications
     */
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                console.log('🔔 Permission Notification:', permission);
                if (permission === 'granted') {
                    this.sendNotification('SIG Kédougou', {
                        body: 'Notifications activées! Vous recevrez des mises à jour.',
                        icon: 'icons/icon.svg'
                    });
                }
            });
        }
    }

    /**
     * Envoyer une notification système
     */
    sendNotification(title, options = {}) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, options);
        }
    }

    /**
     * Vérifier si l'app est déjà installée
     */
    checkIfInstalled() {
        const installed = localStorage.getItem('pwa-installed');
        if (installed === 'true') {
            this.isInstalled = true;
            console.log('✅ App déjà installée');
        }

        // Aussi masquer le bouton si standalone
        if (window.navigator.standalone === true) {
            this.isInstalled = true;
            if (this.elements.installAppBtn) {
                this.elements.installAppBtn.style.display = 'none';
            }
        }
    }

    /**
     * Détecter la plateforme
     */
    detectPlatform() {
        const ua = navigator.userAgent;
        if (/Android/.test(ua)) {
            return 'android';
        } else if (/iPhone|iPad|iPod|Mac OS/.test(ua)) {
            return 'ios';
        } else if (/Windows|Linux/.test(ua)) {
            return 'desktop';
        }
        return 'unknown';
    }

    /**
     * Gérer le passage en ligne
     */
    handleOnline() {
        console.log('📡 Connexion rétablie');
        
        // Retirer la bannière offline s'il existe
        if (this.elements.offlineBanner) {
            this.elements.offlineBanner.remove();
            this.elements.offlineBanner = null;
        }

        // Envoyer une notification
        this.sendNotification('SIG Kédougou', {
            body: 'Connexion rétablie. Synchronisation en cours...',
            icon: 'icons/icon.svg'
        });
    }

    /**
     * Gérer le passage hors ligne
     */
    handleOffline() {
        console.log('📴 Mode hors ligne activé');

        // Créer une bannière offline
        const banner = document.createElement('div');
        banner.style.cssText = `
            position: fixed;
            top: 50px;
            width: calc(100% - 20px);
            background: #e74c3c;
            color: white;
            padding: 12px 10px;
            text-align: center;
            z-index: 9998;
            border-radius: 4px;
            margin: 10px;
            font-weight: 500;
            animation: slideDown 0.3s ease-out;
        `;
        banner.textContent = '⚠️ Vous êtes hors ligne. L\'application fonctionne en mode offline.';
        
        // Ajouter une animation si elle n'existe pas
        if (!document.getElementById('pwa-animations')) {
            const style = document.createElement('style');
            style.id = 'pwa-animations';
            style.textContent = `
                @keyframes slideDown {
                    from { transform: translateY(-100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.insertBefore(banner, document.body.firstChild);
        this.elements.offlineBanner = banner;
    }

    /**
     * Enregistrer le Service Worker
     */
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('sw.js', { scope: '/sig-kedougou/' })
                    .then(registration => {
                        console.log('✅ Service Worker enregistré:', registration);
                        
                        // Vérifier les mises à jour
                        this.checkForUpdates(registration);
                    })
                    .catch(error => {
                        console.error('❌ Erreur Service Worker:', error);
                    });
            });
        }
    }

    /**
     * Vérifier les mises à jour du Service Worker
     */
    checkForUpdates(registration) {
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
                    console.log('📦 Nouvelle version disponible');
                    
                    // Afficher une notification
                    this.sendNotification('SIG Kédougou mise à jour', {
                        body: 'Une nouvelle version est disponible. Rechargez la page.',
                        icon: 'icons/icon.svg',
                        tag: 'update-available'
                    });
                }
            });
        });
    }

    /**
     * Obtenir les informations sur l'installation
     */
    getInstallInfo() {
        return {
            isInstalled: this.isInstalled,
            platform: this.platform,
            installDate: localStorage.getItem('pwa-install-date'),
            swReady: 'serviceWorker' in navigator,
            notificationsReady: 'Notification' in window,
            geolocationReady: 'geolocation' in navigator
        };
    }

    /**
     * Afficher les infos de debug
     */
    debugInfo() {
        const info = this.getInstallInfo();
        console.group('🐛 PWA Debug Info');
        console.table(info);
        console.log('Capabilities:', {
            offline: 'serviceWorker' in navigator,
            install: this.deferredPrompt !== null,
            notifications: 'Notification' in window,
            geolocation: 'geolocation' in navigator
        });
        console.groupEnd();
    }
}

/**
 * Initialiser le gestionnaire PWA au chargement
 */
document.addEventListener('DOMContentLoaded', () => {
    window.pwaManager = new PWAInstallationManager();
    window.pwaManager.registerServiceWorker();
});

/**
 * Ajouter une fonction globale pour déboguer
 */
window.pwaDebug = () => {
    if (window.pwaManager) {
        window.pwaManager.debugInfo();
    } else {
        console.log('❌ PWA Manager pas encore initialisé');
    }
};

console.log('✅ PWA Installation Manager chargé');
console.log('💡 Tapez pwaDebug() en console pour voir les infos');
