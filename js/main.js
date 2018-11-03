$(document).ready(function(){
    
    var baseLayers = new ol.layer.Group({
        title: 'Base maps',
        layers: [            
            new ol.layer.Tile({
                title: 'Google Maps',
                type: 'base',
                visible: true,
                source: new ol.source.XYZ({
                    attributions: [
                        new ol.Attribution({html: '<a href=""></a>'})],
                        url: 'https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}'
                })
            }),
            new ol.layer.Tile({
                title: 'Google Satellite',
                type: 'base',
                visible: true,
                source: new ol.source.XYZ({
                    attributions: [
                        new ol.Attribution({html: '<a href=""></a>'})],
                        url: 'http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}'
                })
            }),         
            new ol.layer.Tile({
                title: 'OSM',
                type: 'base',
                visible: true,
                source: new ol.source.OSM()
            })
        ]
    });
        
    // GeoJSON dos pontos 
    var format_poi_pista_caminhada = new ol.format.GeoJSON();

    var features_poi_pista_caminhada = format_poi_pista_caminhada.readFeatures(
            json_poi_pista_caminhada, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'}
    );

    var jsonSource_poi_pista_caminhada = new ol.source.Vector({
        attributions: [new ol.Attribution({html: '<a href=""></a>'})],
    });

    jsonSource_poi_pista_caminhada.addFeatures(features_poi_pista_caminhada);
    
    var iconStyle = new ol.style.Style({
        image: new ol.style.Icon({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: 'data/point.png'
        })
    });
    
    var lyr_poi_pista_caminhada = new ol.layer.Vector({
        declutter: true,
        source:jsonSource_poi_pista_caminhada, 
        style: iconStyle,
        title: 'Pontos da Pista'
    });
    
    var overlays = new ol.layer.Group({
        title: 'Overlays',
        layers: [lyr_poi_pista_caminhada ]
    });

    view = new ol.View({
        center: ol.proj.fromLonLat([-54.575974, -25.528899]),
        zoom: 16,
        maxZoom: 18,
        minZoom: 2
    });
    
    var map = new ol.Map({
        target: document.getElementById('map'),
        controls: ol.control.defaults().extend([
            new ol.control.ScaleLine(),
            new ol.control.ZoomSlider()            
        ]),
        renderer: 'canvas',
        layers: [baseLayers, overlays],
        view: view
    });

    var layerSwitcher = new ol.control.LayerSwitcher();
    map.addControl(layerSwitcher);

    var element = document.getElementById('popup');

    var popup = new ol.Overlay({
        element: element,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -50]
    });
    
    map.addOverlay(popup);

  // display popup on click
  map.on('click', function(evt) {
    var feature = map.forEachFeatureAtPixel(evt.pixel,
        function(feature) {
          return feature;
    });

    if (feature) {
      var coordinates = feature.getGeometry().getCoordinates();
      popup.setPosition(coordinates);
      $(element).popover('dispose');
      $(element).popover({
        placement: 'top',
        html: true,
        content:        
        '<div align="center">' + 
        '<b>' + feature.get('descricao') + '</b>' +
        '<img src="data/' + feature.get('filename') +'" alt="Foto" width="250">' +
        '<br/>' +
        '</div>'
      });
      $(element).popover('show');
    } else {
      $(element).popover('dispose');
    }
  });    

  // change mouse cursor when over marker
  map.on('pointermove', function(e) {
    if (e.dragging) {
      $(element).popover('dispose');
      return;
    }
    var pixel = map.getEventPixel(e.originalEvent);
    var hit = map.hasFeatureAtPixel(pixel);
    map.getTarget().style.cursor = hit ? 'pointer' : '';
  });

}); 
