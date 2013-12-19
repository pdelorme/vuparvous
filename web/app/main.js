

var ViewManager = function( headerTarget, bodyTarget, footerTarget ){
	this.header = $( headerTarget );
	this.body   = $( bodyTarget );
	this.footer = $( footerTarget );	
	this.headerView = null; // le header en cours.
} 


ViewManager.prototype.updateHeaderView = function(headerView) {
	
}
ViewManager.prototype.updateView = function( viewDescriptor ) {
	this.body.html( viewDescriptor.view );
}


var Router = Backbone.Router.extend({

	initialize : function() {
		//alert('hello routes');
	},
	
	routes: {
		""				: "gotoHome",  
		"partager"		: "gotoPartager",  
		"site"			: "gotoPartager",  
		"site/:id"		: "gotoSite",  
		"decouvrir"		: "gotoDecouvrir", 
		"palmares"		: "gotoPalmares",
		"insolites"		: "gotoInsolites",
		"qualites"		: "gotoQualites",
		"tops"			: "gotoTops",
		"insolites/:id"	: "gotoInsolites",
		"qualites/:id"	: "gotoQualites",
		"tops/:id"		: "gotoTops"
	},

    gotoHome:function () {
        var view = new HomeView({el:$('#pageContainer')});
        //window.viewManager.updateView( view );
    },

    gotoDecouvrir:function () {
    	// alert("decouvrir");
    	var view = new DecouvrirMainView({el:$('#pageContainer')});
    	// window.viewManager.updateView( view );
    },

	gotoPartager:function () {
		var view = new PartageMainView({el:$('#pageContainer')});
	   	// ViewManager.prototype.updateView(view);
    },

	gotoPalmares:function () {
		var view = new PalmaresMainView({el:$('#pageContainer')});
		//window.viewManager.updateView( view );
    },
    gotoSite:function(siteId){
    	console.log("gotoSiteId");
    },
    
    gotoInsolites:function(photoId){
    	var view = new PalmaresListView(
    			{ el:$("#pageContainer"), 
    			  photos : appModel.get('photosInsolite'), 
    			  photoId:photoId, 
    			  score_property:'score_insolite'});
    },
    
    gotoQualites:function(photoId){
    	var view = new PalmaresListView(
    			{	el:$("#pageContainer"), 
    				photos : appModel.get('photosQualite'), 
    				photoId:photoId, 
    				score_property:'score_qualite'});
    },
    
    gotoTops:function(photoId){
    	var view = new PalmaresListView(
    			{	el:$("#pageContainer"), 
    				photos : appModel.get('photosTop'), 
    				photoId:photoId, 
    				score_property:'score_top'});
    }
});

var db;
var appRouter;
var headerView;
// var currentView;

$(function(){

	// init home page.
    currentView = new HomeView(); // {el: $('#pageHeader')}
    headerView = new HeaderView({el: $('#pageHeader')});
	
    
	// load templates
    console.log( "Loading templates" );
    // charge les templates et callback appTemplatesLoaded
    loadTemplates( appTemplatesLoaded );

});

loadSites();
loadPhotoQualite();
loadPhotoInsolite();
loadPhotoTop();
loadVotes();

function appTemplatesLoaded(){
    console.log( "Templates loaded" );
    window.viewManager = new ViewManager('#headerView', '#pageContainer', '#footerView' );	
	
    // démare le routage.
    appRouter = new Router();
	Backbone.history.start();

}