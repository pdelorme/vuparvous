
var appModel;
var appRouter;
var appView;
// la photo en cours de partage
var userPhoto;
var fileSystem;

/**
 * view Management
 */
function AppView(){
	this.showView = function(view) {
		if(!view) {
			if(this.currentView){
				this.currentView.render();
			}
			return;
		}
		if (this.currentView){
			this.currentView.close();
		}
		if(!this.headerView){
			this.headerView = new HeaderView({el:$("#headerView")});
		}
 
		this.currentView = view;
		this.currentView.render();
 
		$("#contentView").html(this.currentView.$el);
		var that = this;
		setTimeout(function(){
			resizeViewContent();
	    	// stop le spinner.
			that.currentView.postRender();
	    	$("#activityIndicator").removeClass("running");
        },0);
	},
	this.alert =function(message){
		if(navigator.platform=="Win32"){
			alert(message);		
		} else {
			navigator.notification.alert(message);
		}
	}
}

function resizeViewContent(){
	if($(".viewContent").length){
		var top = $(".viewContent").offset().top;
		var bottom = $("#footerView").length?$("#footerView").offset().top:$(window).height();
		$(".viewContent").height(bottom-top);
		console.log(".viewContent height :"+(bottom-top));
	}
}

Backbone.View.prototype.close = function(){
  this.remove();
  this.unbind();
}

/**
 * routes management
 */
var Router = Backbone.Router.extend({

	initialize : function() {
		appView = new AppView();
	},
	
	routes: {
		""			: "gotoHome",  
		"home"		: "gotoHome",  
		"partager"	: "gotoPartager",
		"partager/:id"	: "gotoPartager",  
		"locate"	: "gotoLocate",  
		"site/:id"	: "gotoSite",  
		"photo/:siteId/:photoId"	: "gotoPhoto",  
		"decouvrir"	    : "gotoDecouvrirPhotos", 
		"sitesPhotos"	: "gotoDecouvrirPhotos", 
		"sitesList"		: "gotoDecouvrirList", 
		"sitesMap"		: "gotoDecouvrirMap", 
		"palmares"		: "gotoPalmares",
		"palmaresPhoto/:photoId"	: "gotoPalmaresPhoto",  
		"concept"     	: "gotoConcept",
		"login"     	: "gotoLogin",
		"profile"     	: "gotoProfile",
		"register"     	: "gotoRegister",
		"cgu"     		: "gotoCGU",
		"shootPhoto"	: "gotoPartager",  
		"pickPhoto" 	: "gotoPartager",  
		"*path"     	: "gotoHome",
	},

    gotoHome:function () {
        var view = new HomeView();
        appView.showView(view);
    },

    gotoDecouvrirPhotos:function () {
    	var view = new DecouvrirPhotosView();
        appView.showView(view);
    },
    gotoDecouvrirList:function () {
    	var view = new DecouvrirListView();
        appView.showView(view);
    },
    gotoDecouvrirMap:function () {
    	var view = new DecouvrirMapView();
        appView.showView(view);
    },
    
	gotoPartager:function (siteId) {
		var view = new PartagerMainView({siteId:siteId});
        appView.showView(view);
    },
    gotoLocate:function(){
		var view = new PartagerMapView();
        appView.showView(view);
    },

	gotoPalmares:function () {
		var view = new PalmaresMainView();
        appView.showView(view);
    },
    gotoPalmaresPhoto:function (photoId) {
		var view = new PalmaresPhotoView(photoId);
        appView.showView(view);
    },
    gotoSite:function(siteId){
    	var view = new DecouvrirSiteView({siteId:siteId});
        appView.showView(view);
    },
    gotoPhoto:function(siteId,photoId){
    	var view = new DecouvrirPhotoView({siteId:siteId,photoId:photoId});
        appView.showView(view);
    },
    gotoConcept:function () {
        var view = new ConceptView();
        appView.showView(view);
    },
    gotoLogin:function () {
        var view = new LoginView();
        appView.showView(view);
    },
    gotoRegister:function () {
        var view = new RegisterView();
        appView.showView(view);
    },
    gotoProfile:function () {
        var view = new InscriptionView();
        appView.showView(view);
    },
    gotoCGU:function () {
        var view = new CGUView();
        appView.showView(view);
    }
});

//la vue en cours, utilisé pour les cas de callback par événenements.
var currentView;

function onDeviceReady() {
	if(navigator.platform!="Win32"){
		navigator.splashscreen.show();
	}
    // alert("height:"+$(window).height()+": width"+$(window).width());
    // active la localisation du device.
    window.GeoWatcher.watch();

    appModel = new AppModel();
    
    // charge les templates et callback appTemplatesLoaded
    loadTemplates( appTemplatesLoaded );
}

/**
 * loads all remote data.
 */
function loadData(){
	// init filesystem.
	if(navigator.platform!="Win32"){
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
			function(theFileSystem){
				fileSystem = theFileSystem;
				console.log("fileSystem root :"+fileSystem.root.fullPath);
			}
		);
	};
	console.log("reloading data");
	// appModel.restore();
    loadSites(function(){
    	appModel.set("refreshTime", new Date().getTime())
    	appView.showView();
    });
    loadPhotoQualite();
    loadPhotoInsolite();
    loadPhotoTop();
    loadUserVotes(appModel.get('currentUser'));
    // refresh after load.
    appView.showView();
}

function refreshData(){
	// only loads data when last load > 1H.
	if(appModel.get("refreshTime")+3600000 > new Date().getTime())
		return;
	loadData();
}

function appTemplatesLoaded() {
    console.log( "VIEW TEMPLATES LOADED" );
    // démare le routage.
    appRouter = new Router();
	Backbone.history.start();
    
    // vue de démarrage
    var homeView = new HomeView({el:$("#contentView")}); 

    // charge tous les éléments nécéssaires.
    loadData();

    document.addEventListener('touchmove', function (e) { 
    	console.log("prevent default");
    	e.preventDefault(); 
    }, false);

    // back button.
    document.addEventListener("backbutton", function(){
    	window.history.back();
    }, false);

    //	resuming
    document.addEventListener('resume', function() {
    	// alert("resuming");
    	loadData();
    }, false);
    
    document.addEventListener("online", function() {
    	refreshData();
    }, false);
    
    if(navigator.platform!="Win32"){
    	// hide splashscreen
    	navigator.splashscreen.hide();
    }
}


document.addEventListener('deviceready', function() {
    onDeviceReady();
}, false);

$(function(){
	if(navigator.platform=="Win32"){
		onDeviceReady();		
	}
});