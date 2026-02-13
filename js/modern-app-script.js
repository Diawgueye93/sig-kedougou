// ========================================
// MODERN APP INITIALIZATION
// ========================================

// Global variables
var map;
var highlightLayer;
var autolinker;

// Wait for Autolinker to be loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof Autolinker !== 'undefined') {
        autolinker = new Autolinker({truncate: {length: 30, location: 'smart'}});
    }
});

// ========================================
// INITIALIZE MAP
// ========================================

function initializeMap() {
    // Create map with initial bounds
    map = L.map('map', {
        zoomControl: false,
        maxZoom: 28,
        minZoom: 1
    }).fitBounds([[12.066625555504679,-13.561263688142965],[13.820871084572381,-10.193112272332975]]);
    
    var hash = new L.Hash(map);
    map.attributionControl.setPrefix('<a href="https://github.com/tomchadwin/qgis2web" target="_blank">qgis2web</a> &middot; <a href="https://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> &middot; <a href="https://qgis.org">QGIS</a>');
    
    return map;
}

// ========================================
// FEATURE HIGHLIGHTING
// ========================================

function highlightFeature(e) {
    highlightLayer = e.target;
    
    // Check if layer has setStyle method (Path objects like Polygons, Lines)
    if (typeof highlightLayer.setStyle === 'function') {
        if (e.target.feature.geometry.type === 'LineString' || e.target.feature.geometry.type === 'MultiLineString') {
            highlightLayer.setStyle({
                color: 'rgba(255, 255, 0, 1.00)',
                weight: 3
            });
        } else {
            highlightLayer.setStyle({
                fillColor: 'rgba(255, 255, 0, 1.00)',
                fillOpacity: 0.8
            });
        }
    }
    
    // Open popup if available
    if (typeof highlightLayer.openPopup === 'function') {
        highlightLayer.openPopup();
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function removeEmptyRowsFromPopupContent(content, feature) {
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    var rows = tempDiv.querySelectorAll('tr');
    for (var i = 0; i < rows.length; i++) {
        var td = rows[i].querySelector('td.visible-with-data');
        var key = td ? td.id : '';
        if (td && td.classList.contains('visible-with-data') && feature.properties[key] == null) {
            rows[i].parentNode.removeChild(rows[i]);
        }
    }
    return tempDiv.innerHTML;
}

function addClassToPopupIfMedia(content, popup) {
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    var imgTd = tempDiv.querySelector('td img');
    if (imgTd) {
        var src = imgTd.getAttribute('src');
        if (/\.(jpg|jpeg|png|gif|bmp|webp|avif)$/i.test(src)) {
            popup._contentNode.classList.add('media');
            setTimeout(function() {
                popup.update();
            }, 10);
        } else if (/\.(mp3|wav|ogg|aac)$/i.test(src)) {
            var audio = document.createElement('audio');
            audio.controls = true;
            audio.src = src;
            imgTd.parentNode.replaceChild(audio, imgTd);
            popup._contentNode.classList.add('media');
            setTimeout(function() {
                popup.setContent(tempDiv.innerHTML);
                popup.update();
            }, 10);
        } else if (/\.(mp4|webm|ogg|mov)$/i.test(src)) {
            var video = document.createElement('video');
            video.controls = true;
            video.src = src;
            video.style.width = "400px";
            video.style.height = "300px";
            video.style.maxHeight = "60vh";
            video.style.maxWidth = "60vw";
            imgTd.parentNode.replaceChild(video, imgTd);
            popup._contentNode.classList.add('media');
            video.addEventListener('loadedmetadata', function() {
                popup.update();
            });
            setTimeout(function() {
                popup.setContent(tempDiv.innerHTML);
                popup.update();
            }, 10);
        } else {
            popup._contentNode.classList.remove('media');
        }
    } else {
        popup._contentNode.classList.remove('media');
    }
}

// ========================================
// MODAL MANAGEMENT
// ========================================

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.getElementById('modalOverlay').classList.add('active');
    document.body.classList.add('no-scroll');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.getElementById('modalOverlay').classList.remove('active');
    document.body.classList.remove('no-scroll');
}

// Modal event listeners
document.querySelectorAll('.modal-close, .btn-close').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const modalId = this.dataset.modal;
        if (modalId) closeModal(modalId);
    });
});

document.getElementById('modalOverlay').addEventListener('click', function() {
    document.querySelectorAll('.modal.active').forEach(modal => {
        modal.classList.remove('active');
    });
    this.classList.remove('active');
    document.body.classList.remove('no-scroll');
});

// ========================================
// NAVBAR SEARCH
// ========================================

var navbarSearchInput = document.getElementById('navbar-search-input');
if (navbarSearchInput) {
    navbarSearchInput.addEventListener('input', function() {
        var query = this.value.toLowerCase().trim();
        
        if (query.length < 2) {
            return;
        }
        
        performNavbarSearch(query);
    });
    
    navbarSearchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            var query = this.value.toLowerCase().trim();
            if (query.length >= 2) {
                performNavbarSearch(query);
            }
        }
    });
}

function performNavbarSearch(query) {
    var results = [];
    
    // Search in all searchable layers
    searchableLayers.forEach(function(layerInfo) {
        var layerObj = window[layerInfo.layer];
        
        if (!layerObj || !layerObj.eachLayer) return;
        
        layerObj.eachLayer(function(feature) {
            if (feature.feature && feature.feature.properties) {
                var properties = feature.feature.properties;
                
                for (var key in properties) {
                    if (properties.hasOwnProperty(key)) {
                        var value = String(properties[key]).toLowerCase();
                        if (value.includes(query)) {
                            results.push({
                                layerName: layerInfo.name,
                                icon: layerInfo.icon,
                                property: key + ': ' + properties[key],
                                feature: feature,
                                bounds: feature.getBounds ? feature.getBounds() : null
                            });
                            return;
                        }
                    }
                }
            }
        });
    });
    
    // Zoom to first result if found
    if (results.length > 0) {
        var result = results[0];
        if (result.bounds) {
            map.fitBounds(result.bounds, { padding: [50, 50] });
        } else if (result.feature.latlng) {
            map.setView(result.feature.latlng, 15);
        }
        
        if (typeof result.feature.openPopup === 'function') {
            result.feature.openPopup();
        }
    }
}

// ========================================
// NAVBAR ACTIONS
// ========================================

document.querySelectorAll('.navbar-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        const action = this.dataset.action;
        
        switch(action) {
            case 'home':
                openModal('homeModal');
                break;
            case 'about':
                openModal('aboutModal');
                break;
            case 'catalog':
                openModal('catalogModal');
                break;
            case 'spatial-query':
                openModal('spatialQueryModal');
                break;
            case 'attribute-query':
                openModal('attributeQueryModal');
                break;
            case 'download':
                openModal('downloadModal');
                break;
            case 'measure':
                toggleMeasureTool();
                break;
            case 'zoom':
                map.fitBounds([[12.066625555504679,-13.561263688142965],[13.820871084572381,-10.193112272332975]]);
                break;
        }
    });
});

// ========================================
// PANEL TOGGLES
// ========================================

document.getElementById('left-panel-toggle').addEventListener('click', function() {
    const leftPanel = document.querySelector('.left-panel');
    leftPanel.classList.toggle('collapsed');
});

document.getElementById('right-panel-toggle').addEventListener('click', function() {
    const rightPanel = document.querySelector('.right-panel');
    rightPanel.classList.toggle('collapsed');
});

// ========================================
// TAB SWITCHING
// ========================================

document.querySelectorAll('.panel-tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const tabName = this.dataset.tab;
        
        // Remove active class from all buttons and tab contents
        document.querySelectorAll('.panel-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.panel-tab-content').forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked button and corresponding tab
        this.classList.add('active');
        document.getElementById(tabName + '-tab').classList.add('active');
    });
});

// ========================================
// MEASURE TOOL
// ========================================

function toggleMeasureTool() {
    var measureControl = document.querySelector('.leaflet-control-measure-toggle');
    if (measureControl) {
        measureControl.click();
    }
}

// ========================================
// POPULATE BASEMAPS
// ========================================

function populateBasemaps() {
    const basemapsContainer = document.getElementById('basemaps-list');
    basemapsContainer.innerHTML = '';
    
    const basemaps = [
        { name: 'OpenStreetMap', id: 'osm', layer: layer_OpenStreetMap_1 },
        { name: 'Google Satellite', id: 'google', layer: layer_GoogleSatelliteHybrid_0 },
        { name: 'CartoDB Dark Matter', id: 'cartodb', layer: layer_CartoDBDarkMatter_2 }
    ];
    
    basemaps.forEach((bm, index) => {
        const div = document.createElement('div');
        div.className = 'basemap-item';
        div.innerHTML = `
            <input type="radio" id="basemap-${bm.id}" name="basemap" value="${bm.id}" ${index === 1 ? 'checked' : ''}>
            <label for="basemap-${bm.id}">${bm.name}</label>
        `;
        
        div.querySelector('input').addEventListener('change', function() {
            // Remove all basemaps
            [layer_OpenStreetMap_1, layer_GoogleSatelliteHybrid_0, layer_CartoDBDarkMatter_2].forEach(layer => {
                if (map.hasLayer(layer)) {
                    map.removeLayer(layer);
                }
            });
            
            // Add selected basemap
            map.addLayer(bm.layer);
        });
        
        basemapsContainer.appendChild(div);
    });
}

// ========================================
// POPULATE LEGEND
// ========================================

function populateLegend() {
    const legendContainer = document.getElementById('legend-list');
    legendContainer.innerHTML = '';
    
    const legendItems = [
        { img: 'legend/Kedougou_Localites_10.png', name: 'Localités' },
        { img: 'legend/Kedougou_Routes_9.png', name: 'Routes' },
        { img: 'legend/Kedougou_Hydrographie_8.png', name: 'Hydrographie' },
        { img: 'legend/Kedougou_Ecoles_7.png', name: 'Écoles' },
        { img: 'legend/Kedougou_Arrondissements_6.png', name: 'Arrondissements' },
        { img: 'legend/Region_Kedougou_4.png', name: 'Région de Kédougou' },
        { img: 'legend/Regions_Senegal_3.png', name: 'Régions du Sénégal' }
    ];
    
    legendItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'legend-item';
        div.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">${item.name}</div>
            <img src="${item.img}" alt="${item.name}" style="max-width: 100%;">
        `;
        legendContainer.appendChild(div);
    });
}

// ========================================
// POPULATE LAYERS
// ========================================

function populateLayers() {
    const layersContainer = document.getElementById('layers-container');
    layersContainer.innerHTML = '';
    
    const layers = [
        { name: 'Régions du Sénégal', id: 'Regions_Senegal_3', layer: layer_Regions_Senegal_3 },
        { name: 'Région de Kédougou', id: 'Region_Kedougou_4', layer: layer_Region_Kedougou_4 },
        { name: 'Départements', id: 'Kedougou_Departements_5', layer: layer_Kedougou_Departements_5 },
        { name: 'Arrondissements', id: 'Kedougou_Arrondissements_6', layer: layer_Kedougou_Arrondissements_6 },
        { name: 'Écoles', id: 'Kedougou_Ecoles_7', layer: layer_Kedougou_Ecoles_7 },
        { name: 'Hydrographie', id: 'Kedougou_Hydrographie_8', layer: layer_Kedougou_Hydrographie_8 },
        { name: 'Routes', id: 'Kedougou_Routes_9', layer: layer_Kedougou_Routes_9 },
        { name: 'Localités', id: 'Kedougou_Localites_10', layer: layer_Kedougou_Localites_10 }
    ];
    
    layers.forEach(item => {
        const div = document.createElement('div');
        div.style.cssText = 'padding: 10px; margin-bottom: 8px; background: #f8f9fa; border-radius: 5px; border-left: 3px solid #3498db;';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'layer-' + item.id;
        checkbox.checked = map.hasLayer(item.layer);
        checkbox.style.cssText = 'cursor: pointer; width: 18px; height: 18px; accent-color: #3498db; margin-right: 8px;';
        
        const label = document.createElement('label');
        label.htmlFor = 'layer-' + item.id;
        label.textContent = item.name;
        label.style.cssText = 'cursor: pointer; font-size: 13px; user-select: none;';
        
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                map.addLayer(item.layer);
            } else {
                map.removeLayer(item.layer);
            }
        });
        
        div.appendChild(checkbox);
        div.appendChild(label);
        layersContainer.appendChild(div);
    });
}

// ========================================
// DOWNLOAD FUNCTIONALITY
// ========================================

// Helper function to get selected layers for download
function getSelectedLayersForDownload() {
    const selectedLayers = [];
    const checked = document.querySelectorAll('#download-options input[type="checkbox"]:checked');
    
    if (checked.length === 0) {
        alert('Veuillez sélectionner au moins une couche à télécharger');
        return null;
    }
    
    checked.forEach(checkbox => {
        selectedLayers.push(checkbox.value);
    });
    
    return selectedLayers;
}

// Download GeoJSON button
if (document.getElementById('download-btn-geojson')) {
    document.getElementById('download-btn-geojson').addEventListener('click', function() {
        const selectedLayers = getSelectedLayersForDownload();
        if (selectedLayers && typeof downloadGeoJSON !== 'undefined') {
            downloadGeoJSON(selectedLayers);
        }
    });
}

// Download CSV button
if (document.getElementById('download-btn-csv')) {
    document.getElementById('download-btn-csv').addEventListener('click', function() {
        const selectedLayers = getSelectedLayersForDownload();
        if (selectedLayers && typeof downloadCSV !== 'undefined') {
            downloadCSV(selectedLayers);
        }
    });
}

// ========================================
// SPATIAL QUERY FUNCTIONALITY
// ========================================

document.querySelectorAll('.query-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const queryType = this.dataset.query;
        
        document.querySelectorAll('.query-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const queryDetails = document.getElementById('query-details');
        if (queryType === 'buffer') {
            queryDetails.style.display = 'block';
        } else {
            queryDetails.style.display = 'none';
        }
    });
});

document.getElementById('apply-query').addEventListener('click', function() {
    const activeBtn = document.querySelector('.query-btn.active');
    if (activeBtn) {
        const queryType = activeBtn.dataset.query;
        alert('Requête spatiale : ' + queryType + ' (Fonction à implémenter)');
    } else {
        alert('Veuillez sélectionner un type de requête');
    }
});

// ========================================
// ATTRIBUTE QUERY FUNCTIONALITY
// ========================================

document.getElementById('layer-select').addEventListener('change', function() {
    // Update attributes based on selected layer
    const attributeSelect = document.getElementById('attribute-select');
    attributeSelect.innerHTML = '<option value="">-- Sélectionner un attribut --</option>';
    
    const attributes = {
        'Kedougou_Departements': ['dept', 'cod_dept'],
        'Kedougou_Arrondissements': ['arr', 'dept'],
        'Kedougou_Ecoles': ['Nom', 'Type'],
        'Kedougou_Localites': ['X_UTM', 'Y_UTM']
    };
    
    if (this.value && attributes[this.value]) {
        attributes[this.value].forEach(attr => {
            const option = document.createElement('option');
            option.value = attr;
            option.textContent = attr;
            attributeSelect.appendChild(option);
        });
    }
});

document.getElementById('apply-filter').addEventListener('click', function() {
    const layer = document.getElementById('layer-select').value;
    const attribute = document.getElementById('attribute-select').value;
    const value = document.getElementById('attribute-value').value;
    
    if (!layer || !attribute || !value) {
        alert('Veuillez remplir tous les champs');
        return;
    }
    
    alert('Recherche : ' + attribute + ' = ' + value + ' (Fonction à implémenter)');
});

function initializeApp() {
    // Initialize map
    if (typeof L !== 'undefined') {
        initializeMap();
        
        // Initialize layers - give them time to load
        if (typeof initializeAllLayers !== 'undefined') {
            initializeAllLayers();
        }
        
        // Give UI a moment to set up after layers are ready
        setTimeout(function() {
            populateBasemaps();
            populateLegend();
            populateLayers();
            
            // Add zoom and locate controls
            L.control.zoom({ position: 'bottomleft' }).addTo(map);
            L.control.locate({ locateOptions: { maxZoom: 19 }, position: 'bottomleft' }).addTo(map);
            
            // Add measure control
            var measureControl = new L.Control.Measure({
                position: 'bottomleft',
                primaryLengthUnit: 'meters',
                secondaryLengthUnit: 'kilometers',
                primaryAreaUnit: 'sqmeters',
                secondaryAreaUnit: 'hectares'
            });
            measureControl.addTo(map);
            
            // Customize measure button
            var measureBtn = document.querySelector('.leaflet-control-measure-toggle');
            if (measureBtn) {
                measureBtn.innerHTML = '';
                measureBtn.className += ' fas fa-ruler';
            }
            
            // Initialize advanced features
            if (typeof populateCatalog !== 'undefined') {
                populateCatalog();
            }
            if (typeof initializeCoordinatesTracking !== 'undefined') {
                initializeCoordinatesTracking();
            }
            if (typeof addScaleBar !== 'undefined') {
                addScaleBar();
            }
            if (typeof initializeMinimap !== 'undefined') {
                initializeMinimap();
            }
            
            // Set default active tab
            var tabBtns = document.querySelectorAll('.panel-tab-btn');
            if (tabBtns.length > 0) {
                tabBtns.forEach(btn => btn.classList.remove('active'));
                tabBtns[0].classList.add('active');
                document.querySelectorAll('.panel-tab-content').forEach(t => t.classList.remove('active'));
                document.getElementById('basemaps-tab').classList.add('active');
            }
        }, 100);
    }
}

// Wait for Leaflet and data to load before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    setTimeout(initializeApp, 100);
}
