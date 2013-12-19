// les templates.
templates.partageHeaderView = "app/views/Partage/PartageHeaderView.html";
templates.partageListView = "app/views/Partage/PartageListView.html";

window.PartageHeaderView = Backbone.View.extend({
    initialize: function(options) {
        this.render();
        this.view = this.$el;
        initImageButtons(this.$el);
    },  
    
    events:{
    	"click #partageButton":"gotoPartage",
    	"click #mapButton":"gotoMap"
    },
    
    render:function (eventName) {
        var template = templates.partageHeaderView;
        this.$el.html(template);
    },
    
    gotoPartage:function(el, photoId){
    	el = $("#pageContainer");
    	view = new PartageMainView({el:el, photos : photosInsolite, photoId:photoId});
    },
    
    gotoMap:function(el, photoId){
    },
});


window.PartageMainView = BaseView.extend({

    initialize: function(options) {    	
    	// persists options
    	if(options) {
    		this.photoId = options.photoId;
    	}
    	
    	// login if necessary.
    	if(!appModel.get('currentUser').get('logged')){
    		var that = this;
    		var loginView = new LoginView(function(){
    			that.prepare();
    		});
    		return;
    	}
    	return this.prepare();
    },
    prepare : function(eventName){
    	this.photos=appModel.get('currentUser').get('photos');
    	var that = this;
    	if(this.photos === undefined) {
    		return loadUserPhotos(appModel.get('currentUser'),undefined,function(){
    			that.render()
    		});
    	}
    	if(!appModel.get('currentUser').get('photosLoaded')){
    		appModel.get('currentUser').on("change:photosLoaded", function(){
    			that.render()
    		});
    		return;
    	}
    	return this.render();
    },
    render: function (eventName){
    	currentView=this;
    	toggleImageButton($("#partagerButton img"), "on");
    	if(!appModel.get('currentUser').get('logged')){
    		return window.location="#";
    	}
    	if(this.photos && this.photos.length >  0){
	    	if(!this.photos)
	    		return;
	    	if(this.photoId){
		    	this.photo = this.photos.findWhere({id:this.photoId});
		    } else {
		    	this.photo = this.photos.at(0);
	    	}
	        // currentView=this;
	        this.renderLoggedView();
	        this.view = this.$el;
	        initImageButtons(this.$el);
    	} else {
    		this.renderEmptyView();
    	}
    },  
    
    events:{
    	"click .photoButton":"gotoPhoto"
    },    
    renderLoggedView:function (eventName) {
        var template = _.template(templates.partageListView);
        this.$el.html(template({photo:this.photo, photos:this.photos}));
        this.headerView = new PartageHeaderView({el:this.$el.find('#viewHeader')});
        this.refreshDetails(this.photo);
        setTimeout( function(){
        		$('.scrolltab').jScrollPane();
        	},
        0);

        return this;
    },
    
    renderEmptyView:function(enventName){
    	this.$el = $("<div>Aucune photos n'à été téléchargée</div>").dialog({
			autoOpen: true,
			resize: 'auto',
			//height: 260,
			width: 600,
			title:"Alerte",
			modal: true
		});
    	return this;
    },
    
    gotoPhoto:function(event){
    	target = event.currentTarget;
    	photoId = target.dataset.photoId;
    	this.photo = this.photos.findWhere({id:photoId});
    	this.refreshDetails(this.photo);
    },
    
    refreshDetails:function(photo){
    	$(".photo-selection").removeClass("selected");
        $('.photo-selection[data-photo-id='+photo.get('id')+']').addClass("selected");
    	$("#bigphoto").attr("src","/imagecache/big/data/images/"+photo.get('filename'));
    	$("#info-auteur").html(photo.get('auteur'));
    	$("#info-site-name").html(photo.get('site_name'));
    	$("#info-position").html();
    	$("#info-score-top").html(photo.get('score_qualite')+photo.get('score_insolite'));
    	$("#info-score-insolite").html(photo.get('score_insolite'));
    	$("#info-score-qualite").html(photo.get('score_qualite'));
    	$("#info-commentaire").html(photo.get('commentaire'));    	
    }
});

