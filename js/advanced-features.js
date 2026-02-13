// ========================================
// ADVANCED FEATURES
// ========================================

// Track initialization state to avoid multiple initializations
var minimapInitialized = false;
var coordinatesInitialized = false;
var scaleBarInitialized = false;

// ========================================
// CATALOG DATA
// ========================================

var catalogData = [
    {
        name: "Régions du Sénégal",
        type: "Polygones",
        icon: "🗺️",
        description: "Délimitations des régions administratives du Sénégal",
        attributes: ["Shape_Le_1", "Shape_Area"]
    },
    {
        name: "Région de Kédougou",
        type: "Polygone",
        icon: "📍",
        description: "Zone délimitée de la région de Kédougou",
        attributes: ["Code", "Région", "Shape_Area"]
    },
    {
        name: "Départements",
        type: "Polygones",
        icon: "🏛️",
        description: "Subdivisions administratives de Kédougou: Salemata, Saraya, Kédougou",
        attributes: ["dept", "cod_dept", "Shape_Area"]
    },
    {
        name: "Arrondissements",
        type: "Polygones",
        icon: "🗂️",
        description: "Subdivisions des départements",
        attributes: ["arr", "dept", "Shape_Area"]
    },
    {
        name: "Écoles",
        type: "Points",
        icon: "🏫",
        description: "Localisation des établissements scolaires",
        attributes: ["Nom", "Type"]
    },
    {
        name: "Hydrographie",
        type: "Lignes",
        icon: "💧",
        description: "Réseau hydrographique (rivières et cours d'eau)",
        attributes: ["NOM"]
    },
    {
        name: "Routes",
        type: "Lignes",
        icon: "🛣️",
        description: "Réseau routier principal et secondaire",
        attributes: []
    },
    {
        name: "Localités",
        type: "Points",
        icon: "🏘️",
        description: "Localités du milieu rural",
        attributes: ["X_UTM", "Y_UTM"]
    }
];

// Populate catalog modal
function populateCatalog() {
    const catalogList = document.getElementById('catalog-list');
    catalogList.innerHTML = '';
    
    catalogData.forEach(item => {
        const div = document.createElement('div');
        div.className = 'catalog-item';
        
        let attributesHtml = '';
        if (item.attributes.length > 0) {
            attributesHtml = `<p><strong>Attributs:</strong> ${item.attributes.join(', ')}</p>`;
        }
        
        div.innerHTML = `
            <h4>${item.icon} ${item.name} <span class="catalog-badge">${item.type}</span></h4>
            <p>${item.description}</p>
            ${attributesHtml}
        `;
        
        catalogList.appendChild(div);
    });
}

// ========================================
// EXPORT FUNCTIONS
// ========================================

function downloadGeoJSON(selectedLayers) {
    const features = [];
    
    // Map layer names to global layer objects
    const layerMap = {
        'Regions_Senegal': layer_Regions_Senegal_3,
        'Region_Kedougou': layer_Region_Kedougou_4,
        'Kedougou_Departements': layer_Kedougou_Departements_5,
        'Kedougou_Arrondissements': layer_Kedougou_Arrondissements_6,
        'Kedougou_Ecoles': layer_Kedougou_Ecoles_7,
        'Kedougou_Hydrographie': layer_Kedougou_Hydrographie_8,
        'Kedougou_Routes': layer_Kedougou_Routes_9,
        'Kedougou_Localites': layer_Kedougou_Localites_10
    };
    
    selectedLayers.forEach(layerName => {
        const layer = layerMap[layerName];
        if (layer) {
            layer.eachLayer(function(featureLayer) {
                if (featureLayer.feature) {
                    features.push(featureLayer.feature);
                }
            });
        }
    });
    
    const geojson = {
        type: "FeatureCollection",
        features: features
    };
    
    downloadFile(JSON.stringify(geojson, null, 2), 'kedougou-data.geojson', 'application/json');
}

function downloadCSV(selectedLayers) {
    let csv = '';
    const layerMap = {
        'Regions_Senegal': { layer: layer_Regions_Senegal_3, name: 'Régions du Sénégal' },
        'Region_Kedougou': { layer: layer_Region_Kedougou_4, name: 'Région de Kédougou' },
        'Kedougou_Departements': { layer: layer_Kedougou_Departements_5, name: 'Départements' },
        'Kedougou_Arrondissements': { layer: layer_Kedougou_Arrondissements_6, name: 'Arrondissements' },
        'Kedougou_Ecoles': { layer: layer_Kedougou_Ecoles_7, name: 'Écoles' },
        'Kedougou_Hydrographie': { layer: layer_Kedougou_Hydrographie_8, name: 'Hydrographie' },
        'Kedougou_Routes': { layer: layer_Kedougou_Routes_9, name: 'Routes' },
        'Kedougou_Localites': { layer: layer_Kedougou_Localites_10, name: 'Localités' }
    };
    
    selectedLayers.forEach((layerName, index) => {
        const layerInfo = layerMap[layerName];
        if (layerInfo && layerInfo.layer) {
            const layer = layerInfo.layer;
            const rows = [];
            const headers = new Set();
            
            // Collect all headers
            layer.eachLayer(function(featureLayer) {
                if (featureLayer.feature && featureLayer.feature.properties) {
                    Object.keys(featureLayer.feature.properties).forEach(key => {
                        headers.add(key);
                    });
                }
            });
            
            // Add headers
            const headerArray = ['Couche', 'Géométrie', ...Array.from(headers)];
            csv += headerArray.map(h => `"${h}"`).join(',') + '\n';
            
            // Add rows
            layer.eachLayer(function(featureLayer) {
                if (featureLayer.feature) {
                    const feature = featureLayer.feature;
                    const geomType = feature.geometry ? feature.geometry.type : 'N/A';
                    const row = [layerInfo.name, geomType];
                    
                    headerArray.slice(2).forEach(header => {
                        const value = feature.properties ? feature.properties[header] : '';
                        row.push(value !== null && value !== undefined ? `"${value}"` : '""');
                    });
                    
                    csv += row.join(',') + '\n';
                }
            });
            
            if (index < selectedLayers.length - 1) {
                csv += '\n\n';
            }
        }
    });
    
    downloadFile(csv, 'kedougou-data.csv', 'text/csv');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

// ========================================
// COORDINATES TRACKING
// ========================================

function initializeCoordinatesTracking() {
    if (typeof map === 'undefined' || coordinatesInitialized) return;
    coordinatesInitialized = true;
    
    map.on('mousemove', function(e) {
        const lat = e.latlng.lat.toFixed(4);
        const lon = e.latlng.lng.toFixed(4);
        if (document.getElementById('lat')) document.getElementById('lat').textContent = lat + '°';
        if (document.getElementById('lon')) document.getElementById('lon').textContent = lon + '°';
    });
    
    map.on('zoomend', function() {
        if (document.getElementById('zoom-level')) document.getElementById('zoom-level').textContent = map.getZoom();
    });
    
    // Initial zoom level
    if (document.getElementById('zoom-level')) document.getElementById('zoom-level').textContent = map.getZoom();
}

// ========================================
// SCALE CONTROL
// ========================================

function addScaleBar() {
    if (typeof map === 'undefined' || typeof L === 'undefined' || scaleBarInitialized) return;
    scaleBarInitialized = true;
    
    L.control.scale({
        position: 'bottomright',
        metric: true,
        imperial: false
    }).addTo(map);
}

// ========================================
// MINIMAP
// ========================================

function initializeMinimap() {
    if (typeof map === 'undefined' || typeof L === 'undefined' || minimapInitialized) return;
    minimapInitialized = true;
    
    // Check if minimap container exists
    var minimapContainer = document.getElementById('minimap');
    if (!minimapContainer) {
        console.warn('Minimap container #minimap not found');
        return;
    }
    
    // Check if map is already initialized
    if (minimapContainer._leaflet_map) {
        console.warn('Minimap already initialized');
        return;
    }
    
    try {
        // Create minimap with a base layer
        var osmUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
        var osmLayer = new L.TileLayer(osmUrl, {
            minZoom: 0,
            maxZoom: 13,
            attribution: '© OSM'
        });
        
        var miniMap = new L.Map('minimap', {
            layers: [osmLayer],
            center: map.getCenter(),
            zoom: Math.max(1, map.getZoom() - 3),
            zoomControl: false,
            attributionControl: false,
            dragging: true,
            touchZoom: true,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false
        });
        
        // Draw bounds rectangle on minimap
        var bounds = L.rectangle(map.getBounds(), {
            color: '#e74c3c',
            weight: 2,
            fill: false,
            opacity: 0.6
        }).addTo(miniMap);
        
        // Sync minimap with main map
        map.on('move', function() {
            miniMap.setView(map.getCenter(), Math.max(1, map.getZoom() - 3));
            bounds.setBounds(map.getBounds());
        });
        
        map.on('zoom', function() {
            miniMap.setZoom(Math.max(1, map.getZoom() - 3));
            bounds.setBounds(map.getBounds());
        });
        
        // Click on minimap to move main map
        miniMap.on('click', function(e) {
            map.panTo(e.latlng);
        });
        
    } catch (e) {
        console.error('Error initializing minimap:', e);
    }
}

// ========================================
// UPDATE DOWNLOAD BUTTONS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Populate catalog
    populateCatalog();
    
    // Handle GeoJSON download
    const downloadBtnGeoJSON = document.getElementById('download-btn-geojson');
    if (downloadBtnGeoJSON) {
        downloadBtnGeoJSON.addEventListener('click', function() {
            const checked = document.querySelectorAll('#download-options input[type="checkbox"]:checked');
            
            if (checked.length === 0) {
                alert('Veuillez sélectionner au moins une couche à télécharger');
                return;
            }
            
            const selectedLayers = Array.from(checked).map(cb => cb.value);
            downloadGeoJSON(selectedLayers);
            closeModal('downloadModal');
            alert('Téléchargement GeoJSON préparé pour ' + checked.length + ' couche(s).');
        });
    }
    
    // Handle CSV download
    const downloadBtnCSV = document.getElementById('download-btn-csv');
    if (downloadBtnCSV) {
        downloadBtnCSV.addEventListener('click', function() {
            const checked = document.querySelectorAll('#download-options input[type="checkbox"]:checked');
            
            if (checked.length === 0) {
                alert('Veuillez sélectionner au moins une couche à télécharger');
                return;
            }
            
            const selectedLayers = Array.from(checked).map(cb => cb.value);
            downloadCSV(selectedLayers);
            closeModal('downloadModal');
            alert('Téléchargement CSV préparé pour ' + checked.length + ' couche(s).');
        });
    }
    
    // Initialize advanced features after map is ready
    setTimeout(function() {
        if (typeof map !== 'undefined') {
            initializeCoordinatesTracking();
            addScaleBar();
            initializeMinimap();
        }
    }, 1000);
});

