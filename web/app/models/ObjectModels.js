
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
		photo : {
			filename:'xxx'
		}
	},
	initialize: function() {
		this.set('id', ""+this.get('site_id'));
	},
	getDescription : function(){
		return this.get('description_fr');
	}
});

// retourne le site selon son id.
function getSiteById(siteId){
	site = appModel.get('sites').findWhere({id:siteId});
	return site;
}

/** 
 * Utilisateurs
 **/
var User = Backbone.Model.extend({
	defaults : {
		logged : false,
		photos : undefined,
		photosLoaded : false,
		sites : undefined,
		sitesLoaded : false,
		votes : undefined,
		votesLoaded : false
	},
	
	initialize: function(){
		this.set('id', ""+this.get('login'));
		this.on("change:logged",function() {
			if(this.get('logged')){
				loadUserPhotos(this);
			} else {
				this.set('first_name', undefined);
				this.set('last_name', undefined);
				this.set('email', undefined);
				this.set('photos', undefined);
				this.set('photosLoaded',false);
			}
		});
	},
	
	// initialise l'utilisateur avec les propriétés suivantes.
	copy: function(user){
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
	}
});

var Vote = Backbone.Model.extend({
	defaults : {
		
	},
	initialize: function(){
		this.set('id', ""+this.get('photo_id'));
	}
});

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
	}
});


/**
 * constantes.
 */
var vignettePath = "/imagecache/vignette/data/images/"
var siteheadPath = "/imagecache/sitehead/data/images/"

/**
 * etats.
 */

//la vue en cours, utilisé pour les cas de callback par événenements.
var currentView;


var AppModel = Backbone.Model.extend({
	localStorage: new Backbone.LocalStorage("vuparvous"),
	defaults : {
		id:"model",
		currentUser : new User(),
		sites  : new Backbone.Collection,
		photosQualite : new Backbone.Collection,
	    photosInsolite : new Backbone.Collection,
	    photosTop : new Backbone.Collection,
	},
	
	initialize: function(){
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
	}
});

var appModel = new AppModel();