// les templates.
templates.decouvrirMainView = "app/views/Decouvrir/DecouvrirMainView.html";
templates.decouvrirPhotosView = "app/views/Decouvrir/DecouvrirPhotosView.html";
templates.decouvrirSiteView = "app/views/Decouvrir/DecouvrirSiteView.html";
templates.decouvrirMapView = "app/views/Decouvrir/DecouvrirMapView.html";

/**
 * DECOUVRIR MAIN VIEW.
 */
window.DecouvrirMainView = BaseView.extend({

    initialize: function(options) {
        this.render();
        this.view = this.$el;
        this.contentEl = this.view.find("#viewContent");
        this.gotoDecouvrirPhotos();
        // this.contentView = new DecouvrirPhotosView({el : this.contentEl});
        initImageButtons(this.$el);
    },  
    
    events:{
    	"click #mapButton":"gotoDecouvrirMap",
	   	"click #photosButton":"gotoDecouvrirPhotos"
    },
    
    render:function (eventName) {
    	currentView=this;
    	toggleImageButton($("#decouvrirButton img"), "on");
        var template = _.template(templates.decouvrirMainView);
        var model = {};
        this.$el.html(template(model));
        // title
        $("#viewTitle").removeClass("visible");
        this.renderBase();
        setTimeout( function(){
	    		$('.scrolltab').jScrollPane();
	    	},
	    0);
        //appRouter.route("photos","gotoDecouvrirPhotos", function(){gotoDecouvrirPhotos()});
        //appRouter.route("map","gotoDecouvrirMap", function(){gotoDecouvrirMap()});
        return this;
    },
    
    gotoDecouvrirPhotos:function () {
    	this.contentView = new DecouvrirPhotosView({el : this.contentEl, titleEl : this.titleEl});
    },
    
    gotoDecouvrirMap:function () {
    	this.contentView = new DecouvrirMapView({el : this.contentEl, titleEl : this.titleEl});
    }
});

/**
 * DECOUVRIR PHOTOS VIEW.
 */
window.DecouvrirPhotosView = BaseView.extend({
    initialize: function(options) {
        this.titleEl=options.titleEl;
        this.view = this.$el;
        this.render();
    },  
    
    events:{
    	"click .siteButton":"gotoDecouvrirSite"
    },
    
    render:function (eventName) {
    	currentView=this;
    	toggleImageButton($("#decouvrirButton img"), "on");
        var template = _.template(templates.decouvrirPhotosView);
        var model = {sites:appModel.get('sites'),currentUser:appModel.get('currentUser')};
        this.$el.html(template(model));

        // title
        $("#viewTitle").removeClass("visible");
        
        setTimeout( function(){
    		$('.scrolltab').jScrollPane();
	    	},
	    0);
    	toggleImageButton($("#photosButton img"), "on");
        return this;
    },

    gotoDecouvrirSite:function (event) {
    	siteId = event.currentTarget.dataset.site_id;
        var view = new DecouvrirSiteView({el : this.$el, siteId:siteId, titleEl : this.titleEl});
        this.renderView(view);
    }
});

/**
 * DECOUVRIR SITE VIEW
 */
voteActionTemplate = 
	"<% if(voteState=='votez') { %>"+
 		"<div id='votez' class='vote-button'>VOTEZ</div>"+
 	"<% } else if(voteState=='voter') { %>"+
 		"<div id='voter' class='vote-button clickable'>VOTER</div>"+
 	"<% } else if(voteState=='vote-ok') { %>"+
 		"<div id='vote-ok' class='vote-button'>MERCI</div>"+
 	"<% } else { %>"+
 		" KO"+
 	"<% } %>";


window.DecouvrirSiteView = BaseView.extend({

    initialize: function(options) {
        this.titleEl=options.titleEl;
        if(options && options.siteId){
        	this.siteId = options.siteId;
        }
        this.voteState = "votez";
        this.render();
    	this.sitePhotosView = this.$el.find("#siteView-photos");
    	this.sitePhotoView = this.$el.find(".photo-selection");
    	this.sitePhotoView.detach();
        this.initGMap();
    },  
    
    events:{
        "click #voter":"doVote",
        "change #vote-qualite":"activeVote",
        "change #vote-insolite":"activeVote"
    },
    
    render:function (eventName) {
    	currentView=this;
    	toggleImageButton($("#decouvrirButton img"), "on");
        var template = _.template(templates.decouvrirSiteView);
 	    
        this.site = getSiteById(""+this.siteId);
        
	    var model = {
	    		site:this.site,
	    		voteState:this.voteState,
        		vote:this.vote,
        	};
        this.$el.html(template(model));

        // title
        $("#viewTitle").addClass("visible");
        $("#title-text").html(this.site.get('site_name'));

        // charge les images...
        loadSitePhotos(this.site,this.addPhoto);

        this.refreshVote();
        setTimeout( function(){
    		$('.scrolltab').each(function(){
    			$(this).jScrollPane();
    		});
	    	},
	    1000);
        
        return this;
    },
    
    initMap: function(){
        var lat = this.site.get('latitude');
        var lon = this.site.get('longitude');
        var title = this.site.get('site_name');
    	// défini une carte centrée sur la position du site.
        var map = L.map('siteView-map', {
            center: [lat, lon],
            dragging :false,
            zoom: 15,
            minZoom:10,
            maxZoom:20,
            
        });
        
        //var tileURL = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
        var tileURL = 'http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png';
        var tileLayer = new L.TileLayer(tileURL, {subdomains:['a','b','c','d'], minZoom:0, maxZoom:20});
    
        map.addLayer(tileLayer);

        // définition du marqueur.
        var siteIcon = L.icon({
            iconUrl: '/assets/img/carte/lieu-a-decouvrir.png',
            shadowUrl: '/assets/img/carte/ombre-puce.png',
            iconSize: new L.Point(33, 39), // 33, 39
            iconAnchor: new L.Point(13, 41),
            popupAnchor: new L.Point(1, -34),
            shadowSize: new L.Point(45, 45) // 45,45
        });
        
        // définition du marqueur.
        var marker = new L.Marker([lat, lon], {icon: siteIcon});
        var popupContent = "<span class='siteButton'>"+title+"</span>";
        var popup = marker.bindPopup( popupContent, {offset:new L.Point(0,-35)} );

        var markersLayer = new L.LayerGroup();
        markersLayer.addLayer(marker);
        map.addLayer(markersLayer);
    },
    
    initGMap : function () {
        var lat = this.site.get('latitude');
        var lon = this.site.get('longitude');
        var title = this.site.get('site_name');

		var mapOptions = {
      	    zoom: 15,
      	    center: new google.maps.LatLng(lat, lon),
      	    mapTypeId: google.maps.MapTypeId.ROADMAP,
      	    mapTypeControl: false,
      	    mapTypeControlOptions: {
      	    	style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
		    },
		    streetViewControl: false,
		    zoomControl: true,
		    zoomControlOptions: {
		      style: google.maps.ZoomControlStyle.SMALL
		    },
      	};
		
		var icon = {
			url: '/assets/img/carte/lieu-a-decouvrir.png',
			// This marker is 20 pixels wide by 32 pixels tall.
			size: new google.maps.Size(33, 39),
			// The origin for this image is 0,0.
			origin: new google.maps.Point(0,0),
			// The anchor for this image is the base of the flagpole at 0,32.
			anchor: new google.maps.Point(16, 36)
		};
		var iconShadow = {
			url: '/assets/img/carte/ombre-puce.png',
		    // The shadow image is larger in the horizontal dimension
		    // while the position and offset are the same as for the main image.
		    size: new google.maps.Size(45,45),
		    origin: new google.maps.Point(0,0),
		    anchor: new google.maps.Point(21, 39)
		};
		
      	var map = new google.maps.Map(document.getElementById('siteView-map'),mapOptions);
	    
      	var marker = new google.maps.Marker({
	        position: new google.maps.LatLng(lat, lon),
	        map: map,
	        shadow: iconShadow,
	        icon: icon,
	        title: title
	    });
    },
    
    addPhoto: function(photo){
    	var template = currentView.sitePhotoView.clone();
    	template.removeClass("template");
    	template.attr("id",photo.get("id"));
    	template.find(".photo-image").attr("src",vignettePath+photo.get("filename"));
    	template.find(".score").html(photo.get('score_top'));
    	//this.sitePhotoView.find(".photo-rank-image").attr("src",event.get("filename"));
    	currentView.sitePhotosView.append(template);
    	template.on("click",function(event){
    		var photo_id = $(event.currentTarget).attr("id");
    		// click sur photo.
    		console.log("click photo",event);
    		currentView.showPhoto(photo_id);
    	});
    	if(!currentView.selectedPhoto){
    		currentView.showPhoto(photo.get("id"));
    	}
    },
    
    showPhoto: function(photo_id){
    	var template = $(currentView.el);

    	var photo = currentView.site.photos.get(photo_id);
    	
    	if(currentView.selectedPhoto){
    		template.find("#"+currentView.selectedPhoto.id).removeClass("selected");
    	}
    	// la fiche.
    	var html = 
    		// "<a class='_fancybox' href='"+siteheadPath+photo.get("filename")+"'>" +
    		"<img src='"+siteheadPath+photo.get("filename")+"' style='height:100%; width:100%'>";
    		// "</a>";
    	template.find("#siteView-photo").html(html);
    	template.find(".fancybox").fancybox();
    	template.find("#infobar-auteur").html(photo.get("auteur"));
    	template.find("#infobar-comment").html(photo.get("commentaire"));
    	
    	//form
    	template.find("#photo_id").val(photo_id);
    	var vote = appModel.get('currentUser').getVote(photo_id);
    	template.find("#vote-qualite").attr('checked',(vote && vote.get('vote_qualite'))?true:false);
    	template.find("#vote-insolite").attr('checked',(vote && vote.get('vote_insolite'))?true:false);
    	var that=this;
    	template.find("#vote-button").click(function(){that.vote()});
    	
    	// hightlight de l'image
    	template.find("#"+photo_id).addClass("selected");

    	currentView.selectedPhoto = photo;
    },
    
    doVote: function(){
    	var photo_id = $("#photo_id").val();
    	var vote_qualite = $("#vote-qualite").attr('checked');
    	var vote_insolite = $("#vote-insolite").attr('checked');
    	vote(photo_id, vote_qualite, vote_insolite);
    	
    	this.voteState = "vote-ok";
    	this.refreshVote();
    	
    },
    
    activeVote: function(){
    	this.voteState = "voter";
    	this.refreshVote();
   },
   
   refreshVote: function(){
	   var template = _.template(voteActionTemplate);
	   var model = {
	       		photo:this.photo,
	       		voteState:this.voteState,
	       	};
	   $("#vote-action").html(template(model));
   }
});	

window.DecouvrirMapView = BaseView.extend({

    defaultCenterLat: 43.294692,
	defaultCenterLon: 5.374085,
	
    initialize: function(options) {
        this.titleEl=options.titleEl;
    	if(options){
	    	if(options.lat){
	    		this.centerLat = options.lat;
	    	}
	    	if(options.lon){
	    		this.centerLon = options.lon;
	    	}
    	}
        this.render();
        this.view = this.$el;
        this.initGMap();
        currentView = this;
    },  
    
    events:{
    },
    
    render:function (eventName) {
    	currentView=this;

    	toggleImageButton($("#decouvrirButton img"), "on");
        var template = _.template(templates.decouvrirMapView);
        //var model = {isTablet:NativeUtil.isTablet()};
        var model = {sites:appModel.get('sites'),currentUser:appModel.get('currentUser')};
        this.$el.html(template(model));
        // title
        $("#viewTitle").removeClass("visible");
    	toggleImageButton($("#mapButton img"), "on");
        return this;
    },    
    
    gotoDecouvrirSite:function(siteId){
    	var view = new DecouvrirSiteView({el: currentView.el, siteId:siteId, titleEl : this.titleEl});
    },
    
//    initMap:function() {
//        var self = this;
//        //use a timeout b/c it hasn't been added to dom yet, which causes a leaflet error
//        setTimeout( function() {
//        	
//        	// appelé lors du clic sur site.s
//            window.showDetail = function(siteId) {
//                self.gotoDecouvrirSite(siteId);
//            };
//            
//            // ??
//            self.showCallback = self.restoreMapCallback;
//
//            if(!(self.centerLat && self.centerLat!="" && self.centerLon && self.centerLon!="")){
//            	if(window.GeoWatcher && window.GeoWatcher.position) {
//            		self.centerLat = window.GeoWatcher.position.latitude;
//            		self.centerLon = window.GeoWatcher.position.longitude;
//            	} else {
//            		// vieux port
//            		self.centerLat = self.defaultCenterLat;
//            		self.centerLon = self.defaultCenterLon;
//            	}
//            }
//            
//            // défini une carte centrée sur ma position.
//            var map = L.map('map', {
//                center: [self.centerLat, self.centerLon],
//                zoom: 15
//            });
//
//            // ajout du titre.
//            var osmMapAttr = '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';
//            var osmDataAttr = 'Map data ' + osmMapAttr;
//
//            //var tileURL = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
//            //    attribution = osmMapAttr;
//            var tileURL = 'http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png',
//                attribution = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; ' + osmDataAttr;
//            var tileLayer = new L.TileLayer(tileURL, {attribution:attribution, subdomains:['a','b','c','d'], minZoom:0, maxZoom:20});
//            
//            map.addLayer(tileLayer);
//
//            // préparation des couches de données.
//            var markersLayer = new L.LayerGroup();
//
//            // définition du marqueur.
//            var iciIcon = L.icon({
//                iconUrl: './libs/leaflet/images/ici.png',
//               iconSize: new L.Point(45, 45),
//                iconAnchor: new L.Point(22, 22),
//                popupAnchor: new L.Point(1, -34),
//            });
//            // définition du marqueur.
//            var siteIcon = L.icon({
//                iconUrl: '/assets/img/carte/lieu-a-decouvrir.png',
//                shadowUrl: '/assets/img/carte/ombre-puce.png',
//                iconSize: new L.Point(33, 39),
//                iconAnchor: new L.Point(13, 41),
//                popupAnchor: new L.Point(0, 0),
//                shadowSize: new L.Point(45, 45) 
//            });
//            // ajout de ma position sur une couche indépendante avec infobulle.
//            if(window.GeoWatcher && window.GeoWatcher.position) {
//	            var marker = new L.Marker([window.GeoWatcher.position.latitude, window.GeoWatcher.position.longitude], {icon: iciIcon});
//	            var popupContent = "<span class='siteButton'>You are here</span>";
//	            var popup = marker.bindPopup( popupContent, {offset:new L.Point(0,-35)} );
//	            markersLayer.addLayer(marker);
//            }
//        	var southWestBounds, northEastBounds, bounds;
//            if(window.GeoWatcher && window.GeoWatcher.position) {
//            	southWestBounds = { lat:window.GeoWatcher.position.latitude, lon:window.GeoWatcher.position.longitude};
//            	northEastBounds = { lat:window.GeoWatcher.position.latitude, lon:window.GeoWatcher.position.longitude};
//            } else {
//            	southWestBounds = { lat:self.defaultCenterLat, lon:self.defaultCenterLon};
//            	northEastBounds = { lat:self.defaultCenterLat, lon:self.defaultCenterLon};
//            }
//            appModel.get('sites').each(function(site) {
//                var lat = site.get("latitude");
//                var lon = site.get("longitude");
//                if ( lat && lat!= "" && lon && lon != "" ) {
//                    
//                    var latLng = new L.LatLng(lat, lon);
//                    var marker = new L.Marker(latLng, {icon: siteIcon});
//        
//                    var popupContent = "<a class='button maplink' id='mapMarker' href='javascript:showDetail(\"" + site.get("id") + "\")'>" + site.get("site_name") + "</a>";
//                    var popup = marker.bindPopup( popupContent, {offset:new L.Point(0,-35)} );
//                    markersLayer.addLayer(marker);
//                    
//                    if ( !southWestBounds ) {
//                        southWestBounds = { lat:lat, lon:lon};
//                        northEastBounds = { lat:lat, lon:lon};
//                    }
//                    else {
//                        southWestBounds.lat = Math.min( southWestBounds.lat, lat );
//                        southWestBounds.lon = Math.min( southWestBounds.lon, lon );
//                        northEastBounds.lat = Math.max( northEastBounds.lat, lat );
//                        northEastBounds.lon = Math.max( northEastBounds.lon, lon );
//                    }
//                }
//            });
//        
//            map.addLayer(markersLayer);
//            
//            if ( bounds ) {
//                map.fitBounds(bounds);
//            }
//            self.map = map;
//            self.tileLayer = tileLayer;
//            self.markersLayer = markersLayer;
//
//            self.$el.find("a").bind( "click", self.openExternalLink );
//        
//        }, 100 );
//    },  
    
    initGMap : function () {

		var mapOptions = {
      	    zoom: 15,
      	    center: new google.maps.LatLng(this.defaultCenterLat, this.defaultCenterLon),
      	    mapTypeId: google.maps.MapTypeId.ROADMAP,
      	    mapTypeControl: false,
      	    mapTypeControlOptions: {
      	    	style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
		    },
		    streetViewControl: false,
		    zoomControl: true,
		    zoomControlOptions: {
		      style: google.maps.ZoomControlStyle.SMALL
		    },
      	};
		
		var iconToDiscover = {
			url: '/assets/img/carte/lieu-a-decouvrir.png',
			// This marker is 20 pixels wide by 32 pixels tall.
			size: new google.maps.Size(33, 39),
			// The origin for this image is 0,0.
			origin: new google.maps.Point(0,0),
			// The anchor for this image is the base of the flagpole at 0,32.
			anchor: new google.maps.Point(16, 36)
		};
		var iconVisited = {
				url: '/assets/img/carte/lieu-deja-visite.png',
				// This marker is 20 pixels wide by 32 pixels tall.
				size: new google.maps.Size(33, 39),
				// The origin for this image is 0,0.
				origin: new google.maps.Point(0,0),
				// The anchor for this image is the base of the flagpole at 0,32.
				anchor: new google.maps.Point(16, 36)
			};
		var iconShared = {
				url: '/assets/img/carte/lieu-partage.png',
				// This marker is 20 pixels wide by 32 pixels tall.
				size: new google.maps.Size(33, 39),
				// The origin for this image is 0,0.
				origin: new google.maps.Point(0,0),
				// The anchor for this image is the base of the flagpole at 0,32.
				anchor: new google.maps.Point(16, 36)
			};
		var iconShadow = {
			url: '/assets/img/carte/ombre-puce.png',
		    // The shadow image is larger in the horizontal dimension
		    // while the position and offset are the same as for the main image.
		    size: new google.maps.Size(45,45),
		    origin: new google.maps.Point(0,0),
		    anchor: new google.maps.Point(21, 39)
		};
		var iconShadowMP13 = {
				url: '/assets/img/carte/ombre-puceMP13.png',
			    // The shadow image is larger in the horizontal dimension
			    // while the position and offset are the same as for the main image.
			    size: new google.maps.Size(48,67),
			    origin: new google.maps.Point(0,0),
			    anchor: new google.maps.Point(17, 59)
			};
		var mapElem = this.$el.find("#map")[0];
      	var map = new google.maps.Map(mapElem,mapOptions);
      	var currentUser =  appModel.get('currentUser');
      	appModel.get('sites').each(function(site) {
      		var icon = iconToDiscover;
          	if(currentUser.get('logged')){
	      		var statut = currentUser.getStatus(site.get('site_id'));
	    		if(statut == 'visited') {
	    			icon = iconVisited;
	    		} else if(statut == 'shared') {
	    			icon = iconShared;
	    		}   	
          	}
          	var shadow = iconShadow; 
          	if(site.get('category')=='mp13'){
          		shadow=iconShadowMP13;
          	}
      		var lat = site.get("latitude");
            var lon = site.get("longitude");
            var title = site.get('site_name');
            if ( lat && lat!= "" && lon && lon != "" ) {
                
              	var marker = new google.maps.Marker({
        	        position: new google.maps.LatLng(lat, lon),
        	        map: map,
        	        shadow: shadow,
        	        icon: icon,
        	        title: title
        	    });
              	var siteId = site.get('site_id');
              	google.maps.event.addListener(marker, 'click', function(event){
              		currentView.gotoDecouvrirSite(siteId);
              	});
//                var popupContent = "<a class='button maplink' id='mapMarker' href='javascript:showDetail(\"" + site.get("id") + "\")'>" + site.get("site_name") + "</a>";
//                var popup = marker.bindPopup( popupContent, {offset:new L.Point(0,-35)} );
            }
        });
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


    openExternalLink:function (event) {


    	if ( !this.lastTimestamp || (new Date().getTime()-this.lastTimestamp) > 500) {
	    
	        var target = $( event.target )
	        if (!target.hasClass("maplink")) {
	            var href = target.attr("href");
	            if ( href != "#"  && href.length > 0 ) {
	                NativeUtil.openExternalURL( href );
	                event.stopImmediatePropagation();
	                event.preventDefault();
	                event.cancelBubble();
	                return false;
	            }
	        }
	    }
        this.lastTimestamp = new Date().getTime();
    }
});