
// Generate four random hex digits.
function S4() {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
};

// Generate a pseudo-GUID by concatenating random hexadecimal.
function guid() {
   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
};


/**
 * Photos
 */
var Photo = Backbone.Model.extend({
	defaults : {
		photoId:null,
		siteId : -1,
		name: "site indéfini",
		imageURI : null,
		commentaire: null,
		auteurLogin: -1,
		votes: 0
	},

	initialize: function(){
		this.set('id', ""+this.get('photo_id'));
		this.on("change:siteId",this.reloadSiteInfo);
		this.on('change',this.store);
	},

	reloadSiteInfo:function(siteId){
		self = this;
		site = getSiteById(this.get("siteId"));
		self.set("site",site);
		self.set("name",site.get("name"));
	},
	get: function (attr) {
		if (attr == 'score_top') {
			return this.get('score_insolite')+this.get('score_qualite');
		}
	    return Backbone.Model.prototype.get.call(this, attr);
	},
	getImageSrc: function(format, imgElem){
		var path = this.get('path');
		if(!path && format){
			path = "imagecache/"+format+"/data/images/";
		}
		var filePath = (path?path:'')+this.get('filename');
		if(this.get('localFile')){
			return filePath;
		}
		// remote file
		if(navigator.platform!="Win32"){
			setTimeout(function(){
				getFileCache(filePath,
					function(theFilePath){
						if(imgElem){
							$(imgElem).attr('src',theFilePath);
						}
					}
				)},
				0);
			localRootPath = fileSystem.root.fullPath+"/vuparvous/";
			if(fileSystem){
				return fileSystem.root.fullPath+"/vuparvous/"+ filePath;
			}
		}
		return host+filePath;
	},
	store: function(){
		if(this.restoring)
			return;
		var key = "photo-"+this.get('photo_id');
		// console.log("storing",key);
		window.localStorage.setItem(key,JSON.stringify(this));
		return key;
	},
	restore: function(key){
		this.restoring = true;
		var jsonModel = JSON.parse(window.localStorage.getItem(key));
		this.set(jsonModel);
		this.restoring = false;
		return this;
	}
});

var PhotoCollection = Backbone.Collection.extend({
	model: Photo,
  	initialize:function (){
  		console.log("creating new photo collection");
  		this.on('add',function(){
			this.store();
		});
  	},
  	store:function(storageKey){
		if(this.restoring)
			return;
		
		if(storageKey)
			this.photoStorageKey = storageKey;
		
		if(!this.photoStorageKey){
			this.photoStorageKey = "photos-"+guid();
		}
		console.log("storing",this.photoStorageKey);
	  	var jsonModel = {};
	  	for(var i=0;i<this.length;i++){
	  		jsonModel[i] = this.at(i).store();
	  	}
	  	window.localStorage.setItem(this.photoStorageKey, JSON.stringify(jsonModel));
	  	return this.photoStorageKey;
  	},
  	restore: function(storageKey){
  		this.restoring = true;
  		this.photoStorageKey=storageKey;
  		var jsonModel = JSON.parse(window.localStorage.getItem(storageKey));
  		this.reset();
  		for(i in jsonModel){
  			this.add(new Photo().restore(jsonModel[i]))
  		}
  		this.restoring = false;
  		return this;
  	}
});

/**
 * Site Emblématique.
 * id = site_id
 * site_name
 * 
 */
var Site = Backbone.Model.extend({
	defaults: {
		id : -1,
		site_id:-1,
		site_name : "nom du site",
		location : "ville",
		mp2013 :"no",
		lat : undefined,
		lon : undefined,
//		photo : {
//			filename:'xxx'
//		},
// 		photos:new PhotoCollection
	},
	initialize: function(options) {
		this.set('photos', new PhotoCollection());
		if(options && options.photo){
			this.set('photo', new Photo(options.photo));
		}
		this.set('id', ""+this.get('site_id'));
		this.on('change',this.store);
	},
	getDescription : function(){
		return this.get('description_fr');
	},
	parse: function(data){
		if(data.photo){
			data.photo =  new Photo(data.photo);
		}
		return data;
	},
	store: function(){
		if(this.restoring)
			return;
		var key = "site-"+this.get('site_id');
		// console.log("storing",key);
		var jsonModel = this.toJSON();
		jsonModel.photos = this.get('photos').store();
		jsonModel.photo = jsonModel.photo.store();
		window.localStorage.setItem(key ,JSON.stringify(jsonModel));
		return key;
	},
	restore: function(key){
		this.restoring = true;
		var jsonModel = JSON.parse(window.localStorage.getItem(key));
		jsonModel.photos = this.get('photos').restore(jsonModel.photos);
		jsonModel.photo = new Photo().restore(jsonModel.photo);
		this.set(jsonModel);
		this.restoring=false;
		return this;
	},
});



var SiteCollection = Backbone.Collection.extend({
	model: Site,
	initialize:function(){
		console.log("creating new site collection");
		this.on('add',function(){
			this.store();
		});
	},
	store:function(storageKey){
		if(this.restoring)
			return;
		
		if(storageKey)
			this.siteStorageKey = storageKey;
		
		if(!this.siteStorageKey){
			this.siteStorageKey = "sites-"+guid();
		}
		console.log("storing",this.siteStorageKey);
		var jsonModel = {};
		for(var i=0;i<this.length;i++){
			jsonModel[i] = this.at(i).store();
		}
	 	window.localStorage.setItem(this.siteStorageKey, JSON.stringify(jsonModel));
	 	return this.siteStorageKey;
	},
	restore: function(storageKey){
		this.restoring = true;
		var jsonModel = JSON.parse(window.localStorage.getItem(storageKey));
		this.reset();
		for(i in jsonModel){
			this.add(new Site().restore(jsonModel[i]));
		}
		this.siteStorageKey = storageKey;
		this.restoring = false;
		return this;
	}
});
// retourne le site selon son id.
function getSiteById(siteId){
	site = appModel.get('sites').findWhere({id:siteId});
	return site;
}

var Vote = Backbone.Model.extend({
	defaults : {
		
	},
	initialize: function(){
		this.set('id', ""+this.get('photo_id'));
	}
});


/** 
 * Utilisateurs
 **/
var User = Backbone.Model.extend({
	defaults : {
		logged : false,
		// photos : new PhotoCollection,
		photosLoaded : false,
		// sites : new SiteCollection,
		sitesLoaded : false,
		// votes : new Backbone.Collection,
		votesLoaded : false
	},
	
	initialize: function(){
		console.log("creating new user "+this.get('login'));
		this.set('id', ""+this.get('login'));
		this.set('photos', new PhotoCollection());
		this.set('sites',  new SiteCollection());
		this.set('votes',  new Backbone.Collection());
		this.on("change:logged",function() {
			if(this.get('logged')){
				loadUserPhotos(this);
			} else {
				this.set('first_name', undefined);
				this.set('last_name', undefined);
				this.set('email', undefined);
				this.set('photos', new PhotoCollection());
				this.set('photosLoaded',false);
				this.set('sites', new SiteCollection());
				this.set('sitesLoaded',false);
			}
		});
		
		this.on('change',function(){
			this.store();
			this.trigger("userChange");
		});
	},

	// déconnecte l'utilisateur.
	logout:function(){
		this.set('logged', false);
	},
	
	// initialise l'utilisateur avec les propriétés suivantes.
	copy: function(user){
		this.set('id', ""+this.get('login'));
		this.set('login',user.login);
		this.set('first_name',user.first_name);
		this.set('last_name',user.last_name);
		this.set('email',user.email);
		this.set('logged', false || user.logged);
	},
	
	getName : function(){
		return this.get('first_name')+" "+this.get('last_name');
	},
	
	getStatus: function(site_id){
		// status photo
		if(!this.get('photos') || !this.get('photosLoaded'))
			return;
		if(this.get('photos').where({'site_id':site_id}).length>0)
			return 'shared';
		
		// status site
		if(!this.get('sites') || !this.get('sitesLoaded'))
			return;
		if(this.get('sites').where({'site_id':site_id}).length>0)
			return 'visited';
		// aucune info.
		return;
	},
	getVote: function(photo_id){
		if(!this.get('votes') || !this.get('votes'))
			return;
		return this.get('votes').get(photo_id);
	},
	
	addVote:function(voteJSON){
		var votes = this.get('votes');
		if(!votes){
			votes = new Backbone.Collection;
			this.set('votes',votes);
		}
		votes.add(new Vote(voteJSON),{merge:true});
	},
	store: function(storageKey){
		if(this.restoring)
			return;
		// cache la storage key pour plus tard.
		if(storageKey)
			this.storageKey = storageKey;
		
		var theStorageKey;
		if(this.storageKey){
			theStorageKey = this.storageKey;
		} else {
			theStorageKey = "user-"+this.get('login');
		}

		console.log("storing user",theStorageKey);
		
		var jsonModel = this.toJSON();
		jsonModel.photos = this.get('photos').store(theStorageKey+"-photos");
		jsonModel.sites  = this.get('sites').store(theStorageKey+"-sites");
		
		window.localStorage.setItem(theStorageKey ,JSON.stringify(jsonModel));
		return theStorageKey;
	},
	restore: function(key){
		this.restoring = true;
		if(key)
			this.storageKey = key;
		var jsonModel = JSON.parse(window.localStorage.getItem(this.storageKey));
		jsonModel.photos = this.get('photos').restore(jsonModel.photos);
		jsonModel.sites = this.get('sites').restore(jsonModel.sites);
		jsonModel.votes = new Backbone.Collection(jsonModel.votes);
		this.set(jsonModel);
		this.restoring = false;
		return this;
	}
});

var AppModel = Backbone.Model.extend({
	storageKey : "appModel",
	defaults : {
		id:"AppModel",
//		currentUser : new User(),
//		sites  : new SiteCollection,
//		photosQualite : new PhotoCollection,
//	    photosInsolite : new PhotoCollection,
//	    photosTop : new PhotoCollection,
	    refreshTime : 0,
	},
	
	initialize: function(){
		this.set('currentUser', 	new User());
		this.set('sites', 			new SiteCollection());
		this.set('photosQualite', 	new PhotoCollection());
		this.set('photosInsolite', 	new PhotoCollection());
		this.set('photosTop', 		new PhotoCollection());
		//this.fetch();
		this.on("change:loggedUser",function() {
			if(this.get('loggedUser')){
				loadUserPhotos(this.get('loggedUser'));
				this.saveState();
			}
		});
		this.on("change:currentUser.logged", function(event){
			console.log("saving",event);
			this.save();
		});
		this.on("change", function(event) {
			console.log("change:*", event);
			this.store();
		});
		this.on("userChange", function(event) {
			console.log("userChange:*", event);
			this.store();
		});
		// saves or restore if appModel in localStorage.
		if(window.localStorage.getItem(this.storageKey)){
			this.restore();
		} else {
			this.store();
		}
	},
	store: function(){
		if(this.restoring)
			return;
		// cleanup storage.
		window.localStorage.clear();
		// window.localStorage.setItem("appModel", JSON.stringify(this));
		console.log("AppModel: storing",this.storageKey);
		var jsonModel = this.toJSON();
		jsonModel.currentUser    = this.get('currentUser').store('currentUser');
		jsonModel.sites          = this.get('sites').store();
		jsonModel.photosQualite  = this.get('photosQualite').store();
		jsonModel.photosInsolite = this.get('photosInsolite').store();
		jsonModel.photosTop      = this.get('photosTop').store();
		window.localStorage.setItem(this.storageKey, JSON.stringify(jsonModel));
		return this.storageKey;
	},
	restore: function() {
		this.restoring=true;
		console.log("AppModel: restoring",this.storageKey);
		var jsonModel = JSON.parse(window.localStorage.getItem(this.storageKey));
		jsonModel.currentUser 	 = this.get('currentUser').restore(jsonModel.currentUser);
		jsonModel.sites 		 = this.get('sites').restore(jsonModel.sites);
		jsonModel.photosQualite  = this.get('photosQualite').restore(jsonModel.photosQualite);
		jsonModel.photosInsolite = this.get('photosInsolite').restore(jsonModel.photoInsolite);
		jsonModel.photosTop 	 = this.get('photosTop').restore(jsonModel.photosTop);
		this.set(jsonModel);
		this.restoring=false;
		console.log("AppModel restored",this.storageKey);
		return this;
	},
});
