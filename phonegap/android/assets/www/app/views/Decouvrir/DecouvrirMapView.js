templates.decouvrirMapView = "app/views/Decouvrir/DecouvrirMapView.html";
decouvrirPopupTemplate = 
	"<div class='popupContent'>" +
	"<div class='sitename'>" +
	"<div class='valider'>" +
	"<a href='#site/<%= site.get('id') %>'><%= site.get('site_name') %></div></a>" +
	"</div></div>";

window.DecouvrirMapView = BaseView.extend({

    title: "Marseille VuParVous - Decouvrir - Carte",

    initialize: function(options) {
    	if(options){
	    	if(options.lat){
	    		this.centerLat = options.lat;
	    	}
	    	if(options.lon){
	    		this.centerLon = options.lon;
	    	}
    	}
        this.view = this.$el;
        
    },  
    
    events:{

    },
    
    render:function (eventName) {
        var template = _.template(templates.decouvrirMapView);
        var model = {
        		currentUser:appModel.get('currentUser'),
        		isTablet:NativeUtil.isTablet()
        	};
        this.$el.html(template(model));
        this.renderBase();

        return this;
    }, 
    
    postRender: function(){
    	this.initMap();
    },
    
    
    initMap:function() {
        var self = this;
        //use a timeout b/c it hasn't been added to dom yet, which causes a leaflet error
        setTimeout( function() {
        	
        	// appelé lors du clic sur site.s
            window.showDetail = function(siteId) {
                self.gotoDecouvrirSite(siteId);
            };
            
            // ??
            self.showCallback = self.restoreMapCallback;

            if(!(self.centerLat && self.centerLat!="" && self.centerLon && self.centerLon!="")){
            	if(window.GeoWatcher && window.GeoWatcher.position) {
	        		self.centerLat = window.GeoWatcher.position.latitude;
	        		self.centerLon = window.GeoWatcher.position.longitude;
	        	} else {
	        		// vieux port
	        		self.centerLat = defaultCenterLat;
	        		self.centerLon = defaultCenterLon;
	        	}
            }
            
            // défini une carte centrée sur ma position.
            var map = L.map('map', {
                center: [self.centerLat, self.centerLon],
                zoom: 15
            });

            // ajout du titre.
            var osmMapAttr = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';
            var osmDataAttr = 'Map data ' + osmMapAttr;

            var tileURL = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
                attribution = osmDataAttr,
                tileLayer = new L.TileLayer(tileURL, {attribution:attribution, subdomains:['a','b','c'], minZoom:0, maxZoom:20});
            
            map.addLayer(tileLayer);

            // préparation des couches de données.
            var markersLayer = new L.LayerGroup();

            // définition du marqueur.
            var hereIcon = L.icon({
                iconUrl: './img/decouvrir/puce-vousetesici.png',
                iconSize: new L.Point(74,74),
                iconAnchor: new L.Point(37, 37),
                popupAnchor: new L.Point(37, 74),
            });
            var adecouvrirIcon = L.icon({
                iconUrl: './img/decouvrir/puce-lieux-adecouvrir.png',
                iconSize: new L.Point(59,74),
                iconAnchor: new L.Point(30, 65),
                popupAnchor: new L.Point(30, 67),
            });

            // ajout de ma position sur une couche indépendante avec infobulle.
            var marker = new L.Marker([self.centerLat, self.centerLon], {icon: hereIcon});
            var popupContent = "<span class='siteButton'>You are here</span>";
            var popup = marker.bindPopup( popupContent, {offset:new L.Point(0,-35)} );
            markersLayer.addLayer(marker);

            var southWestBounds, northEastBounds, bounds;
            if(window.GeoWatcher && window.GeoWatcher.position) {
            	southWestBounds = { lat:window.GeoWatcher.position.latitude, lon:window.GeoWatcher.position.longitude};
            	northEastBounds = { lat:window.GeoWatcher.position.latitude, lon:window.GeoWatcher.position.longitude};
            } else {
            	southWestBounds = { lat:self.centerLat, lon:self.centerLon};
            	northEastBounds = { lat:self.centerLat, lon:self.centerLon};
            }

            var sites = appModel.get('sites');
            var puTemplate = _.template(decouvrirPopupTemplate);
            sites.forEach(function(site) {
                var lat = site.get("latitude");
                var lon = site.get("longitude");
                if ( lat && lat!= "" && lon && lon != "" ) {
                    
                    var latLng = new L.LatLng(lat, lon);
                    var marker = new L.Marker(latLng,{icon: adecouvrirIcon});
        
                    var popupContent = puTemplate({
                    	site:site
                    });
                    var popup = marker.bindPopup( popupContent, {offset:new L.Point(0,-35)} );
                    markersLayer.addLayer(marker);
                    
                    if ( !southWestBounds ) {
                        southWestBounds = { lat:lat, lon:lon};
                        northEastBounds = { lat:lat, lon:lon};
                    }
                    else {
                        southWestBounds.lat = Math.min( southWestBounds.lat, lat );
                        southWestBounds.lon = Math.min( southWestBounds.lon, lon );
                        northEastBounds.lat = Math.max( northEastBounds.lat, lat );
                        northEastBounds.lon = Math.max( northEastBounds.lon, lon );
                    }
                }
            });
        
            map.addLayer(markersLayer);
            
            if ( bounds ) {
                map.fitBounds(bounds);
            }
            self.map = map;
            self.tileLayer = tileLayer;
            self.markersLayer = markersLayer;
        
        }, 100 );
    },  
    
    restoreMapCallback: function() {
        return;
        //this is to work around a weird issue in Leaflet maps in iOS, where 
        //dragging stops working after a new view has been pushed onto the stack

        var map = this.map;
        var latLng = map.getCenter();
        var zoom = map.getZoom();
        map.removeLayer( this.tileLayer );
        map.removeLayer( this.markersLayer );
        
        $('#mapContainer').children().remove();
        $('#mapContainer').append( $("<div id='map' style='width:100%; height:100%'></div>") );
        map = new L.Map('map');
        
        map.addLayer( this.tileLayer );
        map.addLayer( this.markersLayer );
        map.setView( latLng, zoom, true );
        map.invalidateSize();
        self.map = map;
    },
});