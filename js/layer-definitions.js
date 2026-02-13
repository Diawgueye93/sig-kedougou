// ========================================
// MAP LAYERS AND STYLING
// ========================================

// Global layer references
var layer_GoogleSatelliteHybrid_0;
var layer_OpenStreetMap_1;
var layer_CartoDBDarkMatter_2;
var layer_Regions_Senegal_3;
var layer_Region_Kedougou_4;
var layer_Kedougou_Departements_5;
var layer_Kedougou_Arrondissements_6;
var layer_Kedougou_Ecoles_7;
var layer_Kedougou_Hydrographie_8;
var layer_Kedougou_Routes_9;
var layer_Kedougou_Localites_10;

// Global objects
var obj2 = { gcd: null };
var obj3 = { marker: null };
var labels = [];
var totalMarkers = 0;

// ========================================
// POPUP AND FEATURE HANDLERS
// ========================================

function pop_Regions_Senegal_3(feature, layer) {
    layer.on({
        mouseout: function(e) {
            for (var i in e.target._eventParents) {
                if (typeof e.target._eventParents[i].resetStyle === 'function') {
                    e.target._eventParents[i].resetStyle(e.target);
                }
            }
            if (typeof layer.closePopup == 'function') {
                layer.closePopup();
            } else {
                layer.eachLayer(function(feature){
                    feature.closePopup()
                });
            }
        },
        mouseover: highlightFeature,
    });
    var popupContent = '<table>\
            <tr>\
                <th scope="row">Shape_Le_1</th>\
                <td>' + (feature.properties['Shape_Le_1'] !== null ? autolinker.link(String(feature.properties['Shape_Le_1']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <td colspan="2"><strong>Shape_Area</strong><br />' + (feature.properties['Shape_Area'] !== null ? autolinker.link(String(feature.properties['Shape_Area']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
        </table>';
    var content = removeEmptyRowsFromPopupContent(popupContent, feature);
    layer.on('popupopen', function(e) { addClassToPopupIfMedia(content, e.popup); });
    layer.bindPopup(content, { maxHeight: 400 });
}

function style_Regions_Senegal_3_0() {
    return {
        pane: 'pane_Regions_Senegal_3',
        opacity: 1,
        color: 'rgba(35,35,35,1.0)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 3.0, 
        fillOpacity: 0,
        interactive: true,
    }
}

function pop_Region_Kedougou_4(feature, layer) {
    layer.on({
        mouseout: function(e) {
            for (var i in e.target._eventParents) {
                if (typeof e.target._eventParents[i].resetStyle === 'function') {
                    e.target._eventParents[i].resetStyle(e.target);
                }
            }
            if (typeof layer.closePopup == 'function') {
                layer.closePopup();
            } else {
                layer.eachLayer(function(feature){
                    feature.closePopup()
                });
            }
        },
        mouseover: highlightFeature,
    });
    var popupContent = '<table>\
            <tr>\
                <td colspan="2"><strong>Code</strong><br />' + (feature.properties['Code'] !== null ? autolinker.link(String(feature.properties['Code']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <td colspan="2"><strong>Région</strong><br />' + (feature.properties['Région'] !== null ? autolinker.link(String(feature.properties['Région']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <td colspan="2"><strong>Shape_Area</strong><br />' + (feature.properties['Shape_Area'] !== null ? autolinker.link(String(feature.properties['Shape_Area']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
        </table>';
    var content = removeEmptyRowsFromPopupContent(popupContent, feature);
    layer.on('popupopen', function(e) { addClassToPopupIfMedia(content, e.popup); });
    layer.bindPopup(content, { maxHeight: 400 });
}

function style_Region_Kedougou_4_0() {
    return {
        pane: 'pane_Region_Kedougou_4',
        opacity: 1,
        color: 'rgba(35,35,35,1.0)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 3.0, 
        fill: true,
        fillOpacity: 1,
        fillColor: 'rgba(242,228,210,1.0)',
        interactive: true,
    }
}

function pop_Kedougou_Departements_5(feature, layer) {
    layer.on({
        mouseout: function(e) {
            for (var i in e.target._eventParents) {
                if (typeof e.target._eventParents[i].resetStyle === 'function') {
                    e.target._eventParents[i].resetStyle(e.target);
                }
            }
            if (typeof layer.closePopup == 'function') {
                layer.closePopup();
            } else {
                layer.eachLayer(function(feature){
                    feature.closePopup()
                });
            }
        },
        mouseover: highlightFeature,
    });
    var popupContent = '<table>\
            <tr>\
                <td colspan="2"><strong>dept</strong><br />' + (feature.properties['dept'] !== null ? autolinker.link(String(feature.properties['dept']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <td colspan="2"><strong>cod_dept</strong><br />' + (feature.properties['cod_dept'] !== null ? autolinker.link(String(feature.properties['cod_dept']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <td colspan="2"><strong>Shape_Area</strong><br />' + (feature.properties['Shape_Area'] !== null ? autolinker.link(String(feature.properties['Shape_Area']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
        </table>';
    var content = removeEmptyRowsFromPopupContent(popupContent, feature);
    layer.on('popupopen', function(e) { addClassToPopupIfMedia(content, e.popup); });
    layer.bindPopup(content, { maxHeight: 400 });
}

function style_Kedougou_Departements_5_0(feature) {
    switch(String(feature.properties['dept'])) {
        case 'SALEMATA':
            return {
        pane: 'pane_Kedougou_Departements_5',
        opacity: 1,
        color: 'rgba(35,35,35,0.5)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 1.0, 
        fill: true,
        fillOpacity: 1,
        fillColor: 'rgba(182,17,232,0.5)',
        interactive: true,
    }
            break;
        case 'SARAYA':
            return {
        pane: 'pane_Kedougou_Departements_5',
        opacity: 1,
        color: 'rgba(35,35,35,0.5)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 1.0, 
        fill: true,
        fillOpacity: 1,
        fillColor: 'rgba(140,221,113,0.5)',
        interactive: true,
    }
            break;
        case 'KEDOUGOU':
            return {
        pane: 'pane_Kedougou_Departements_5',
        opacity: 1,
        color: 'rgba(153,80,119,0.5)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 1.0, 
        fill: true,
        fillOpacity: 1,
        fillColor: 'rgba(217,42,136,0.5)',
        interactive: true,
    }
            break;
    }
}

function pop_Kedougou_Arrondissements_6(feature, layer) {
    layer.on({
        mouseout: function(e) {
            for (var i in e.target._eventParents) {
                if (typeof e.target._eventParents[i].resetStyle === 'function') {
                    e.target._eventParents[i].resetStyle(e.target);
                }
            }
            if (typeof layer.closePopup == 'function') {
                layer.closePopup();
            } else {
                layer.eachLayer(function(feature){
                    feature.closePopup()
                });
            }
        },
        mouseover: highlightFeature,
    });
    var popupContent = '<table>\
            <tr>\
                <td colspan="2"><strong>dept</strong><br />' + (feature.properties['dept'] !== null ? autolinker.link(String(feature.properties['dept']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <td colspan="2"><strong>arr</strong><br />' + (feature.properties['arr'] !== null ? autolinker.link(String(feature.properties['arr']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <td colspan="2"><strong>Shape_Area</strong><br />' + (feature.properties['Shape_Area'] !== null ? autolinker.link(String(feature.properties['Shape_Area']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
        </table>';
    var content = removeEmptyRowsFromPopupContent(popupContent, feature);
    layer.on('popupopen', function(e) { addClassToPopupIfMedia(content, e.popup); });
    layer.bindPopup(content, { maxHeight: 400 });
}

function style_Kedougou_Arrondissements_6_0() {
    return {
        pane: 'pane_Kedougou_Arrondissements_6',
        opacity: 1,
        color: 'rgba(35,35,35,1.0)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 2.0, 
        fill: true,
        fillOpacity: 1,
        fillColor: 'rgba(190,207,80,1.0)',
        interactive: true,
    }
}

function pop_Kedougou_Ecoles_7(feature, layer) {
    layer.on({
        mouseout: function(e) {
            for (var i in e.target._eventParents) {
                if (typeof e.target._eventParents[i].resetStyle === 'function') {
                    e.target._eventParents[i].resetStyle(e.target);
                }
            }
            if (typeof layer.closePopup == 'function') {
                layer.closePopup();
            } else {
                layer.eachLayer(function(feature){
                    feature.closePopup()
                });
            }
        },
        mouseover: highlightFeature,
    });
    var popupContent = '<table>\
            <tr>\
                <td colspan="2"><strong>Type</strong><br />' + (feature.properties['Type'] !== null ? autolinker.link(String(feature.properties['Type']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <td colspan="2"><strong>Nom</strong><br />' + (feature.properties['Nom'] !== null ? autolinker.link(String(feature.properties['Nom']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
        </table>';
    var content = removeEmptyRowsFromPopupContent(popupContent, feature);
    layer.on('popupopen', function(e) { addClassToPopupIfMedia(content, e.popup); });
    layer.bindPopup(content, { maxHeight: 400 });
}

function style_Kedougou_Ecoles_7_0() {
    return {
        pane: 'pane_Kedougou_Ecoles_7',
        rotationAngle: 0.0,
        rotationOrigin: 'center center',
        icon: L.icon({
            iconUrl: 'markers/Kedougou_Ecoles_7.svg',
            iconSize: [26.599999999999998, 26.599999999999998]
        }),
        interactive: true,
    }
}

function pop_Kedougou_Hydrographie_8(feature, layer) {
    layer.on({
        mouseout: function(e) {
            for (var i in e.target._eventParents) {
                if (typeof e.target._eventParents[i].resetStyle === 'function') {
                    e.target._eventParents[i].resetStyle(e.target);
                }
            }
            if (typeof layer.closePopup == 'function') {
                layer.closePopup();
            } else {
                layer.eachLayer(function(feature){
                    feature.closePopup()
                });
            }
        },
        mouseover: highlightFeature,
    });
    var popupContent = '<table>\
            <tr>\
                <td colspan="2"><strong>NOM</strong><br />' + (feature.properties['NOM'] !== null ? autolinker.link(String(feature.properties['NOM']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
        </table>';
    var content = removeEmptyRowsFromPopupContent(popupContent, feature);
    layer.on('popupopen', function(e) { addClassToPopupIfMedia(content, e.popup); });
    layer.bindPopup(content, { maxHeight: 400 });
}

function style_Kedougou_Hydrographie_8_0() {
    return {
        pane: 'pane_Kedougou_Hydrographie_8',
        opacity: 1,
        color: 'rgba(23,79,255,1.0)',
        dashArray: '',
        lineCap: 'square',
        lineJoin: 'bevel',
        weight: 2.0,
        fillOpacity: 0,
        interactive: true,
    }
}

function pop_Kedougou_Routes_9(feature, layer) {
    layer.on({
        mouseout: function(e) {
            for (var i in e.target._eventParents) {
                if (typeof e.target._eventParents[i].resetStyle === 'function') {
                    e.target._eventParents[i].resetStyle(e.target);
                }
            }
            if (typeof layer.closePopup == 'function') {
                layer.closePopup();
            } else {
                layer.eachLayer(function(feature){
                    feature.closePopup()
                });
            }
        },
        mouseover: highlightFeature,
    });
    var popupContent = '<table>\
        </table>';
    var content = removeEmptyRowsFromPopupContent(popupContent, feature);
    layer.on('popupopen', function(e) { addClassToPopupIfMedia(content, e.popup); });
    layer.bindPopup(content, { maxHeight: 400 });
}

function style_Kedougou_Routes_9_0() {
    return {
        pane: 'pane_Kedougou_Routes_9',
        opacity: 1,
        color: 'rgba(221,206,45,1.0)',
        dashArray: '',
        lineCap: 'square',
        lineJoin: 'bevel',
        weight: 2.0,
        fillOpacity: 0,
        interactive: true,
    }
}

function pop_Kedougou_Localites_10(feature, layer) {
    layer.on({
        mouseout: function(e) {
            for (var i in e.target._eventParents) {
                if (typeof e.target._eventParents[i].resetStyle === 'function') {
                    e.target._eventParents[i].resetStyle(e.target);
                }
            }
            if (typeof layer.closePopup == 'function') {
                layer.closePopup();
            } else {
                layer.eachLayer(function(feature){
                    feature.closePopup()
                });
            }
        },
        mouseover: highlightFeature,
    });
    var popupContent = '<table>\
            <tr>\
                <td colspan="2"><strong>X_UTM</strong><br />' + (feature.properties['X_UTM'] !== null ? autolinker.link(String(feature.properties['X_UTM']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <td colspan="2"><strong>Y_UTM</strong><br />' + (feature.properties['Y_UTM'] !== null ? autolinker.link(String(feature.properties['Y_UTM']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
        </table>';
    var content = removeEmptyRowsFromPopupContent(popupContent, feature);
    layer.on('popupopen', function(e) { addClassToPopupIfMedia(content, e.popup); });
    layer.bindPopup(content, { maxHeight: 400 });
}

function style_Kedougou_Localites_10_0() {
    return {
        pane: 'pane_Kedougou_Localites_10',
        radius: 4.4,
        opacity: 1,
        color: 'rgba(0,0,0,1.0)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 1,
        fill: true,
        fillOpacity: 1,
        fillColor: 'rgba(129,119,119,1.0)',
        interactive: true,
    }
}

// Call this after map is initialized
// This function is called from modern-app-script.js after a delay
function initializeAllLayers() {
    if (typeof map === 'undefined') {
        console.error('Map is not initialized');
        return;
    }
    
    // Basemaps
    map.createPane('pane_GoogleSatelliteHybrid_0');
    map.getPane('pane_GoogleSatelliteHybrid_0').style.zIndex = 400;
    layer_GoogleSatelliteHybrid_0 = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        pane: 'pane_GoogleSatelliteHybrid_0',
        opacity: 1.0,
        attribution: '',
        minZoom: 1,
        maxZoom: 28,
    });
    map.addLayer(layer_GoogleSatelliteHybrid_0);
    
    map.createPane('pane_OpenStreetMap_1');
    map.getPane('pane_OpenStreetMap_1').style.zIndex = 401;
    layer_OpenStreetMap_1 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        pane: 'pane_OpenStreetMap_1',
        opacity: 1.0,
        attribution: '',
        minZoom: 1,
        maxZoom: 28,
        minNativeZoom: 0,
        maxNativeZoom: 19
    });
    map.addLayer(layer_OpenStreetMap_1);
    
    map.createPane('pane_CartoDBDarkMatter_2');
    map.getPane('pane_CartoDBDarkMatter_2').style.zIndex = 402;
    layer_CartoDBDarkMatter_2 = L.tileLayer('https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
        pane: 'pane_CartoDBDarkMatter_2',
        opacity: 1.0,
        attribution: '',
        minZoom: 1,
        maxZoom: 28,
        minNativeZoom: 0,
        maxNativeZoom: 30
    });
    map.addLayer(layer_CartoDBDarkMatter_2);
    
    // Data layers
    map.createPane('pane_Regions_Senegal_3');
    map.getPane('pane_Regions_Senegal_3').style.zIndex = 403;
    map.getPane('pane_Regions_Senegal_3').style['mix-blend-mode'] = 'normal';
    layer_Regions_Senegal_3 = new L.geoJson(json_Regions_Senegal_3, {
        attribution: '',
        interactive: true,
        dataVar: 'json_Regions_Senegal_3',
        layerName: 'layer_Regions_Senegal_3',
        pane: 'pane_Regions_Senegal_3',
        onEachFeature: pop_Regions_Senegal_3,
        style: style_Regions_Senegal_3_0,
    });
    map.addLayer(layer_Regions_Senegal_3);
    
    map.createPane('pane_Region_Kedougou_4');
    map.getPane('pane_Region_Kedougou_4').style.zIndex = 404;
    map.getPane('pane_Region_Kedougou_4').style['mix-blend-mode'] = 'normal';
    layer_Region_Kedougou_4 = new L.geoJson(json_Region_Kedougou_4, {
        attribution: '',
        interactive: true,
        dataVar: 'json_Region_Kedougou_4',
        layerName: 'layer_Region_Kedougou_4',
        pane: 'pane_Region_Kedougou_4',
        onEachFeature: pop_Region_Kedougou_4,
        style: style_Region_Kedougou_4_0,
    });
    map.addLayer(layer_Region_Kedougou_4);
    
    map.createPane('pane_Kedougou_Departements_5');
    map.getPane('pane_Kedougou_Departements_5').style.zIndex = 405;
    map.getPane('pane_Kedougou_Departements_5').style['mix-blend-mode'] = 'normal';
    layer_Kedougou_Departements_5 = new L.geoJson(json_Kedougou_Departements_5, {
        attribution: '',
        interactive: true,
        dataVar: 'json_Kedougou_Departements_5',
        layerName: 'layer_Kedougou_Departements_5',
        pane: 'pane_Kedougou_Departements_5',
        onEachFeature: pop_Kedougou_Departements_5,
        style: style_Kedougou_Departements_5_0,
    });
    map.addLayer(layer_Kedougou_Departements_5);
    
    map.createPane('pane_Kedougou_Arrondissements_6');
    map.getPane('pane_Kedougou_Arrondissements_6').style.zIndex = 406;
    map.getPane('pane_Kedougou_Arrondissements_6').style['mix-blend-mode'] = 'normal';
    layer_Kedougou_Arrondissements_6 = new L.geoJson(json_Kedougou_Arrondissements_6, {
        attribution: '',
        interactive: true,
        dataVar: 'json_Kedougou_Arrondissements_6',
        layerName: 'layer_Kedougou_Arrondissements_6',
        pane: 'pane_Kedougou_Arrondissements_6',
        onEachFeature: pop_Kedougou_Arrondissements_6,
        style: style_Kedougou_Arrondissements_6_0,
    });
    map.addLayer(layer_Kedougou_Arrondissements_6);
    
    map.createPane('pane_Kedougou_Ecoles_7');
    map.getPane('pane_Kedougou_Ecoles_7').style.zIndex = 407;
    map.getPane('pane_Kedougou_Ecoles_7').style['mix-blend-mode'] = 'normal';
    layer_Kedougou_Ecoles_7 = new L.geoJson(json_Kedougou_Ecoles_7, {
        attribution: '',
        interactive: true,
        dataVar: 'json_Kedougou_Ecoles_7',
        layerName: 'layer_Kedougou_Ecoles_7',
        pane: 'pane_Kedougou_Ecoles_7',
        onEachFeature: pop_Kedougou_Ecoles_7,
        pointToLayer: function (feature, latlng) {
            var context = { feature: feature, variables: {} };
            return L.marker(latlng, style_Kedougou_Ecoles_7_0(feature));
        },
    });
    map.addLayer(layer_Kedougou_Ecoles_7);
    
    map.createPane('pane_Kedougou_Hydrographie_8');
    map.getPane('pane_Kedougou_Hydrographie_8').style.zIndex = 408;
    map.getPane('pane_Kedougou_Hydrographie_8').style['mix-blend-mode'] = 'normal';
    layer_Kedougou_Hydrographie_8 = new L.geoJson(json_Kedougou_Hydrographie_8, {
        attribution: '',
        interactive: true,
        dataVar: 'json_Kedougou_Hydrographie_8',
        layerName: 'layer_Kedougou_Hydrographie_8',
        pane: 'pane_Kedougou_Hydrographie_8',
        onEachFeature: pop_Kedougou_Hydrographie_8,
        style: style_Kedougou_Hydrographie_8_0,
    });
    map.addLayer(layer_Kedougou_Hydrographie_8);
    
    map.createPane('pane_Kedougou_Routes_9');
    map.getPane('pane_Kedougou_Routes_9').style.zIndex = 409;
    map.getPane('pane_Kedougou_Routes_9').style['mix-blend-mode'] = 'normal';
    layer_Kedougou_Routes_9 = new L.geoJson(json_Kedougou_Routes_9, {
        attribution: '',
        interactive: true,
        dataVar: 'json_Kedougou_Routes_9',
        layerName: 'layer_Kedougou_Routes_9',
        pane: 'pane_Kedougou_Routes_9',
        onEachFeature: pop_Kedougou_Routes_9,
        style: style_Kedougou_Routes_9_0,
    });
    map.addLayer(layer_Kedougou_Routes_9);
    
    map.createPane('pane_Kedougou_Localites_10');
    map.getPane('pane_Kedougou_Localites_10').style.zIndex = 410;
    map.getPane('pane_Kedougou_Localites_10').style['mix-blend-mode'] = 'normal';
    layer_Kedougou_Localites_10 = new L.geoJson(json_Kedougou_Localites_10, {
        attribution: '',
        interactive: true,
        dataVar: 'json_Kedougou_Localites_10',
        layerName: 'layer_Kedougou_Localites_10',
        pane: 'pane_Kedougou_Localites_10',
        onEachFeature: pop_Kedougou_Localites_10,
        pointToLayer: function (feature, latlng) {
            var context = { feature: feature, variables: {} };
            return L.circleMarker(latlng, style_Kedougou_Localites_10_0(feature));
        },
    });
    map.addLayer(layer_Kedougou_Localites_10);
}

// Auto-call when map becomes available
if (typeof map !== 'undefined') {
    initializeAllLayers();
}
